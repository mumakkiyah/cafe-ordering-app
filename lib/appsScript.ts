import type { MenuItem, OrderPayload, OrderResult, Settings } from "@/types";
import { mockMenu, mockSettings } from "@/lib/mockData";

// Server-only: reads/writes the Google Sheets backend via the Apps Script
// Web App. If APPS_SCRIPT_URL isn't configured yet, falls back to mock data
// so the app is browsable locally before the Sheets backend is deployed.
// See README.md for deployment steps.

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

// Forgiving of whatever the owner pastes in the Sheet: a bare handle
// ("thecoffeemoose"), a leading "@", or a full profile URL.
function parseInstagramHandle(value: string): string {
  const trimmed = value.trim();
  const urlMatch = trimmed.match(/instagram\.com\/([^/?#]+)/i);
  const handle = urlMatch ? urlMatch[1] : trimmed;
  return handle.replace(/^@/, "");
}

function parseSettings(raw: Record<string, string>): Settings {
  return {
    cafeName: raw.CafeName ?? "",
    description: raw.Description ?? "",
    location: raw.Location ?? "",
    locationNote: raw.LocationNote ?? "",
    openingDays: (raw.OpeningDays ?? "").split(",").map((d) => d.trim()).filter(Boolean),
    openingTime: raw.OpeningTime ?? "00:00",
    closingTime: raw.ClosingTime ?? "23:59",
    paymentNote: raw.PaymentNote ?? "",
    oatMilkAddOnPrice: Number(raw.OatMilkAddOnPrice ?? 0),
    instagramHandle: raw.InstagramHandle ? parseInstagramHandle(raw.InstagramHandle) : "",
    googleReviewLink: raw.GoogleReviewLink ?? "",
  };
}

export async function getSettings(): Promise<Settings> {
  if (!APPS_SCRIPT_URL) {
    console.warn("[appsScript] APPS_SCRIPT_URL not set — using mock settings. See README.md.");
    return mockSettings;
  }
  const res = await fetch(`${APPS_SCRIPT_URL}?action=settings`, { cache: "no-store" });
  const raw = await res.json();
  return parseSettings(raw);
}

export async function getMenu(): Promise<MenuItem[]> {
  if (!APPS_SCRIPT_URL) {
    console.warn("[appsScript] APPS_SCRIPT_URL not set — using mock menu. See README.md.");
    return mockMenu;
  }
  const res = await fetch(`${APPS_SCRIPT_URL}?action=menu`, { cache: "no-store" });
  return res.json();
}

let mockOrderCounter = 0;
let mockOrderCounterDate = "";

export async function submitOrderToSheet(payload: OrderPayload): Promise<OrderResult> {
  if (!APPS_SCRIPT_URL) {
    console.warn("[appsScript] APPS_SCRIPT_URL not set — simulating order submission. See README.md.");
    const today = new Date().toDateString();
    if (today !== mockOrderCounterDate) {
      mockOrderCounter = 0;
      mockOrderCounterDate = today;
    }
    mockOrderCounter += 1;
    return { success: true, orderNumber: mockOrderCounter, timestamp: new Date().toISOString() };
  }

  // Apps Script's POST redirect hop is occasionally slow. Without a bound,
  // a slow response leaves the request hanging with no feedback until the
  // customer retries — better to fail fast with a clear, retryable error.
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
    return await res.json();
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { success: false, error: "The order system took too long to respond. Please try again." };
    }
    return { success: false, error: "Couldn't reach the order system. Please try again." };
  }
}
