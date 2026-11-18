import Link from "next/link";
import VersionToggle from "./toggle";

export const metadata = { title: "What changed | WattWorth" };

const rows = [
  {
    change: "Added a small menu: My Appliances, Usage & Costs, Net Billing, Recommendations. Items with no screen say \"Not built in this demo\".",
    label: "Tree A menu labels",
    finding: "The current app had no menu, only \"← All appliances\". Tree A, the clear menu, was the one we tested.",
  },
  {
    change: "Added an \"Add an appliance\" card with a simple form on the home page. The new item lives in local state only.",
    label: "Add an appliance",
    finding: "T3 \"add an appliance\": 100% on Tree A, 0% on the generic Tree B.",
  },
  {
    change: "Replaced \"export credit\" with \"units sent back\" and gave it its own card under Net Billing.",
    label: "units sent back (the task wording). The app said \"export credit\".",
    finding: "T2 \"units sent back to the grid\": 50% even on Tree A.",
  },
  {
    change: "Renamed \"Best later window today\" to \"Best time to run\" and made it the one place for time-of-day advice. Recommendations jumps to it.",
    label: "Recommendations, Usage & Costs",
    finding: "T4 \"AC costs more than it should, would another time of day help\": 50% on Tree A. One tester found it in Recommendations, the other stopped at Usage & Costs. Time-of-day advice was looked for in two places.",
  },
  {
    change: "Fixed \"Start the ac at ...\" to \"Start the AC at ...\".",
    label: "Not tested",
    finding: "Not from tree testing. A wording fix.",
  },
];

export default function Changes() {
  return (
    <>
      <Link className="action-link" href="/">← All appliances</Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">What changed after tree testing</h1>
        <p>Before is the app as it was. After has the changes below.</p>
      </div>
      <p className="card font-semibold" role="note">
        2 testers per tree. Not retested. This shows what we changed and why, not proof that it improved.
      </p>
      <VersionToggle />
      <section aria-labelledby="table-heading" className="space-y-2">
        <h2 id="table-heading" className="font-bold">Changes</h2>
        <div className="card p-0">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[36%]" />
              <col className="w-[24%]" />
              <col className="w-[40%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-stone-400">
                <th scope="col" className="p-2">Change</th>
                <th scope="col" className="p-2">Label we tested</th>
                <th scope="col" className="p-2">Finding</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.change} className="border-b border-stone-300 align-top last:border-0">
                  <td className="p-2 break-words">{row.change}</td>
                  <td className="p-2 break-words">{row.label}</td>
                  <td className="p-2 break-words">{row.finding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
