import assert from "node:assert/strict";
import { test } from "node:test";
import { bestSolarWindow, estimateCost } from "./cost.ts";

const appliance = { id: "motor", name: "Motor", power_kw: 2, minutes: 30 };
const tariff = { import_rate: 52, export_rate: 11 };
const start = Date.parse("2026-11-03T10:00:00+05:00");

function sample(offset, solar, load = 1) {
  return {
    recorded_at: new Date(start + offset * 60_000).toISOString(),
    solar_kw: solar,
    home_load_kw: load,
    grid_import_kw: Math.max(load - solar, 0),
    grid_export_kw: Math.max(solar - load, 0),
  };
}

test("uses surplus after the home's load and charges only for appliance grid energy", () => {
  assert.equal(estimateCost(appliance, tariff, sample(0, 2)), 26);
  assert.equal(estimateCost(appliance, tariff, sample(0, 4)), 0);
  assert.equal(estimateCost(appliance, tariff, sample(0, 0)), 52);
  assert.equal(estimateCost(appliance, tariff), 52);
  assert.equal(estimateCost(appliance, { ...tariff, export_rate: 45 }, sample(0, 2)), 26);
});

test("selects the earliest cheapest complete later cycle and rejects gaps", () => {
  const rows = [sample(0, 4), sample(15, 2), sample(30, 4), sample(45, 4), sample(75, 4)];
  assert.deepEqual(bestSolarWindow(appliance, tariff, rows, start), {
    start: start + 30 * 60_000,
    end: start + 60 * 60_000,
    cost: 0,
  });
  assert.equal(bestSolarWindow(appliance, tariff, rows, start + 30 * 60_000), undefined);
});

test("prorates a partial final interval", () => {
  const rows = [sample(15, 4), sample(30, 0)];
  const window = bestSolarWindow({ ...appliance, minutes: 20 }, tariff, rows, start);
  assert.ok(window);
  assert.ok(Math.abs(window.cost - 52 / 6) < 1e-8);
});
