import Link from "next/link";
import { database, householdId } from "../lib/database";
import type { Appliance } from "../lib/cost";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = database();
  const { data, error } = await db.from("appliances")
    .select("id, name, power_kw, minutes").eq("household_id", householdId).order("name")
    .returns<Appliance[]>();
  if (error) throw new Error(error.message);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">What are you running?</h1>
        <p>Pick an appliance to compare one cycle now and after sunset.</p>
      </div>
      {data.length === 0 ? (
        <p className="card" role="status">No appliances are set up for this household yet.</p>
      ) : (
        <ul className="space-y-3" aria-label="Appliances">
          {data.map((appliance) => (
            <li key={appliance.id}>
              <Link className="card flex min-h-16 items-center justify-between gap-4 hover:bg-stone-200"
                href={"/cost/" + appliance.id}>
                <span>
                  <span className="block font-bold">{appliance.name}</span>
                  <span className="text-sm">{appliance.minutes} min cycle · {appliance.power_kw} kW</span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
