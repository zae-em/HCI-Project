"use client";

export default function ErrorScreen({ retry }: { retry: () => void }) {
  return (
    <section className="card space-y-4" role="alert">
      <h1 className="text-2xl font-bold">Household data is unavailable</h1>
      <p>We couldn’t reach your household data. Please try again in a moment.</p>
      <button className="button" onClick={retry}>Try again</button>
    </section>
  );
}
