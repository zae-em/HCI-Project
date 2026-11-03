"use client";

import { useState } from "react";

export default function FamilyShare({ summary }: { summary: string }) {
  const [status, setStatus] = useState("");

  async function share() {
    setStatus("");
    if (navigator.share) {
      try {
        await navigator.share({ text: summary });
        setStatus("Shared.");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(summary);
      setStatus("Copied. Paste it into your family chat.");
    } catch {
      setStatus("Select the summary above to copy it manually.");
    }
  }

  return (
    <section className="card space-y-3">
      <h2 className="font-bold">Share with family</h2>
      <p>{summary}</p>
      <button className="button" onClick={share}>Share or copy summary</button>
      <p className="text-sm" role="status" hidden={!status}>{status}</p>
    </section>
  );
}
