# PRD: Weekend Cafe Ordering App

**Owner:** Makkiyah
**Status:** Ready for build
**Last updated:** 2026-08-13

## 1. Summary

A single-page web app for a home-based weekend cafe that lets customers browse the menu, build an order, identify themselves, pay via a static PayNow QR code, and self-confirm payment. Confirmed orders are logged to a Google Sheet and trigger a Telegram notification to the owner. No login, no database, no payment gateway — deliberately minimal so it can be built fast and hosted for free.

## 2. Goals / Non-Goals

**Goals**
- Let customers place an order without the owner manually taking it down
- Remove payment-gateway fees and integration complexity by using a static PayNow QR + honor-system confirmation
- Give the owner a single source of truth (Google Sheet) for all orders, with zero manual entry
- Notify the owner immediately via Telegram when an order comes in
- Zero hosting cost, minimal moving parts, easy for a non-engineer to maintain (menu lives in a Sheet)

**Non-Goals**
- No real payment verification/reconciliation (this is trust-based, like a physical PayNow QR at a stall)
- No customer accounts, login, or order history for customers
- No order status tracking/updates back to the customer (e.g. "preparing", "ready")
- No inventory/stock deduction logic beyond a manual sold-out flag
- No multi-cafe / multi-tenant support

## 3. User Flow

```
1. Customer opens the app link (shared via Instagram/WhatsApp/etc.)
2. Landing page loads:
     - Hero section: cafe name, description, logo, location, opening hours/days,
       payment note, and a live Open/Closed badge (all pulled from the "Settings" tab)
     - Menu grid loads (pulled live from the "Menu" tab), grouped by category
3. Customer taps a menu item to open its Product Detail view:
     - Sees image, description, and price (or price range if it has Hot/Cold variants)
     - Selects variant (Hot/Cold) if applicable — price updates accordingly
     - Selects Oat Milk add-on if available for that item — price updates accordingly
     - Can tap "Clear selection" to reset variant/add-on/quantity before adding
     - Adjusts quantity, taps "Add" to add to cart
     - Can tap "Back" to return to the menu grid without adding
     - Sees "You may also like" — a few other items from the same category
4. Customer repeats step 3 for more items; a cart indicator shows running item count
5. Customer proceeds to checkout, enters:
     - Name
     - Phone number
6. App shows:
     - Static PayNow QR code image
     - Total amount to pay
7. Customer pays externally via their banking app, then clicks "I've Paid"
8. App:
     - Generates an order number
     - Submits order (order #, name, phone, items incl. variant/add-on, quantities,
       amount, timestamp) to a Google Apps Script Web App endpoint
9. Apps Script:
     - Appends a row to the "Orders" tab
     - Sends a Telegram notification to the owner
10. Customer sees a thank-you/confirmation screen with:
     - Order number
     - Order summary (items, quantities, amount, timestamp)
     - Screenshot-friendly layout to serve as their own receipt
```

## 4. Functional Requirements

### 4.1 Landing Page / Hero
- Hero section displays, all sourced from the "Settings" tab of the Google Sheet so the owner can update copy/hours without a redeploy:
  - Cafe name, tagline/description, logo image
  - Location + pickup note (e.g. "order and pick-up at lift lobby")
  - Opening days + hours
  - Payment note (e.g. "100% Cashless via personal PayNow/PayLah!")
  - Instagram handle, shown with an Instagram icon, linking to `instagram.com/<handle>`
  - Google review link, shown with a Google icon ("Leave us a review"), linking to the owner's Google review URL — hidden if not configured
  - A live **Open / Closed** badge, computed from the current day/time against the configured opening days/hours
- Below the hero, the menu is shown as a grid grouped by category (e.g. "Espresso Coffee"), each item as a card with image, name, short description, and price (or price range if it has Hot/Cold variants).
- **Ordering is disabled outside configured opening hours/days.** When "Closed":
  - The Open/Closed badge shows "Closed"
  - Menu is still browsable (items and prices visible) but "Add"/checkout controls are disabled, with a short message (e.g. "We're closed right now — back Saturday 8AM") in place of the Add button on the detail page
  - The open/closed check is based on the visitor's local time compared against `Settings.OpeningDays/OpeningTime/ClosingTime` (client-side check; no server-side enforcement needed given the honor-system, low-stakes nature of the app)

### 4.2 Menu Display
- Menu items are read from the "Menu" tab of the Google Sheet (see §6 Data Model for columns: name, category, description, image, pricing, Oat Milk availability, sold-out flag).
- App fetches menu + settings on page load (or via a lightweight cached API route) — no hardcoded content in code, so the owner can edit the Sheet directly without a redeploy.
- Items marked `Sold Out` are shown but disabled/greyed out on both the grid and detail page — not addable to cart.

