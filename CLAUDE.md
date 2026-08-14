@AGENTS.md

# CLAUDE.md

Guidance for Claude Code when working in this repo. See [PRD.md](PRD.md) for full product requirements.

## What this is

A single-page ordering app for a home-based weekend cafe. Customer browses menu → builds cart → enters name/phone → pays via static PayNow QR → self-confirms "I've Paid" → order is logged to Google Sheets + owner gets a Telegram notification. No login, no database, no payment gateway.

## Tech stack

- **Frontend:** Next.js, deployed on Vercel (free tier)
- **Backend logic:** Google Apps Script Web App — single script, deployed as "Execute as: Me" / "Who has access: Anyone". Reads/writes three separate Google Sheets by ID ("Cafe Settings", "Cafe Menu", "Cafe Orders") and notifies the owner via the Telegram Bot API
- **Data store:** Google Sheets only — no database of any kind
- **Images:** static files in `/public`, referenced by filename from the Menu sheet — not hosted externally, not read from the Sheet as URLs
- **Auth:** none — no accounts, no login, anywhere
- **Payment:** static PayNow QR image + honor-system "I've Paid" confirmation — no payment gateway, no verification

## Ground rules

1. **Free-tier only.** Every service used (Vercel, Google Sheets, Apps Script, Telegram) must stay within its free tier for expected volume (tens of orders per weekend). Don't introduce anything with a paid plan as the default or only option.
2. **Avoid unnecessary dependencies.** Reach for what Next.js/the browser already gives you before adding an npm package. Before adding any dependency, ask whether the same result is achievable in a few lines of plain code — if yes, don't add it.
3. **Simple over clever.** This is a small app for one person's weekend cafe, not a platform. Prefer the obvious, boring implementation over abstractions, config layers, or patterns that anticipate future scale/features this PRD doesn't call for.
4. **No database, no login — ever, without an explicit decision to change scope.** If a task seems to need one, that's a sign to reconsider the approach, not to add one quietly.
5. **Sheet-driven content stays Sheet-driven.** Menu items, pricing, and cafe settings (hours, description, etc.) must come from the Google Sheets at runtime, not be hardcoded — that's the whole point of the Sheets integration for a non-engineer owner to maintain.
6. **Match the PRD.** If an implementation detail isn't covered by [PRD.md](PRD.md), flag it and ask rather than assuming — don't quietly expand scope.
