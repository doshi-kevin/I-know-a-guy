"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ALL_ATTORNEYS, ALL_CONTACTS, LINKS } from "@/lib/data";
import { LogEntry } from "@/lib/firmLog";
import { COMMISSION_RATE, PRACTICE_LABEL, SECTOR_LABEL } from "@/lib/types";

const STATUS_STYLE: Record<LogEntry["status"], string> = {
  pending: "bg-[var(--line-soft)] text-[var(--muted)]",
  sent: "bg-[var(--accent-soft)] text-[var(--accent-ink)]",
  won: "bg-[var(--good-soft)] text-[var(--good)]",
  lost: "bg-[var(--bad-soft)] text-[var(--bad)]",
  declined: "bg-[var(--line-soft)] text-[var(--muted)]",
};
const STATUS_LABEL: Record<LogEntry["status"], string> = {
  pending: "Pending",
  sent: "Introduced",
  won: "Won",
  lost: "Didn't close",
  declined: "Declined",
};

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;

export default function FirmDashboard({ log }: { log: LogEntry[] }) {
  const sorted = useMemo(() => [...log].sort((a, b) => b.ts - a.ts), [log]);
  const won = log.filter((e) => e.status === "won");
  const decided = log.filter((e) => e.status === "won" || e.status === "lost");
  const revenue = won.reduce((sum, e) => sum + (e.commission ?? 0), 0);
  const successRate = decided.length ? won.length / decided.length : 0;

  const leaderboard = useMemo(
    () =>
      [...ALL_ATTORNEYS]
        .filter((a) => a.intros > 0)
        .sort((a, b) => b.wins - a.wins || b.intros - a.intros)
        .slice(0, 9),
    // ALL_ATTORNEYS objects are mutated in place on each outcome, so this
    // needs to recompute whenever the log changes even though the array
    // reference itself doesn't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [log]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-6xl px-8 py-10">
      <p className="text-[12px] uppercase tracking-wider text-[var(--muted)]">Firm view</p>
      <h1 className="mt-1 font-serif-display text-3xl font-medium text-[var(--ink)]">
        What Hollis &amp; Crane sees
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--ink-soft)]">
        The firm runs this side: every request that comes in, who it went to, whether it closed —
        and the 1% success fee that funds the platform. Nothing here is charged unless an
        introduction actually works.
      </p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <StatCard label="Requests handled" value={String(log.length)} />
        <StatCard label="Introductions made" value={String(log.filter((e) => e.status !== "declined" && e.status !== "pending").length)} />
        <StatCard label="Success rate" value={decided.length ? `${Math.round(successRate * 100)}%` : "—"} tone="good" />
        <StatCard label="Platform revenue (1% fee)" value={money(revenue)} tone="accent" />
      </div>

      <div className="mt-9 grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <h2 className="font-serif-display text-lg font-medium text-[var(--ink)]">Request queue</h2>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">Most recent first.</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--paper-raised)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-3.5 py-2.5 font-medium">Company</th>
                  <th className="px-3.5 py-2.5 font-medium">Need</th>
                  <th className="px-3.5 py-2.5 font-medium">Attorney</th>
                  <th className="px-3.5 py-2.5 font-medium">Status</th>
                  <th className="px-3.5 py-2.5 text-right font-medium">Fee</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--line-soft)] last:border-0">
                    <td className="px-3.5 py-2.5">
                      <div className="font-medium text-[var(--ink)]">{e.companyName}</div>
                      <div className="text-[11px] text-[var(--muted)]">{SECTOR_LABEL[e.sector]}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-[var(--ink-soft)]">{PRACTICE_LABEL[e.practice]}</td>
                    <td className="px-3.5 py-2.5 text-[var(--ink-soft)]">{e.attorneyName ?? "—"}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[e.status]}`}>
                        {STATUS_LABEL[e.status]}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right tabular text-[var(--ink-soft)]">
                      {e.status === "won" ? money(e.commission ?? 0) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2">
          <h2 className="font-serif-display text-lg font-medium text-[var(--ink)]">Attorney credit</h2>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">Who&rsquo;s making introductions that work.</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--paper-raised)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-3.5 py-2.5 font-medium">Attorney</th>
                  <th className="px-3.5 py-2.5 text-right font-medium">Intros</th>
                  <th className="px-3.5 py-2.5 text-right font-medium">Won</th>
                  <th className="px-3.5 py-2.5 text-right font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--line-soft)] last:border-0">
                    <td className="px-3.5 py-2.5">
                      <div className="font-medium text-[var(--ink)]">{a.name}</div>
                      <div className="text-[11px] text-[var(--muted)]">{PRACTICE_LABEL[a.practice]}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-right tabular text-[var(--ink-soft)]">{a.intros}</td>
                    <td className="px-3.5 py-2.5 text-right tabular text-[var(--ink-soft)]">{a.wins}</td>
                    <td className="px-3.5 py-2.5 text-right tabular text-[var(--ink-soft)]">
                      {a.intros ? `${Math.round((a.wins / a.intros) * 100)}%` : "—"}
                    </td>
                  </tr>
                ))}
                {!leaderboard.length && (
                  <tr>
                    <td colSpan={4} className="px-3.5 py-4 text-center text-[12px] text-[var(--muted)]">
                      No introductions logged yet this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-8 text-[12px] text-[var(--muted)]">
        The firm maintains this network directly — {ALL_ATTORNEYS.length} attorneys, {ALL_CONTACTS.length}{" "}
        contacts, {LINKS.length} relationships across three practices. A {(COMMISSION_RATE * 100).toFixed(0)}%
        success fee is the platform&rsquo;s only revenue — nothing charged unless an introduction closes.
      </p>
    </motion.div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "good" | "accent" }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] px-5 py-4">
      <div
        className={`font-serif-display text-2xl tabular ${
          tone === "good" ? "text-[var(--good)]" : tone === "accent" ? "text-[var(--accent-ink)]" : "text-[var(--ink)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-[var(--muted)]">{label}</div>
    </div>
  );
}
