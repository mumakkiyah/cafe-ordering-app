"use client";

import { useEffect, useState } from "react";
import type { CartLine, MenuItem, OrderResult, Settings } from "@/types";
import { isOpenNow } from "@/lib/openStatus";
import { submitOrder } from "@/app/actions";
import Hero from "@/components/Hero";
import MenuGrid from "@/components/MenuGrid";
import ProductDetail from "@/components/ProductDetail";
import CartBar from "@/components/CartBar";
import Checkout from "@/components/Checkout";
import Confirmation from "@/components/Confirmation";

type View = "menu" | "detail" | "checkout" | "confirmation";
type Customer = { name: string; phone: string };

function mergeIntoCart(cart: CartLine[], line: Omit<CartLine, "id">): CartLine[] {
  const existing = cart.find(
    (c) =>
      c.name === line.name &&
      c.variant === line.variant &&
      c.addOns.join(",") === line.addOns.join(",")
  );
  if (existing) {
    return cart.map((c) =>
      c === existing
        ? { ...c, qty: c.qty + line.qty, lineTotal: c.lineTotal + line.lineTotal }
        : c
    );
  }
  return [...cart, { ...line, id: crypto.randomUUID() }];
}

export default function OrderingApp({ settings, menu }: { settings: Settings; menu: MenuItem[] }) {
  const [view, setView] = useState<View>("menu");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{ orderNumber: number; timestamp: string } | null>(null);

  const [isOpen, setIsOpen] = useState(() => isOpenNow(settings));
  useEffect(() => {
    const interval = setInterval(() => setIsOpen(isOpenNow(settings)), 60_000);
    return () => clearInterval(interval);
  }, [settings]);

  const selectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setView("detail");
  };

  const handleConfirmPaid = async (customerDetails: Customer) => {
    setCustomer(customerDetails);
    setSubmitting(true);
    setSubmitError(null);

    const amount = cart.reduce((sum, line) => sum + line.lineTotal, 0);
    const result: OrderResult = await submitOrder({
      name: customerDetails.name,
      phone: customerDetails.phone,
      items: cart.map(({ name, variant, addOns, qty, unitPrice, lineTotal }) => ({
        name,
        variant,
        addOns,
        qty,
        unitPrice,
        lineTotal,
      })),
      amount,
    });

    setSubmitting(false);

    if (result.success) {
      setOrderResult({ orderNumber: result.orderNumber, timestamp: result.timestamp });
      setView("confirmation");
    } else {
      setSubmitError(result.error);
    }
  };

  const startNewOrder = () => {
    setCart([]);
    setCustomer({ name: "", phone: "" });
    setOrderResult(null);
    setSubmitError(null);
    setSelectedItem(null);
    setView("menu");
  };

  return (
    <div className="flex min-h-full flex-col">
      {view === "menu" && <Hero settings={settings} isOpen={isOpen} />}

      <main className="flex-1">
        {view === "menu" && <MenuGrid menu={menu} onSelect={selectItem} />}

        {view === "detail" && selectedItem && (
          <ProductDetail
            item={selectedItem}
            menu={menu}
            settings={settings}
            isOpen={isOpen}
            onBack={() => setView("menu")}
            onAdd={(line) => setCart((c) => mergeIntoCart(c, line))}
            onSelectRelated={selectItem}
          />
        )}

        {view === "checkout" && (
          <Checkout
            cart={cart}
            onBackToMenu={() => setView("menu")}
            onConfirmPaid={handleConfirmPaid}
            submitting={submitting}
            submitError={submitError}
          />
        )}

        {view === "confirmation" && orderResult && (
          <Confirmation
            orderNumber={orderResult.orderNumber}
            timestamp={orderResult.timestamp}
            cart={cart}
            customer={customer}
            onStartNewOrder={startNewOrder}
          />
        )}
      </main>

      {(view === "menu" || view === "detail") && (
        <CartBar cart={cart} onCheckout={() => setView("checkout")} />
      )}
    </div>
  );
}
