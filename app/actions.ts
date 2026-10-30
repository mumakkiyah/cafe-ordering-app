"use server";

// [TCM-FIX-001] Added getMenu for live availability validation.
import { submitOrderToSheet, getMenu } from "@/lib/appsScript";
import type { OrderPayload, OrderResult } from "@/types";

export async function submitOrder(payload: OrderPayload): Promise<OrderResult> {
  if (!payload.name?.trim() || !payload.phone?.trim() || !payload.items?.length) {
    return { success: false, error: "Missing required order details." };
  }
  try {
    return await submitOrderToSheet(payload);
  } catch {
    return { success: false, error: "Couldn't reach the order system. Please try again." };
  }
}

/**
 * [TCM-FIX-001] START
 * Purpose: Check current menu availability before payment.
 * Uses the live Google Sheets menu, not cached menu data.
 */
export async function checkCartAvailability(
  itemNames: string[]
): Promise<{
  success: boolean;
  unavailable: string[];
  error?: string;
}> {
  // Do not use mock data for availability validation.
  if (!process.env.APPS_SCRIPT_URL) {
    return {
      success: false,
      unavailable: [],
      error: "Menu availability is temporarily unavailable.",
    };
  }

  if (!itemNames.length) {
    return {
      success: false,
      unavailable: [],
      error: "Your cart is empty.",
    };
  }

  try {
    const menu = await getMenu();

    // [TCM-FIX-001] Fail closed if the menu response is invalid.
    if (!Array.isArray(menu)) {
      throw new Error("Invalid menu response");
    }

    const unavailable = [...new Set(itemNames)].filter((name) => {
      const item = menu.find((m) => m.name === name);
      return !item || item.soldOut;
    });

    return {
      success: true,
      unavailable,
    };
  } catch {
    return {
      success: false,
      unavailable: [],
      error: "Couldn't check availability. Please try again.",
    };
  }
}
// [TCM-FIX-001] END
