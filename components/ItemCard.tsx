import type { MenuItem } from "@/types";
import ItemImage from "@/components/ItemImage";
import { priceRangeLabel } from "@/lib/pricing";

export default function ItemCard({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <button
      type="button"
      disabled={item.soldOut}
      onClick={() => onSelect(item)}
      className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-stone-50 disabled:opacity-50"
    >
      <ItemImage
        src={`/menu/${item.imageFilename}`}
        alt={item.name}
        className="h-16 w-16 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900">{item.name}</span>
          {item.soldOut && (
            <span className="rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600">Sold Out</span>
          )}
        </div>
        <p className="truncate text-sm text-stone-500">{item.description}</p>
        <div className="mt-1 text-sm font-medium text-stone-700">{priceRangeLabel(item)}</div>
      </div>
    </button>
  );
}
