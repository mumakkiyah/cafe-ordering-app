/**
 * Cafe ordering app — Google Apps Script backend.
 *
 * Standalone Apps Script project (not bound to any single spreadsheet).
 * Reads/writes three separate Google Sheets by ID, set as Script Properties:
 *   SETTINGS_SHEET_ID, MENU_SHEET_ID, ORDERS_SHEET_ID,
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *
 * Deploy as Web App: Execute as "Me", Who has access "Anyone".
 * See README.md for full setup steps.
 */

function getProp_(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) throw new Error('Missing script property: ' + key);
  return value;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Settings ----

// Google Sheets auto-detects values like "08:00" as time cells and stores
// them internally as Date objects (serialized to a weird 1899-12-30 ISO
// timestamp), regardless of how the cell displays. Normalize those back to
// a plain "HH:mm" string so the app doesn't need the owner to fight Sheets'
// autoformatting.
function normalizeSettingValue_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm');
  }
  return value;
}

function getSettings_() {
  var sheet = SpreadsheetApp.openById(getProp_('SETTINGS_SHEET_ID')).getSheetByName('Settings');
  var rows = sheet.getDataRange().getValues(); // [ [Key, Value], ... ] including header
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    var key = rows[i][0];
    var value = rows[i][1];
    if (key) settings[key] = normalizeSettingValue_(value);
  }
  return settings;
}

// ---- Menu ----

function getMenu_() {
  var sheet = SpreadsheetApp.openById(getProp_('MENU_SHEET_ID')).getSheetByName('Menu');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0]; // Item Name | Category | Description | Image Filename | Price | Hot Price | Cold Price | Oat Milk Available | Sold Out
  var items = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue; // skip blank rows
    items.push({
      name: row[0],
      category: row[1],
      description: row[2],
      imageFilename: row[3],
      price: row[4] === '' ? null : Number(row[4]),
      hotPrice: row[5] === '' ? null : Number(row[5]),
      coldPrice: row[6] === '' ? null : Number(row[6]),
      oatMilkAvailable: String(row[7]).toUpperCase() === 'Y',
      soldOut: String(row[8]).toUpperCase() === 'Y'
    });
  }
  return items;
}

// ---- Orders ----

function getNextOrderNumber_(sheet, now) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1; // only header row, or empty

  var lastOrderNumber = sheet.getRange(lastRow, 1).getValue();
  var lastTimestamp = new Date(sheet.getRange(lastRow, 2).getValue());

  var sameDay = lastTimestamp.getFullYear() === now.getFullYear() &&
    lastTimestamp.getMonth() === now.getMonth() &&
    lastTimestamp.getDate() === now.getDate();

  return sameDay ? Number(lastOrderNumber) + 1 : 1;
}

function buildItemsSummary_(items) {
  return items.map(function (item) {
    var extras = [];
    if (item.variant) extras.push(item.variant);
    if (item.addOns && item.addOns.length) {
      item.addOns.forEach(function (addOn) { extras.push('+' + addOn); });
    }
    var extrasText = extras.length ? ' (' + extras.join(', ') + ')' : '';
    return item.qty + 'x ' + item.name + extrasText;
  }).join(', ');
}

function formatTimestamp_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
}

// Prevents spreadsheet formula injection: Sheets treats a cell starting
// with =, +, -, or @ as a formula. Customer-supplied text (name, phone,
// item names from a direct API call) must never be allowed to trigger
// that — prefixing with an apostrophe forces Sheets to treat it as plain
// text, matching Sheets' own "force text" convention.
function sanitizeForSheet_(value) {
  var text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function submitOrder_(payload) {
  if (!payload.name || !payload.phone || !payload.items || !payload.items.length || !payload.amount) {
    throw new Error('Missing required order fields');
  }

  var sheet = SpreadsheetApp.openById(getProp_('ORDERS_SHEET_ID')).getSheetByName('Orders');
  var now = new Date();
  var orderNumber = getNextOrderNumber_(sheet, now);
  var timestampText = formatTimestamp_(now);
  var itemsSummary = buildItemsSummary_(payload.items);

  sheet.appendRow([
    orderNumber,
    timestampText,
    sanitizeForSheet_(payload.name),
    sanitizeForSheet_(payload.phone),
    sanitizeForSheet_(itemsSummary),
    payload.amount
  ]);

  // The order is already saved at this point — a notification failure
  // must never cause the app to report the order itself as failed to the
  // customer (they'd retry and create a duplicate row).
  try {
    sendOwnerNotification_(orderNumber, timestampText, payload, itemsSummary);
  } catch (err) {
    Logger.log('Telegram notification failed: ' + err.message);
  }

  return { orderNumber: orderNumber, timestamp: timestampText };
}

// Telegram auto-links anything that looks like a URL or bare domain (e.g.
// "evil.com" with no scheme), even in plain messages with no parse_mode
// set. Customer-supplied text (name, phone, item names from a direct API
// call) must never render as a clickable link in a notification you might
// tap without thinking — breaking every "." defuses both full URLs and
// bare domains, since neither can be recognized without an intact TLD.
function defangForTelegram_(value) {
  return String(value).replace(/\./g, '[.]').replace(/:\/\//g, ':/ /');
}

function sendOwnerNotification_(orderNumber, timestampText, payload, itemsSummary) {
  var botToken = getProp_('TELEGRAM_BOT_TOKEN');
  var chatId = getProp_('TELEGRAM_CHAT_ID');
  var text = [
    'New order #' + orderNumber,
    '',
    'Time: ' + timestampText,
    'Name: ' + defangForTelegram_(payload.name),
    'Phone: ' + defangForTelegram_(payload.phone),
    'Items: ' + defangForTelegram_(itemsSummary),
    'Amount: ' + payload.amount
  ].join('\n');

  var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  Logger.log('Telegram response: ' + code + ' ' + response.getContentText());
  if (code !== 200) {
    throw new Error('Telegram API returned ' + code + ': ' + response.getContentText());
  }
}

// ---- HTTP handlers ----

function doGet(e) {
  var action = e.parameter.action;
  try {
    if (action === 'settings') return jsonOutput_(getSettings_());
    if (action === 'menu') return jsonOutput_(getMenu_());
    return jsonOutput_({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOutput_({ error: err.message });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var result = submitOrder_(payload);
    return jsonOutput_({ success: true, orderNumber: result.orderNumber, timestamp: result.timestamp });
  } catch (err) {
    return jsonOutput_({ success: false, error: err.message });
  }
}
