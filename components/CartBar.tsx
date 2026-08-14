import type { CartLine } from "@/types";
import { formatMoney } from "@/lib/pricing";

export default function CartBar({ cart, onCheckout }: { cart: CartLine[]; onCheckout: () => void }) {
  if (cart.length === 0) return null;

  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <div className="sticky bottom-0 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onCheckout}
        className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-full bg-[#9c6f43] px-6 py-3 font-medium text-white hover:bg-[#855e39]"
      >
        <span>
          View cart · {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
        <span>{formatMoney(subtotal)}</span>
      </button>
    </div>
  );
}
