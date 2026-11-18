"use client";

import Link from "next/link";
import { useState } from "react";

const pages = [
  { name: "Home", path: "/" },
  { name: "AC page", path: "/cost/ac" },
];

export default function VersionToggle() {
  const [version, setVersion] = useState<"before" | "after">("before");
  const suffix = version === "after" ? "?v=after" : "";
  const pill = "min-h-12 flex-1 px-4 font-semibold";

  return (
    <section className="card space-y-3" aria-labelledby="open-heading">
      <h2 id="open-heading" className="font-bold">Open a page</h2>
      <div role="group" aria-label="Version" className="flex overflow-hidden rounded-xl border border-stone-950">
        {(["before", "after"] as const).map((option) => (
          <button key={option} type="button" aria-pressed={version === option}
            onClick={() => setVersion(option)}
            className={pill + (version === option ? " bg-stone-950 text-white" : " bg-white hover:bg-stone-200")}>
            {option === "before" ? "Before" : "After"}
          </button>
        ))}
      </div>
      <p className="text-sm">Showing links for the {version === "before" ? "Before" : "After"} version.</p>
      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page.path}>
            <Link className="button" href={page.path + suffix}>
              Open {page.name} ({version === "before" ? "Before" : "After"}) <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
