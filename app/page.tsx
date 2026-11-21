import { database, householdId } from "../lib/database";
import type { Appliance } from "../lib/cost";
import ApplianceHome from "./components/appliance-home";

export const dynamic = "force-dynamic";

// Old shared links may still carry ?v=after. It is accepted and ignored.
export default async function Home() {
  const db = database();
  const { data, error } = await db.from("appliances")
    .select("id, name, power_kw, minutes").eq("household_id", householdId).order("name")
    .returns<Appliance[]>();
  if (error) throw new Error(error.message);

  return <ApplianceHome appliances={data} />;
}
