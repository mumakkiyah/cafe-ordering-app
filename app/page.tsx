import type { Metadata } from "next";
import { getMenu, getSettings } from "@/lib/appsScript";
import OrderingApp from "@/components/OrderingApp";

// Menu/settings must be re-read from the Google Sheets on every request —
// that's the whole point of the Sheet-driven approach (edit the Sheet,
// no redeploy needed). Static prerendering would freeze data at build time.
export const dynamic = "force-dynamic";

// Order submission (a Server Action on this page) occasionally needs to
// wait on a slow Apps Script response — give it more room than the
// platform default so it isn't killed before our own 20s client timeout
// in lib/appsScript.ts has a chance to fire with a clear error.
export const maxDuration = 30;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: settings.cafeName };
}

export default async function Page() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  return <OrderingApp settings={settings} menu={menu} />;
}
