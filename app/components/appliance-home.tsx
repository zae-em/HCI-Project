"use client";

import Link from "next/link";
import { useState } from "react";
import type { Appliance } from "../../lib/cost";
import MainNav from "./main-nav";

type Listed = Appliance & { added?: boolean };

export default function ApplianceHome({ appliances }: { appliances: Appliance[] }) {
  const [added, setAdded] = useState<Listed[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const list: Listed[] = [...appliances, ...added];
  const acId = appliances.find((item) => item.id === "ac")?.id ?? appliances[0]?.id;

  // Held in local state only. Nothing is written to the database.
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const minutes = Number(form.get("minutes"));
    const kw = Number(form.get("kw"));
    if (name === "") return setError("Enter a name.");
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 720) {
      return setError("Enter cycle minutes from 1 to 720.");
    }
    if (!Number.isFinite(kw) || kw <= 0) return setError("Enter power in kW, above 0.");
    setAdded([...added, { id: "added-" + (added.length + 1), name, minutes, power_kw: kw, added: true }]);
    setError("");
    setOpen(false);
    setNotice(name + " was added for this session only. It is not saved.");
  }

  const field = "min-h-12 w-full rounded-xl border border-stone-600 px-3";

  return (
    <>
      <MainNav acId={acId} current="appliances" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">My Appliances</h1>
        <p>Pick an appliance to compare one cycle now and after sunset.</p>
      </div>
      {list.length === 0 ? (
        <p className="card" role="status">No appliances are set up for this household yet.</p>
      ) : (
        <ul className="space-y-3" aria-label="Appliances">
          {list.map((appliance) => (
            <li key={appliance.id}>
              {appliance.added ? (
                <div className="card space-y-1">
                  <span className="block font-bold">{appliance.name}</span>
                  <span className="block text-sm">{appliance.minutes} min cycle · {appliance.power_kw} kW</span>
                  <span className="block text-sm">Added this session. It has no cost page in this demo.</span>
                </div>
              ) : (
                <Link className="card flex min-h-16 items-center justify-between gap-4 hover:bg-stone-200"
                  href={"/cost/" + appliance.id}>
                  <span>
                    <span className="block font-bold">{appliance.name}</span>
                    <span className="text-sm">{appliance.minutes} min cycle · {appliance.power_kw} kW</span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      <section className="card space-y-3" aria-label="Add an appliance">
        {open && <h2 id="add-heading" className="font-bold">Add an appliance</h2>}
        {!open && (
          <button type="button" className="button" aria-expanded={false}
            onClick={() => { setOpen(true); setNotice(""); }}>
            Add an appliance <span aria-hidden="true">+</span>
          </button>
        )}
        {open && (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div className="space-y-1">
              <label className="block font-semibold" htmlFor="add-name">Name</label>
              <input className={field} id="add-name" name="name" type="text" autoComplete="off" />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold" htmlFor="add-minutes">Cycle minutes</label>
              <input className={field} id="add-minutes" name="minutes" type="number" inputMode="numeric"
                min="1" max="720" step="1" />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold" htmlFor="add-kw">Power (kW)</label>
              <input className={field} id="add-kw" name="kw" type="number" inputMode="decimal"
                min="0" step="any" />
            </div>
            {error && <p role="alert" className="font-semibold">{error}</p>}
            <button className="button" type="submit">Add to my appliances</button>
            <button type="button" className="action-link" onClick={() => { setOpen(false); setError(""); }}>Cancel</button>
          </form>
        )}
        <p className="text-sm" role="status" hidden={!notice}>{notice}</p>
      </section>
    </>
  );
}
