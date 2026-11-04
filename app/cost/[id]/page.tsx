import Link from "next/link";
import { notFound } from "next/navigation";
import { bestSolarWindow, estimateCost, estimateCycleAt, staleMinutes } from "../../../lib/cost";
import type { Appliance, Reading, Tariff } from "../../../lib/cost";
import { database, householdId } from "../../../lib/database";
import FamilyShare from "../share";
import ManualEstimate from "../manual-estimate";

export const dynamic = "force-dynamic";

const time = new Intl.DateTimeFormat("en-PK", {
  timeZone: "Asia/Karachi", hour: "numeric", minute: "2-digit", hour12: true,
});
const day = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit",
});
const rupees = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

function money(amount: number) {
  return "Rs " + rupees.format(amount);
}

export default async function CostPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string; minutes?: string; start?: string }>;
}) {
  const [{ id }, { demo, minutes, start }] = await Promise.all([params, searchParams]);
  const db = database();
  const [appliances, tariffs, households] = await Promise.all([
    db.from("appliances").select("id, name, power_kw, minutes")
      .eq("household_id", householdId).eq("id", id).maybeSingle().returns<Appliance>(),
    db.from("tariffs").select("import_rate, export_rate")
      .eq("household_id", householdId).single().returns<Tariff>(),
    db.from("households").select("demo_at").eq("id", householdId).single(),
  ]);
  const error = appliances.error ?? tariffs.error ?? households.error;
  if (error) throw new Error(error.message);
  const storedAppliance = appliances.data;
  if (!storedAppliance) notFound();
  if (!tariffs.data || !households.data) throw new Error("Demo setup is incomplete.");

  const requestedMinutes = typeof minutes === "string" ? Number(minutes) : NaN;
  const invalidMinutes = minutes !== undefined &&
    (!Number.isInteger(requestedMinutes) || requestedMinutes < 1 || requestedMinutes > 720);
  const appliance = {
    ...storedAppliance,
    minutes: minutes === undefined || invalidMinutes ? storedAppliance.minutes : requestedMinutes,
  };
  const tariff = tariffs.data;
  const now = Date.parse(households.data.demo_at);
  const today = Date.parse(day.format(now) + "T00:00:00+05:00");
  const yesterday = today - 86_400_000;
  const iso = (timestamp: number) => new Date(timestamp).toISOString();
  const endOfQuery = demo === "empty" ? yesterday : today + 86_400_000;
  const readings = await db.from("readings")
    .select("recorded_at, solar_kw, home_load_kw, grid_import_kw, grid_export_kw")
    .eq("household_id", householdId).gte("recorded_at", iso(yesterday))
    .lt("recorded_at", iso(endOfQuery)).order("recorded_at").returns<Reading[]>();

  const samples = readings.data ?? [];
  // Wizard-of-Oz: ?demo=stale/missing/empty only simulate a bad feed for the walkthrough
  // (older cutoff, hidden row, empty range). The age and staleMinutes check below is real.
  const cutoff = demo === "stale" ? now - 45 * 60_000 : now;
  const latest = samples.findLast((row) => {
    const stamp = Date.parse(row.recorded_at);
    return demo !== "missing" && stamp >= today && stamp <= cutoff;
  });
  const age = latest ? Math.floor((now - Date.parse(latest.recorded_at)) / 60_000) : null;
  const live = age !== null && age < staleMinutes ? latest : undefined;
  const previous = samples.findLast((row) => Date.parse(row.recorded_at) <= now - 86_400_000);
  const previousIsRecent = previous &&
    now - 86_400_000 - Date.parse(previous.recorded_at) < staleMinutes * 60_000;
  const gridCost = estimateCost(appliance, tariff);
  const nowCost = live ? estimateCost(appliance, tariff, live) : undefined;
  const best = live ? bestSolarWindow(appliance, tariff, samples, now) : undefined;
  const futureSlots = new Map(samples
    .map((reading) => [Date.parse(reading.recorded_at), reading] as const)
    .filter(([stamp]) => stamp > now));
  const selectedStart = typeof start === "string" && start !== "" ? Number(start) : undefined;
  const hasSelectedStart = selectedStart !== undefined && futureSlots.has(selectedStart);
  const planned = live && hasSelectedStart
    ? estimateCycleAt(appliance, tariff, futureSlots, selectedStart)
    : undefined;
  const bestStart = best ? time.format(best.start) : "";
  const bestEnd = best ? time.format(best.end) : "";
  const name = appliance.name.toLowerCase();
  const savedNow = nowCost === undefined ? 0 : Math.round(gridCost - nowCost);
  const summary = best && nowCost !== undefined && nowCost - best.cost >= 1
    ? "Start the " + name + " at " + bestStart + ". It could save about " +
      money(gridCost - best.cost) + " compared with after sunset."
    : nowCost === undefined
      ? "Solar data is unavailable. Budget about " + money(gridCost) +
        " to run the " + name + " on grid power."
      : savedNow > 0
        ? "Run the " + name + " now to save about " + money(gridCost - nowCost) +
          " compared with after sunset."
        : "The " + name + " costs about " + money(gridCost) + " per cycle now or after sunset.";
  const familySummary = planned
    ? "Starting the " + name + " at " + time.format(planned.start) + " PKT should cost about " +
      money(planned.cost) + " for " + appliance.minutes + " minutes, compared with " +
      money(gridCost) + " after sunset."
    : summary;

  return (
    <>
      <Link className="action-link" href="/">← All appliances</Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{appliance.name}</h1>
        <p>{appliance.minutes} min cycle · {appliance.power_kw} kW</p>
        <p className="text-sm">Simulated day replay · {time.format(now)} PKT</p>
      </div>

      {live && nowCost !== undefined ? (
        <>
          <section aria-label="Compare estimated costs" className="grid grid-cols-2 gap-3">
            <div className="card space-y-1">
              <h2 className="font-semibold">Run now</h2>
              <p className="text-2xl font-bold">{money(nowCost)}</p>
            </div>
            <div className="card space-y-1">
              <h2 className="font-semibold">After sunset</h2>
              <p className="text-2xl font-bold">{money(gridCost)}</p>
            </div>
          </section>
          <section className="card space-y-2">
            <h2 className="eyebrow">Best later window today</h2>
            {best ? (
              <>
                <p className="text-2xl font-bold">{bestStart} – {bestEnd}</p>
                <p>Start at {bestStart} for an estimated {money(best.cost)} cycle.</p>
              </>
            ) : <p>No later solar window in today’s readings.</p>}
            <p className="font-semibold">{summary}</p>
          </section>
          <p className="text-sm">
            Updated {age === 0 ? "just now" : age + (age === 1 ? " minute ago" : " minutes ago")} in the replay.
            {" "}Solar {live.solar_kw} kW · home use {live.home_load_kw} kW · grid draw {live.grid_import_kw} kW.
            {" "}The run-now estimate assumes this reading holds for the cycle.
          </p>
        </>
      ) : (
        <section className="card space-y-3" aria-labelledby="reading-state">
          <h2 id="reading-state" className="text-2xl font-bold">
            {readings.error ? "Couldn’t load solar readings" :
              samples.length === 0 ? "No solar readings yet" :
              age === null ? "Today’s solar reading is missing" : "Solar reading is out of date"}
          </h2>
          <p>{age === null ? "A run-now estimate needs a recent solar reading." :
            "The last reading is " + age + " minutes old in the replay."}</p>
          {previousIsRecent && (
            <p><strong>Yesterday at {time.format(Date.parse(previous.recorded_at))}</strong>
              {" · "}{money(estimateCost(appliance, tariff, previous))} using yesterday’s solar at this time.</p>
          )}
          <ManualEstimate appliance={appliance} tariff={tariff} />
          <a className="button" href={"/cost/" + id}>Check again</a>
        </section>
      )}

      <section className="card space-y-3" aria-labelledby="plan-heading">
        <h2 id="plan-heading" className="font-bold">Plan a cycle</h2>
        <p>Change how long it runs, or compare a start time from today’s replay.</p>
        <form action={"/cost/" + id} method="get" className="space-y-3">
          {demo && <input type="hidden" name="demo" value={demo} />}
          <div className="space-y-1">
            <label className="block font-semibold" htmlFor="cycle-minutes">Cycle length in minutes</label>
            <input className="min-h-12 w-full rounded-xl border border-stone-600 px-3"
              id="cycle-minutes" name="minutes" type="number" inputMode="numeric"
              min="1" max="720" step="1" required defaultValue={appliance.minutes} />
            <p className="text-sm">Usual cycle · {storedAppliance.minutes} min</p>
          </div>
          {live && futureSlots.size > 0 && (
            <div className="space-y-1">
              <label className="block font-semibold" htmlFor="planned-start">Try a later start (PKT)</label>
              <select className="min-h-12 w-full rounded-xl border border-stone-600 px-3"
                id="planned-start" name="start" defaultValue={hasSelectedStart ? selectedStart : ""}>
                <option value="">No specific start</option>
                {[...futureSlots.keys()].map((stamp) => (
                  <option key={stamp} value={stamp}>{time.format(stamp)}</option>
                ))}
              </select>
            </div>
          )}
          <button className="button" type="submit">Update estimates</button>
        </form>
        {invalidMinutes && <p role="status">Enter a cycle length from 1 to 720 minutes. Showing the usual cycle for now.</p>}
        {live && selectedStart !== undefined && (
          <div className="space-y-1" role="status">
            {planned ? (
              <>
                <p className="text-2xl font-bold">{money(planned.cost)}</p>
                <p>{time.format(planned.start)} – {time.format(planned.end)} · {appliance.minutes} min</p>
                <p>{Math.round(gridCost - planned.cost) > 0
                  ? "Save about " + money(gridCost - planned.cost) + " compared with after sunset."
                  : "About the same cost as running after sunset."}</p>
              </>
            ) : <p>There aren’t enough forecast readings to price that full cycle. Try an earlier start or a shorter cycle.</p>}
          </div>
        )}
      </section>

      <FamilyShare key={familySummary} summary={familySummary} />

      <p className="text-sm">
        Demo import {money(tariff.import_rate)}/kWh · export credit {money(tariff.export_rate)}/kWh.
        Export credit is shown separately from appliance cost.
        {live && live.grid_export_kw > 0 && (
          <> At the current export of {live.grid_export_kw} kW, the credit is about {money(live.grid_export_kw * tariff.export_rate)} per hour.</>
        )}
      </p>
      <details className="card text-sm">
        <summary className="flex min-h-12 cursor-pointer items-center font-semibold">Demo reading states</summary>
        <div className="flex flex-wrap gap-x-4">
          <Link className="action-link" href={"/cost/" + id}>Fresh</Link>
          <Link className="action-link" href={"?demo=stale"}>Stale</Link>
          <Link className="action-link" href={"?demo=missing"}>Missing</Link>
          <Link className="action-link" href={"?demo=empty"}>Empty</Link>
        </div>
      </details>
    </>
  );
}
