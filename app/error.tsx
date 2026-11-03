"use client";

export default function ErrorScreen({ reset }: { reset: () => void }) {
  return (
    <section className="card space-y-4" role="alert">
      <h1 className="text-2xl font-bold">Household data is unavailable</h1>
      <p>Check the Supabase connection and try again.</p>
      <button className="button" onClick={reset}>Try again</button>
    </section>
  );
}
