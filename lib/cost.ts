export type Appliance = { id: string; name: string; power_kw: number; minutes: number };
export type Tariff = { import_rate: number; export_rate: number };
export type Reading = {
  recorded_at: string;
  solar_kw: number;
  home_load_kw: number;
  grid_import_kw: number;
  grid_export_kw: number;
};

const slotMs = 15 * 60_000;
export const staleMinutes = 20;

type SolarLoad = Pick<Reading, "solar_kw" | "home_load_kw">;

export function gridPower(applianceKw: number, reading: SolarLoad) {
  const surplusKw = Math.max(0, reading.solar_kw - reading.home_load_kw);
  return Math.max(0, applianceKw - surplusKw);
}

export function estimateCost(appliance: Appliance, tariff: Tariff, reading?: SolarLoad) {
  const hours = appliance.minutes / 60;
  const gridKw = reading ? gridPower(appliance.power_kw, reading) : appliance.power_kw;
  return gridKw * hours * tariff.import_rate;
}

export function estimateCycleAt(
  appliance: Appliance, tariff: Tariff, slots: ReadonlyMap<number, Reading>, start: number,
) {
  const end = start + appliance.minutes * 60_000;
  let cost = 0;

  for (let time = start; time < end; time += slotMs) {
    const reading = slots.get(time);
    if (!reading) return undefined;
    const hours = Math.min(end - time, slotMs) / 3_600_000;
    cost += gridPower(appliance.power_kw, reading) * hours * tariff.import_rate;
  }

  return { start, end, cost };
}

export function bestSolarWindow(
  appliance: Appliance, tariff: Tariff, readings: Reading[], after: number,
) {
  const slots = new Map(readings.map((reading) => [Date.parse(reading.recorded_at), reading]));
  const gridCost = estimateCost(appliance, tariff);
  let best: { start: number; end: number; cost: number } | undefined;

  for (const start of [...slots.keys()].sort((a, b) => a - b)) {
    if (start <= after) continue;

    const cycle = estimateCycleAt(appliance, tariff, slots, start);

    // Require a complete trace and at least one rupee of solar savings.
    if (cycle && gridCost - cycle.cost >= 1 && (!best || cycle.cost < best.cost - 1e-8)) {
      best = cycle;
    }
  }
  return best;
}
