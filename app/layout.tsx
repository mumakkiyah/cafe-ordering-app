import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Weekend Cafe Ordering",
  description: "Order ahead for pickup — pay by PayNow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* [TCM-ENH-001] START: Copyright footer */}
        <footer className="mt-auto border-t border-stone-200 px-4 py-5 text-center">
          <p className="text-sm font-medium text-stone-700">
            The Coffee Moose
          </p>
          <p className="mt-1 text-xs text-stone-500">
            © {new Date().getFullYear()} The Coffee Moose. All rights reserved.
          </p>
        </footer>
        {/* [TCM-ENH-001] END */}
      </body>
    </html>
  );
}
