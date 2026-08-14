# Cafe Ordering App

See [PRD.md](PRD.md) for the full product spec and [CLAUDE.md](CLAUDE.md) for tech stack/ground rules.

## One-time setup

### 1. Node.js

Install Node.js LTS from [nodejs.org](https://nodejs.org) if you haven't already. Confirm with:

```bash
node -v
npm -v
```

### 2. Create the three Google Sheets

Create three separate Google Sheets (not tabs in one file):

**"Cafe Settings"** — one tab named `Settings`, columns `Key | Value`:

| Key | Value |
|---|---|
| CafeName | The Coffee Moose |
| Description | Canadian Techie by week, home barista by weekend!... |
| Location | Blk 810, Jurong West St 81 |
| LocationNote | order and pick-up at lift lobby |
| OpeningDays | Saturday,Sunday |
| OpeningTime | 08:00 |
| ClosingTime | 12:00 |
| PaymentNote | 100% Cashless via personal PayNow/PayLah! |
| OatMilkAddOnPrice | 0.80 |
| InstagramHandle | thecoffeemoose |
| GoogleReviewLink | (link to leave a Google review) |

**"Cafe Menu"** — one tab named `Menu`, columns: `Item Name | Category | Description | Image Filename | Price | Hot Price | Cold Price | Oat Milk Available | Sold Out`
- Leave `Price` blank if the item has Hot/Cold variants; leave `Hot Price`/`Cold Price` blank if it's single-priced.
- `Image Filename` should match a file you place in `/public/menu/` (e.g. `americano.jpg`).
- `Oat Milk Available` and `Sold Out` are `Y`/`N`.

**"Cafe Orders"** — one tab named `Orders`, columns: `Order # | Timestamp | Name | Phone | Items | Amount` (header row only — the app appends rows here, don't fill in data manually).

Grab each spreadsheet's ID from its URL (`https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`).

### 3. Create a Telegram bot for order notifications

1. In Telegram, message [@BotFather](https://t.me/BotFather) → `/newbot` → follow the prompts (name it anything, e.g. "Coffee Moose Orders"). It replies with a **bot token** — save it.
2. Start a chat with your new bot (search its username, send it any message, e.g. "hi") so it's allowed to message you back.
3. Get your **chat ID**: visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` in a browser (replace `<YOUR_BOT_TOKEN>`) right after sending the bot a message — look for `"chat":{"id":...}` in the response. That number is your chat ID.

### 4. Deploy the Apps Script backend

1. Go to [script.google.com](https://script.google.com) → New project.
2. Delete the default code, paste in the contents of [google-apps-script/Code.gs](google-apps-script/Code.gs).
3. Project Settings → Script Properties → add:
   - `SETTINGS_SHEET_ID` — the "Cafe Settings" spreadsheet ID
   - `MENU_SHEET_ID` — the "Cafe Menu" spreadsheet ID
   - `ORDERS_SHEET_ID` — the "Cafe Orders" spreadsheet ID
   - `TELEGRAM_BOT_TOKEN` — the bot token from step 3
   - `TELEGRAM_CHAT_ID` — the chat ID from step 3
4. Deploy → New deployment → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize the requested permissions (Sheets access) when prompted.
6. Copy the deployment's Web App URL — you'll need it as `APPS_SCRIPT_URL` in the Next.js app's environment variables.

To update the script later without changing the URL: **Deploy → Manage deployments → (pencil/edit icon) → Version: New version → Deploy**. Using "New deployment" instead generates a different URL, which you'd need to update everywhere it's used.

### 5. Configure the Next.js app

```bash
cp .env.local.example .env.local
```

Fill in `APPS_SCRIPT_URL` with the Web App URL from step 4.

### 6. Add images

- `/public/hero.png` — the hero banner graphic (brand illustration; no logo overlay needed)
- `/public/paynow-qr.png` (or matching extension) — your PayNow QR screenshot
- `/public/menu/<filename>` — menu item photos, named to match the `Image Filename` column in the Cafe Menu sheet

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploying

Push this repo to GitHub, then import it into [Vercel](https://vercel.com) (free tier). Set the `APPS_SCRIPT_URL` environment variable in the Vercel project settings to match your `.env.local`. Every push to the main branch auto-deploys.
