"use client";

import { useState } from "react";
import type { CartLine } from "@/types";
import { formatMoney } from "@/lib/pricing";

type Customer = { name: string; phone: string };

export default function Checkout({
  cart,
  onBackToMenu,
  onConfirmPaid,
  submitting,
  submitError,
}: {
  cart: CartLine[];
  onBackToMenu: () => void;
  onConfirmPaid: (customer: Customer) => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const [step, setStep] = useState<"details" | "pay">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const subtotal = cart.reduce((sum, line) => sum + line.lineTotal, 0);
  const phoneValid = /^[0-9]{7,15}$/.test(phone.trim());
  const detailsValid = name.trim().length > 0 && phoneValid;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        type="button"
        onClick={onBackToMenu}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back to menu
      </button>

      <h1 className="font-heading text-2xl font-bold text-stone-900">Your Order</h1>

      <div className="mt-4 mb-2 flex items-center gap-2 text-xs font-medium text-stone-500">
        <span className={step === "details" ? "text-stone-900" : ""}>1. Your details</span>
        <span className="h-px flex-1 bg-stone-200" />
        <span className={step === "pay" ? "text-stone-900" : ""}>2. Payment</span>
      </div>
      <div className="mb-4 flex gap-1.5">
        <div className="h-1.5 flex-1 rounded-full bg-[#9c6f43]" />
        <div className={`h-1.5 flex-1 rounded-full ${step === "pay" ? "bg-[#9c6f43]" : "bg-stone-200"}`} />
      </div>

      <div className="divide-y divide-stone-200 rounded-xl border border-stone-200">
        {cart.map((line) => (
          <div key={line.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium text-stone-900">
                {line.qty}x {line.name}
                {line.variant ? ` (${line.variant})` : ""}
              </div>
              {line.addOns.length > 0 && (
                <div className="text-sm text-stone-500">+ {line.addOns.join(", ")}</div>
              )}
            </div>
            <div className="font-medium text-stone-700">{formatMoney(line.lineTotal)}</div>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 font-bold text-stone-900">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
      </div>

      {step === "details" && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              placeholder="9XXXXXXX"
            />
          </div>
          <button
            type="button"
            disabled={!detailsValid}
            onClick={() => setStep("pay")}
            className="w-full rounded-full bg-[#9c6f43] px-6 py-3 font-medium text-white hover:bg-[#855e39] disabled:opacity-40"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {step === "pay" && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-stone-600">Scan to pay with PayNow, then confirm below.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/paynow-qr.jpeg"
            alt="PayNow QR code"
            className="mx-auto w-56 rounded-xl border border-stone-200"
          />
          <div className="mt-3 text-2xl font-bold text-stone-900">{formatMoney(subtotal)}</div>

          {submitError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</p>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={() => onConfirmPaid({ name: name.trim(), phone: phone.trim() })}
            className="mt-4 w-full rounded-full bg-[#9c6f43] px-6 py-3 font-medium text-white hover:bg-[#855e39] disabled:opacity-40"
          >
            {submitting ? "Confirming..." : "I've Paid"}
          </button>
          <button
            type="button"
            onClick={() => setStep("details")}
            className="mt-3 text-sm text-stone-500 underline"
          >
            Edit details
          </button>
        </div>
      )}
    </div>
  );
}
