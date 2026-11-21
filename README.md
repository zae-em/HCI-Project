# WattWorth

WattWorth compares the estimated cost of one appliance cycle now, after sunset, and during the best remaining solar window in a simulated day.

## Run locally

Use Node.js 24 and a running Docker Desktop Linux engine. From the project folder in PowerShell:

~~~powershell
npm ci
npx supabase start
Copy-Item .env.example .env.local
~~~

Set SUPABASE_ANON_KEY in .env.local to the publishable or anon key printed by the CLI. Match SUPABASE_URL to the API URL it prints. Then run:

~~~powershell
npm run dev
~~~

Open http://localhost:3000. The Supabase CLI applies the schema migration and seed on first start. For a dedicated hosted demo project, run the migration and then seed.sql in its SQL Editor, and use its URL and publishable key instead. The anon policies permit reads only for the demo household.

## Instructor walkthrough

The home page, My Appliances, lists the demo appliances and has a menu. Usage & Costs, Net Billing and Recommendations open those sections of the AC page. Add an appliance keeps the new entry for the current session only.

1. Choose Washing machine. The replay starts at 10:02 a.m. PKT with a 10:00 a.m. reading and a temporary household load spike.
2. Read the Usage & Costs readings, compare Run now and After sunset, then read the suggested start under Best time to run and share the generated summary. On devices without native sharing, the button copies the text.
3. Expand Demo reading states. Stale selects an older reading and Missing hides today's reading. Both can show yesterday at the same time. Empty queries a range with no rows and shows the manual estimate, which starts at 0 kW of spare solar.
   The same states open directly by URL, for example /cost/washing-machine?demo=stale.
4. Plan a cycle changes the cycle length or tries a later start. Net Billing, under Units sent back, shows the export rate separately from appliance cost.
5. Run npm test for the cost checks and npm run build for the production build.

Older links that end in ?v=after still work and show the same pages.

## What the prototype computes

Supabase stores both days of simulated solar and home demand, the appliance power and cycle duration, and the household's example import and export rates. The replay clock is fixed. Future samples for the replay day serve as the forecast. The stored tariffs are demo inputs and can be edited in Supabase.

In lib/cost.ts, the app subtracts existing home demand from solar generation to find spare solar. It calculates how much appliance power still comes from the grid, multiplies by cycle hours, then applies the stored import rate. The now estimate holds the latest reading constant for the cycle. The after-sunset estimate assumes grid power only. The later-window calculation checks each possible 15-minute start and prices the full cycle across the forecast samples. The export rate is displayed separately.

## Hosted database recovery

The deployed app uses the hosted WattWorth Supabase project. Free projects can pause after a period of low activity. If the app reports that household data is unavailable, open the project in Supabase and check its status.

For a paused project, select Resume project and wait until it is healthy. Then select Try again in WattWorth. Resuming restores the existing database and data. A GitHub push or Vercel redeployment does not resume Supabase.

Database requests time out after 10 seconds so an unavailable service reaches the recovery screen. The retry button requests the route again using Next.js's error-boundary retry callback.

Supabase documents pausing and restoration at https://supabase.com/docs/guides/platform/free-project-pausing.
