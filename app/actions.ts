"use server";

import { submitOrderToSheet } from "@/lib/appsScript";
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
