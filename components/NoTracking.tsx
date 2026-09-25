"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Need } from "@/lib/engine";

const REASONS = ["Too expensive", "Bad timing", "Already have someone", "Not a fit"];

type Outcome = "elsewhere-succeeded" | "elsewhere-failed";

export default function NoTracking({ need, onDone }: { need: Need; onDone: (outcome: Outcome, reason: string) => void }) {
  const [reason, setReason] = useState<string | null>(null);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!reason) return;
    // Deterministic-feeling mock: some scenarios "solved it elsewhere", some didn't.
    const hash = need.clientName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const succeeded = hash % 2 === 0;
    const rival = succeeded ? "Fairhaven Advisors" : null;
    const mockHeadlines = succeeded
      ? [
          `${need.clientName} completes its ${need.practice === "visa" ? "sponsorship" : need.practice === "ip" ? "trademark filing" : "patent filing"} via ${rival}`,
          `${rival} adds another ${need.sector} client this quarter`,
        ]
      : [`No public record of ${need.clientName} resolving this yet`, `Still listed as an open need in our follow-up queue`];

    let i = 0;
    const id = setInterval(() => {
      setHeadlines((h) => [...h, mockHeadlines[i]]);
      i++;
      if (i >= mockHeadlines.length) {
        clearInterval(id);
        setTimeout(() => setOutcome(succeeded ? "elsewhere-succeeded" : "elsewhere-failed"), 400);
      }
    }, 550);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reason]);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4">
      {!reason ? (
        <>
          <p className="text-[13px] text-[var(--ink)]">No problem — why not? This is the most useful thing you can tell us.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                data-testid="reason-chip"
                className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[12px] text-[var(--ink-soft)] hover:border-[var(--accent)]/50"
              >
                {r}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-[12px] uppercase tracking-wider text-[var(--muted)]">Watching public news — mock, from the sign-up agreement</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {headlines.map((h, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-md border-l-2 border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-[12px] text-[var(--ink-soft)]"
              >
                {h}
              </motion.p>
            ))}
          </div>

          {outcome && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 border-t border-[var(--line-soft)] pt-3">
              {outcome === "elsewhere-succeeded" ? (
                <p className="text-[12.5px] text-[var(--ink-soft)]">
                  They solved it without us. <b>Gap logged</b> — next time, we&rsquo;ll reach out earlier with a sharper
                  offer for {reason.toLowerCase()} situations like this one.
                </p>
              ) : (
                <p className="text-[12.5px] text-[var(--ink-soft)]">
                  They still haven&rsquo;t solved it. <b>Reminder set</b> for 30 days — worth reaching out again before
                  they find someone else.
                </p>
              )}
              <button
                onClick={() => onDone(outcome, reason)}
                data-testid="no-tracking-done"
                className="mt-2 rounded-md bg-[var(--ink)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--paper)]"
              >
                Got it
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
