import type { CartLine } from "@/types";
import { formatMoney } from "@/lib/pricing";

export default function Confirmation({
  orderNumber,
  timestamp,
  cart,
  customer,
  onStartNewOrder,
}: {
  orderNumber: number;
  timestamp: string;
  cart: CartLine[];
  customer: { name: string; phone: string };
  onStartNewOrder: () => void;
}) {
  const subtotal = cart.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <div className="mb-6 text-5xl">✅</div>
      <h1 className="font-heading text-2xl font-bold text-stone-900">Order #{orderNumber} confirmed!</h1>
      <p className="mt-2 text-stone-600">Thank you, {customer.name} — we&apos;ll have it ready soon.</p>

      <div className="mt-6 rounded-xl border border-stone-200 p-4 text-left">
        <div className="mb-2 flex justify-between text-sm text-stone-500">
          <span>{new Date(timestamp).toLocaleString()}</span>
          <span>{customer.phone}</span>
        </div>
        <div className="divide-y divide-stone-200">
          {cart.map((line) => (
            <div key={line.id} className="flex items-center justify-between py-2">
              <span className="text-stone-900">
                {line.qty}x {line.name}
                {line.variant ? ` (${line.variant})` : ""}
                {line.addOns.length > 0 ? ` +${line.addOns.join(", +")}` : ""}
              </span>
              <span className="font-medium text-stone-700">{formatMoney(line.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-stone-500">
        Screenshot this screen to keep as your receipt.
      </p>

      <button
        type="button"
        onClick={onStartNewOrder}
        className="mt-6 rounded-full border border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-stone-50"
      >
        Start New Order
      </button>
    </div>
  );
}
