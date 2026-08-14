import type { MenuItem, Variant } from "@/types";

export function hasVariants(item: MenuItem): boolean {
  return item.hotPrice != null || item.coldPrice != null;
}

export function defaultVariant(item: MenuItem): Variant | null {
  if (!hasVariants(item)) return null;
  return item.hotPrice != null ? "Hot" : "Cold";
}

export function priceForVariant(item: MenuItem, variant: Variant | null): number {
  if (variant === "Hot" && item.hotPrice != null) return item.hotPrice;
  if (variant === "Cold" && item.coldPrice != null) return item.coldPrice;
  return item.price ?? 0;
}

export function priceRangeLabel(item: MenuItem): string {
  if (!hasVariants(item)) return formatMoney(item.price ?? 0);
  const prices = [item.hotPrice, item.coldPrice].filter((p): p is number => p != null);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatMoney(min) : `${formatMoney(min)} - ${formatMoney(max)}`;
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
