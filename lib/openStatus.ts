import type { Settings } from "@/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

// Based on the visitor's local time — the cafe only operates in one timezone
// (Singapore), so this is accurate enough without a server-side check.
export function isOpenNow(settings: Settings, now: Date = new Date()): boolean {
  const todayName = DAY_NAMES[now.getDay()];
  if (!settings.openingDays.includes(todayName)) return false;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(settings.openingTime);
  const closeMinutes = parseTimeToMinutes(settings.closingTime);

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

export function formatHours(settings: Settings): string {
  const to12h = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${to12h(settings.openingTime)} - ${to12h(settings.closingTime)}`;
}
