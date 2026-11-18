import Link from "next/link";

export default function AfterBanner({ beforeHref }: { beforeHref: string }) {
  return (
    <div role="note" aria-label="Version"
      className="flex flex-wrap items-center justify-between gap-x-4 rounded-xl border border-stone-950 bg-amber-100 px-3 text-sm">
      <span className="font-bold">After tree testing</span>
      <span className="flex flex-wrap gap-x-4">
        <Link className="action-link" href="/changes">See what changed</Link>
        <Link className="action-link" href={beforeHref}>Open this page in Before</Link>
      </span>
    </div>
  );
}