### 4.3 Product Detail Page
- Tapping a menu card opens a detail view (can be a route or an overlay — whichever is simpler to build in Next.js) showing:
  - Item image, name, description
  - Price, or a price range (e.g. "$3.50 - $4.00") if the item has Hot/Cold variants
  - **Variant selection** (Hot / Cold), shown only for items that have it, as radio buttons with each option's price
  - **Oat Milk add-on**, shown only for items flagged as offering it in the Menu sheet, as a checkbox with a fixed extra price (the price itself lives once in the Settings tab, since it's the same wherever it's offered)
  - Quantity stepper (+/-)
  - A "Clear selection" control that resets variant, add-on, and quantity back to defaults
  - "Add" button showing the live computed price for the current selection
  - "Back" button returning to the menu grid, discarding any unsaved selection on this item
  - "You may also like": 3-4 other items from the same category, tappable to open their own detail page

### 4.4 Cart
- Each cart line reflects the specific selection made on the detail page: item, variant (if any), add-on (if selected), quantity, and computed line price.
- Customer can hold multiple distinct lines, including the same base item added twice with different variants (e.g. one Hot Latte + one Iced Latte).
- Running subtotal updates live as cart changes.
- Cart persists in local component state only (no persistence across reloads needed — reloading = start over, which is fine for this use case).

### 4.5 Customer Details
- Before showing the QR, collect:
  - Name (required, free text)
  - Phone number (required, basic format validation — digits only, reasonable length)
- No account creation, no OTP/verification of the phone number.

### 4.6 Payment (Static PayNow QR)
- A single static PayNow QR code image (provided by the owner, e.g. downloaded from their banking app) is displayed with the order total shown alongside it.
- Customer pays manually in their own banking app, then returns to the ordering app and taps "I've Paid" to confirm.
- The app does **not** verify payment in any way — this is an honor-system flow, same as a physical QR stand at a stall.

### 4.7 Order Submission
- On "I've Paid," the app:
  1. Generates an order number (see 4.8)
  2. Builds a payload, e.g.:
     `{ orderNumber, name, phone, items: [{name, variant, addOns, qty, unitPrice, lineTotal}], amount, timestamp }`
  3. POSTs the payload to a Google Apps Script Web App URL (stored as an env var in Vercel)
