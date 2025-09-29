"use client";
import { useMemo, useState } from "react";
import { CITIES, cityLabel } from "@/lib/cities";
import { useRouter } from "next/navigation";
import { formatISO } from "date-fns";

export default function EntryForm() {
  const router = useRouter();
  const [from, setFrom] = useState("JFK");
  const [to, setTo] = useState("LHR");
  const [dateTimeLocal, setDateTimeLocal] = useState<string>(
    new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16)
  );

  const cityOptions = useMemo(
    () => CITIES.map((c) => ({ value: c.iata, label: `${cityLabel(c)} — ${c.country}` })),
    []
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (from === to) return;
    const dt = new Date(dateTimeLocal);
    const iso = formatISO(dt);
    router.push(`/visualize?from=${from}&to=${to}&dt=${encodeURIComponent(iso)}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-left space-y-2">
        <h2 className="text-2xl font-semibold">Plan your scenic view</h2>
        <p className="text-[14px] text-[color:var(--color-muted)]">Choose route and time. We’ll compute the sun’s direction and highlight the best window seats.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-[color:var(--color-muted)]">From</span>
          <select
            className="rounded-lg px-3 py-2 bg-[color:var(--color-panel)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {cityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-[color:var(--color-muted)]">To</span>
          <select
            className="rounded-lg px-3 py-2 bg-[color:var(--color-panel)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {cityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-[color:var(--color-muted)]">Flight date & time</span>
        <input
          type="datetime-local"
          value={dateTimeLocal}
          onChange={(e) => setDateTimeLocal(e.target.value)}
          className="rounded-lg px-3 py-2 bg-[color:var(--color-panel)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
          required
        />
        <span className="text-[12px] text-[color:var(--color-muted)]">Time is interpreted in your local timezone.</span>
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="px-6 py-3 rounded-lg bg-[color:var(--color-accent)] text-[color:var(--color-background)] font-medium hover:opacity-90 transition">Show scenic seats</button>
      </div>
    </form>
  );
}


