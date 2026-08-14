import type { MenuItem, Settings } from "@/types";

// Used only when APPS_SCRIPT_URL is not configured, so the app is browsable
// locally before the Google Sheets backend is deployed. See README.md.

export const mockSettings: Settings = {
  cafeName: "The Coffee Moose",
  description:
    "Canadian techie by week, home barista by weekend! Fresh specialty coffee at Blk 810, Jurong West. Sat & Sun, 8AM-12PM.",
  location: "Blk 810, Jurong West St 81",
  locationNote: "order and pick-up at lift lobby",
  openingDays: ["Saturday", "Sunday"],
  openingTime: "08:00",
  closingTime: "12:00",
  paymentNote: "100% Cashless via personal PayNow/PayLah!",
  oatMilkAddOnPrice: 0.8,
  instagramHandle: "thecoffeemoose",
  googleReviewLink: "",
};

export const mockMenu: MenuItem[] = [
  {
    name: "Americano",
    category: "Espresso Coffee",
    description: "A crisp, robust shot of double espresso lengthened with hot water. Bold, clean, and perfect for a morning wake-up.",
    imageFilename: "americano.jpg",
    price: null,
    hotPrice: 3.5,
    coldPrice: 4.0,
    oatMilkAvailable: false,
    soldOut: false,
  },
  {
    name: "Espresso",
    category: "Espresso Coffee",
    description: "A concentrated, intense shot of pure coffee essence. Extracted under pressure for a rich body and a lasting crema.",
    imageFilename: "espresso.jpg",
    price: 3.5,
    hotPrice: null,
    coldPrice: null,
    oatMilkAvailable: false,
    soldOut: false,
  },
  {
    name: "Latte",
    category: "Espresso Coffee",
    description: "A smooth, velvety blend of our double espresso shot and perfectly steamed fresh milk. Balanced and comforting.",
    imageFilename: "latte.jpg",
    price: null,
    hotPrice: 4.0,
    coldPrice: 4.5,
    oatMilkAvailable: true,
    soldOut: false,
  },
  {
    name: "Cappuccino",
    category: "Espresso Coffee",
    description: "Equal parts espresso, steamed milk, and airy foam. A classic with a light, frothy finish.",
    imageFilename: "cappuccino.jpg",
    price: null,
    hotPrice: 4.0,
    coldPrice: 4.5,
    oatMilkAvailable: true,
    soldOut: false,
  },
  {
    name: "Mocha",
    category: "Espresso Coffee",
    description: "Espresso and steamed milk with a swirl of real chocolate. Rich, sweet, and indulgent.",
    imageFilename: "mocha.jpg",
    price: null,
    hotPrice: 4.5,
    coldPrice: 5.0,
    oatMilkAvailable: true,
    soldOut: true,
  },
  {
    name: "Kaya Toast",
    category: "Food",
    description: "Toasted bread with house-made kaya and a thick slab of cold butter, served with soft-boiled eggs.",
    imageFilename: "kaya-toast.jpg",
    price: 3.5,
    hotPrice: null,
    coldPrice: null,
    oatMilkAvailable: false,
    soldOut: false,
  },
];
