import type { Settings } from "@/types";
import { formatHours } from "@/lib/openStatus";

export default function Hero({ settings, isOpen }: { settings: Settings; isOpen: boolean }) {
  return (
    <header className="border-b border-stone-200 bg-stone-50 px-4 py-5 text-center">
      <div className="mx-auto max-w-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.png"
          alt={settings.cafeName}
          className="mb-4 w-full rounded-2xl object-cover"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt={settings.cafeName}
          className="mx-auto -mt-20 mb-2 h-24 w-24 rounded-full border-4 border-stone-50 bg-white object-cover shadow-sm"
        />

        <h1 className="font-heading text-3xl font-bold text-stone-900">{settings.cafeName}</h1>
        <p className="mx-auto mt-2 max-w-lg text-stone-600">{settings.description}</p>

        {settings.location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-3 inline-flex max-w-md items-start gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-left hover:bg-stone-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0 text-stone-500"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            <div>
              <div className="text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-2">
                {settings.location}
              </div>
              {settings.locationNote && (
                <div className="text-sm italic text-stone-500">{settings.locationNote}</div>
              )}
            </div>
          </a>
        )}

        <div className="mt-3 flex justify-center">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Open · {formatHours(settings)}
            </span>
          ) : (
            <div className="inline-flex max-w-md items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-left text-sm text-amber-900">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.41 4.29 4.3-1.42 1.41L11 13V6h2v6.41Z" />
              </svg>
              <span>
                <span className="font-medium">We are closed now.</span> Orders are open every{" "}
                {settings.openingDays.join(" & ")}, {formatHours(settings)}.
              </span>
            </div>
          )}
        </div>

        {settings.paymentNote && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-stone-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4H4V6h16v2Zm0 2v8H4v-8h16Zm-3 4h-2v2h2v-2Z" />
            </svg>
            {settings.paymentNote}
          </div>
        )}

        {(settings.instagramHandle || settings.googleReviewLink) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {settings.instagramHandle && (
              <a
                href={`https://instagram.com/${settings.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <defs>
                    <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="5%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </radialGradient>
                  </defs>
                  <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#ig-gradient)" />
                  <rect
                    x="6.5"
                    y="6.5"
                    width="11"
                    height="11"
                    rx="3.5"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.4" />
                  <circle cx="15.6" cy="8.4" r="0.9" fill="#fff" />
                </svg>
                @{settings.instagramHandle}
              </a>
            )}

            {settings.googleReviewLink && (
              <a
                href={settings.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.87 8.87 4.76 12 4.76Z"
                  />
                </svg>
                Leave us a review
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
