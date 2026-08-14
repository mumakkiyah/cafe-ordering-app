"use client";

import { useState } from "react";
import type { CartLine, MenuItem, Settings, Variant } from "@/types";
import ItemImage from "@/components/ItemImage";
import { defaultVariant, formatMoney, hasVariants, priceForVariant } from "@/lib/pricing";

export default function ProductDetail({
  item,
  menu,
  settings,
  isOpen,
  onBack,
  onAdd,
  onSelectRelated,
}: {
  item: MenuItem;
  menu: MenuItem[];
  settings: Settings;
  isOpen: boolean;
  onBack: () => void;
  onAdd: (line: Omit<CartLine, "id">) => void;
  onSelectRelated: (item: MenuItem) => void;
}) {
  const defaults = { variant: defaultVariant(item), oatMilk: false, qty: 1 };
  const [variant, setVariant] = useState<Variant | null>(defaults.variant);
  const [oatMilk, setOatMilk] = useState(defaults.oatMilk);
  const [qty, setQty] = useState(defaults.qty);

  const clearSelection = () => {
    setVariant(defaults.variant);
    setOatMilk(defaults.oatMilk);
    setQty(defaults.qty);
  };

  const unitPrice = priceForVariant(item, variant) + (oatMilk ? settings.oatMilkAddOnPrice : 0);
  const lineTotal = unitPrice * qty;

  const related = menu
    .filter((m) => m.category === item.category && m.name !== item.name)
    .slice(0, 4);

  const handleAdd = () => {
    onAdd({
      name: item.name,
      variant,
      addOns: oatMilk ? ["Oat Milk"] : [],
      qty,
      unitPrice,
      lineTotal,
    });
    onBack();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back
      </button>

      <div className="grid gap-6 sm:grid-cols-2">
        <ItemImage
          src={`/menu/${item.imageFilename}`}
          alt={item.name}
          className="aspect-square w-full rounded-xl object-cover"
        />

        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900">{item.name}</h1>
          <p className="mt-2 text-stone-600">{item.description}</p>

          {item.soldOut ? (
            <p className="mt-6 rounded-lg bg-stone-100 px-4 py-3 text-sm font-medium text-stone-600">
              This item is sold out right now.
            </p>
          ) : (
            <>
              {hasVariants(item) && (
                <div className="mt-6">
                  {(["Hot", "Cold"] as Variant[])
                    .filter((v) => (v === "Hot" ? item.hotPrice != null : item.coldPrice != null))
                    .map((v) => (
                      <label
                        key={v}
                        className="flex cursor-pointer items-center justify-between border-b border-stone-200 py-3 last:border-b-0"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="variant"
                            checked={variant === v}
                            onChange={() => setVariant(v)}
                          />
                          {v}
                        </span>
                        <span className="font-medium">{formatMoney(priceForVariant(item, v))}</span>
                      </label>
                    ))}
                </div>
              )}

              {item.oatMilkAvailable && (
                <label className="flex cursor-pointer items-center justify-between border-b border-stone-200 py-3">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={oatMilk} onChange={(e) => setOatMilk(e.target.checked)} />
                    Oat Milk
                  </span>
                  <span className="font-medium">+{formatMoney(settings.oatMilkAddOnPrice)}</span>
                </label>
              )}

              <div className="mt-6 flex items-center justify-between">
                <span className="font-medium text-stone-900">Quantity</span>
                <div className="flex items-center gap-3 rounded-full border border-stone-300 px-3 py-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="text-lg font-medium text-stone-600"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-4 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="text-lg font-medium text-stone-600"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={clearSelection}
                className="mt-4 text-sm text-stone-500 underline hover:text-stone-700"
              >
                Clear selection
              </button>

              {!isOpen ? (
                <p className="mt-6 rounded-lg bg-stone-100 px-4 py-3 text-sm font-medium text-stone-600">
                  We&apos;re closed right now — check back during opening hours to order.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-6 flex w-full items-center justify-between rounded-full bg-[#9c6f43] px-6 py-3 font-medium text-white hover:bg-[#855e39]"
                >
                  <span>Add</span>
                  <span>{formatMoney(lineTotal)}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-stone-900">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => onSelectRelated(r)}
                className="text-left"
              >
                <ItemImage
                  src={`/menu/${r.imageFilename}`}
                  alt={r.name}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <div className="mt-1 truncate text-sm font-medium text-stone-900">{r.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
