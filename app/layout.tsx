import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WattWorth",
  description: "Compare the cost of running an appliance now or later.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-lg space-y-4 px-4 py-6 sm:py-10">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-400 pb-4">
            <span className="text-2xl font-bold tracking-tight">WattWorth</span>
            <span className="rounded-full border border-stone-600 px-3 py-1 text-sm font-semibold">
              Solar demo
            </span>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
