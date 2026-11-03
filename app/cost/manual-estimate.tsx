"use client";

import { useState } from "react";
import { estimateCost } from "../../lib/cost";
import type { Appliance, Tariff } from "../../lib/cost";

export default function ManualEstimate({ appliance, tariff }: {
  appliance: Appliance;
  tariff: Tariff;
}) {
  const [input, setInput] = useState("0");
  const spareKw = Number(input);
  const valid = input.trim() !== "" && Number.isFinite(spareKw) && spareKw >= 0;
  const estimate = valid
    ? estimateCost(appliance, tariff, { solar_kw: spareKw, home_load_kw: 0 })
    : undefined;

  return (
    <div className="space-y-2">
      <label className="block font-semibold" htmlFor="spare-solar">Manual estimate</label>
      <p id="spare-solar-hint" className="text-sm">Enter spare solar power in kW after your home uses what it needs. Use 0 for grid power only.</p>
      <input id="spare-solar" className="min-h-12 w-full rounded-xl border border-stone-600 px-3"
        type="number" min="0" step="any" inputMode="decimal" value={input}
        aria-describedby="spare-solar-hint" aria-invalid={!valid}
        onChange={(event) => setInput(event.currentTarget.value)} />
      <output htmlFor="spare-solar" className="block">
        {estimate === undefined ? "Enter a number of 0 or higher." :
          "Estimated cost · Rs " + Math.round(estimate) + " per cycle"}
      </output>
    </div>
  );
}
