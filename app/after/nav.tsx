"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { label: string; href?: string; current?: boolean };

export default function AfterNav({ acId, onAcPage = false, current }: {
  acId?: string;
  onAcPage?: boolean;
  current?: "appliances";
}) {
  const [message, setMessage] = useState("");

  // Sections live on the AC page. With no AC page to point at, say so instead of linking nowhere.
  function section(id: string) {
    if (onAcPage) return "#" + id;
    return acId ? "/cost/" + acId + "?v=after#" + id : undefined;
  }

  const items: Item[] = [
    { label: "My Appliances", href: "/?v=after", current: current === "appliances" },
    { label: "Usage & Costs", href: section("usage-costs") },
    { label: "Net Billing", href: section("net-billing") },
    { label: "Recommendations", href: section("best-time") },
  ];
  const chip = "inline-flex min-h-12 items-center rounded-full border border-stone-950 px-4 font-semibold";

  return (
    <nav aria-label="Main" className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} onClick={() => setMessage("")}
                aria-current={item.current ? "page" : undefined}
                className={chip + (item.current ? " bg-stone-950 text-white" : " bg-white hover:bg-stone-200")}>
                {item.label}
              </Link>
            ) : (
              <button type="button" className={chip + " bg-white hover:bg-stone-200"}
                onClick={() => setMessage(item.label + ": Not built in this demo.")}>
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm" role="status" hidden={!message}>{message}</p>
    </nav>
  );
}
