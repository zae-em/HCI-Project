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

1. Choose Washing machine. The replay starts at 10:02 a.m. PKT with a 10:00 a.m. reading and a temporary household load spike.
2. Compare Run now and After sunset, then read the suggested start and share the generated summary. On devices without native sharing, the button copies the text.
3. Expand Demo reading states. Stale selects an older reading and Missing hides today's reading. Both can show yesterday at the same time. Empty queries a range with no rows and shows the manual estimate, which starts at 0 kW of spare solar.
4. Run npm test for the cost checks and npm run build for the production build.

## What the prototype computes

Supabase stores both days of simulated solar and home demand, the appliance power and cycle duration, and the household's example import and export rates. The replay clock is fixed. Future samples for the replay day serve as the forecast. The stored tariffs are demo inputs and can be edited in Supabase.

In lib/cost.ts, the app subtracts existing home demand from solar generation to find spare solar. It calculates how much appliance power still comes from the grid, multiplies by cycle hours, then applies the stored import rate. The now estimate holds the latest reading constant for the cycle. The after-sunset estimate assumes grid power only. The later-window calculation checks each possible 15-minute start and prices the full cycle across the forecast samples. The export rate is displayed separately.
