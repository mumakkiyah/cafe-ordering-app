import type { Metadata } from "next";
import { getMenu, getSettings } from "@/lib/appsScript";
import OrderingApp from "@/components/OrderingApp";

// Menu/settings must be re-read from the Google Sheets on every request —
// that's the whole point of the Sheet-driven approach (edit the Sheet,
// no redeploy needed). Static prerendering would freeze data at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: settings.cafeName };
}

export default async function Page() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  return <OrderingApp settings={settings} menu={menu} />;
}
