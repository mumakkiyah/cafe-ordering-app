export type Settings = {
  cafeName: string;
  description: string;
  location: string;
  locationNote: string;
  openingDays: string[]; // e.g. ["Saturday", "Sunday"]
  openingTime: string; // "08:00"
  closingTime: string; // "12:00"
  paymentNote: string;
  oatMilkAddOnPrice: number;
  instagramHandle: string;
  googleReviewLink: string;
};

export type MenuItem = {
  name: string;
  category: string;
  description: string;
  imageFilename: string;
  price: number | null;
  hotPrice: number | null;
  coldPrice: number | null;
  oatMilkAvailable: boolean;
  soldOut: boolean;
};

export type Variant = "Hot" | "Cold";

export type CartLine = {
  id: string;
  name: string;
  variant: Variant | null;
  addOns: string[];
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderPayload = {
  name: string;
  phone: string;
  items: Pick<CartLine, "name" | "variant" | "addOns" | "qty" | "unitPrice" | "lineTotal">[];
  amount: number;
};

export type OrderResult =
  | { success: true; orderNumber: number; timestamp: string }
  | { success: false; error: string };