- Apps Script (running under the owner's Google account, free tier):
  - Appends one row per **order** to the "Orders" tab, with items flattened into a readable summary string, e.g. `"2x Americano (Hot, +Oat Milk), 1x Latte (Iced)"`
  - Sends a message to the owner's Telegram via the Telegram Bot API (`UrlFetchApp` call to `sendMessage`), with the order details in the text
- If the request fails (e.g. network issue), the app shows an error and lets the customer retry the submission without re-entering their details or re-paying.

### 4.8 Order Numbering
- Order number is a sequential integer that **resets daily**: the first order each day is `#1`, incrementing from there, restarting at `#1` again the next day.
- Apps Script computes this on submission: read the timestamp of the last row in the Orders sheet — if its date matches today's date, increment its order number by 1; otherwise (first order of a new day, or empty sheet), start at 1.

### 4.9 Confirmation Screen
- After successful submission, show:
  - "Thank you! Order #{orderNumber} confirmed."
  - Order summary: items, quantities, amount, timestamp
  - A note that this screen can be screenshotted as their receipt
- No page navigation needed after this — customer can close the tab or start a new order.

## 5. Non-Functional Requirements

- **Hosting:** Vercel free tier (Next.js or similar lightweight framework recommended for easy Vercel deploy).
- **Cost:** $0 — no paid APIs, no database, no payment gateway fees. Google Sheets + Apps Script are free within normal personal-use volume.
- **Performance:** Trivial load (weekend home-cafe scale — expect tens of orders per session, not thousands). No caching/scaling concerns beyond basic sanity.
- **Devices:** Must work well on mobile web (primary use case — customers ordering from their phones), responsive layout.
- **Browser support:** Modern mobile/desktop browsers (Safari iOS, Chrome Android/Desktop). No IE/legacy support needed.
- **Reliability:** If Google Sheets/Apps Script is briefly unavailable, the customer should see a clear error and be able to retry — never silently lose an order.

## 6. Data Model

Three separate Google Sheets (not tabs within one file), each with a single tab. The Apps Script Web App has access to all three by their individual Sheet IDs.

### Sheet: "Cafe Settings"

**Tab: Settings** (key-value, so new fields can be added without code changes)
| Key | Value |
|---|---|
| CafeName | The Coffee Moose |
| Description | Canadian Techie by week, home barista by weekend! Fresh specialty coffee at BLK 810, Jurong West. Sat & Sun, 8AM-1PM. |
| Location | Blk 810, Jurong West St 81 |
| LocationNote | order and pick-up at lift lobby |
| OpeningDays | Saturday,Sunday |
| OpeningTime | 08:00 |
| ClosingTime | 12:00 |
| PaymentNote | 100% Cashless via personal PayNow/PayLah! |
| OatMilkAddOnPrice | 0.80 |
| InstagramHandle | thecoffeemoose |
| GoogleReviewLink | (link to leave a Google review) |

- Logo and PayNow QR images are static files in `/public` for v1 (not Sheet fields — see §7 Architecture).

### Sheet: "Cafe Menu"

**Tab: Menu**
| Item Name | Category | Description | Image Filename | Price | Hot Price | Cold Price | Oat Milk Available | Sold Out |
|---|---|---|---|---|---|---|---|---|
| Americano | Espresso Coffee | A crisp, robust shot of double espresso... | americano.jpg | | 3.50 | 4.00 | Y | N |
| Kaya Toast | Food | Toasted bread with house-made kaya... | kaya-toast.jpg | 3.50 | | | N | N |

- If `Hot Price`/`Cold Price` are blank, the item is single-priced from `Price` and no variant selector is shown.
- `Oat Milk Available` (Y/N) controls whether the add-on toggle appears on that item's detail page; its price is read once from `Settings.OatMilkAddOnPrice`.
- `Image Filename` maps to a static file the app expects to find in `/public` (e.g. `/public/menu/americano.jpg`) — the owner adds new item photos to the codebase, not the Sheet, for v1.

### Sheet: "Cafe Orders"

**Tab: Orders**
| Order # | Timestamp | Name | Phone | Items | Amount |
|---|---|---|---|---|---|
| 1 | 2026-08-13 10:32 | Jane Tan | 91234567 | 2x Americano (Hot, +Oat Milk), 1x Kaya Toast | 11.50 |
| 2 | 2026-08-13 10:41 | Wei Ling | 98765432 | 1x Latte (Hot) | 4.00 |
| 1 | 2026-08-14 08:15 | Sam Koh | 91112222 | 1x Espresso | 3.50 |

- `Items` stored as a single readable text string for simplicity — no need to normalize into separate rows since there's no downstream reporting requirement beyond eyeballing the sheet.
- `Order #` resets to 1 each new calendar date (see §4.8) — note it is **not** a unique key on its own across days; `Order # + Timestamp date` together identify an order uniquely.

## 7. Architecture Overview

```
[Customer's browser]
       |
       v
[Next.js app on Vercel]  ---- GET ?action=settings ---->  [Google Apps Script Web App]
       |                  ---- GET ?action=menu     ---->        |
       |                                                          +--> reads "Cafe Settings" sheet (by ID)
       |                                                          +--> reads "Cafe Menu" sheet (by ID)
       |
       ---- POST order --->  [Google Apps Script Web App]
                                    |
                                    +--> reads/appends row in "Cafe Orders" sheet (by ID)
                                    +--> sends message via Telegram Bot API to owner
```

- **Frontend + minimal API route:** Next.js app, deployed on Vercel free tier.
- **Backend logic:** A single Google Apps Script Web App (deployed as "Execute as: Me", "Who has access: Anyone"), acting as the only integration point with Google Sheets and the Telegram Bot API. It opens all three spreadsheets by their individual Sheet IDs (`SpreadsheetApp.openById(...)`) rather than reading tabs from one file. Keeps Vercel side free of service-account credentials.
- **Order notifications:** Sent via a Telegram bot (created through [@BotFather](https://t.me/BotFather), free) instead of email. Apps Script calls the Telegram Bot API's `sendMessage` endpoint with `UrlFetchApp.fetch`, using a bot token and the owner's chat ID stored as Script Properties (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
- **Menu + settings reads:** Same Apps Script endpoint, via GET actions (`?action=menu`, `?action=settings`) returning JSON — avoids needing Google Sheets API keys/service account in Vercel entirely.
- **Secrets:** The Apps Script Web App URL, and the three Sheet IDs, are stored as Vercel environment variables / Apps Script script properties, not hardcoded in the repo.
- **Images (menu photos, logo, PayNow QR):** static image files committed into the repo's `/public` folder for v1, referenced in code by filename — not read from the Sheet. Updating an image (new item photo, new QR) means adding/replacing the file and redeploying (Vercel auto-deploys on push, so this is quick, just not Sheet-editable). Sheet-driven image management can be revisited post-v1 if this becomes a hassle.

## 8. Out of Scope / Future Considerations
(Not building now — listed so we don't accidentally scope-creep)

- Real-time order status updates to customers
- Admin dashboard (owner uses the raw Google Sheet directly)
- Payment verification / auto-reconciliation
- SMS notifications
- Multiple cafes / vendors
- Order editing/cancellation after submission
- Analytics/reporting beyond the raw Sheet

## 9. Confirmed Decisions
- **Currency:** SGD
- **Order numbering:** Resets daily (first order each day is `#1`)
- **Spreadsheets:** Three separate Google Sheets — "Cafe Settings", "Cafe Menu", "Cafe Orders" — not tabs within one file
- **Opening hours:** Ordering is disabled outside configured hours/days; menu remains browsable
- **Owner notifications:** Sent via Telegram (bot message), not email
- **Social:** Instagram handle shown in the hero with an Instagram icon, linking to the profile
