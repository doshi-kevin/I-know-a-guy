"use client";

import { motion } from "framer-motion";
import { ScoredContact, pathText, reasonFor, tierOf } from "@/lib/engine";
import { COST_LABEL, FOCUS_LABEL, TYPE_LABEL } from "@/lib/types";

const TONE_CLASS: Record<string, string> = {
  strong: "text-[var(--good)]",
  good: "text-[var(--accent-ink)]",
  dev: "text-[var(--muted)]",
};

export default function RecommendationCard({
  s,
  rank,
  outcome,
  onIntroduce,
  onHover,
}: {
  s: ScoredContact;
  rank: number;
  outcome?: "sent" | "helped" | "not-helped";
  onIntroduce: () => void;
  onHover?: (hovering: boolean) => void;
}) {
  const tier = tierOf(s.score);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: rank * 0.08 }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`rounded-xl border bg-[var(--paper-raised)] p-4 shadow-sm transition-shadow ${
        rank === 0 ? "border-[var(--accent)]/50 shadow-[0_2px_16px_rgba(180,130,62,0.12)]" : "border-[var(--line)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-serif-display text-sm text-[var(--muted)]">{rank + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate font-serif-display text-[17px] font-medium text-[var(--ink)]">
              {s.contact.name}
            </h3>
            <div className="shrink-0 text-right">
              <div className="font-serif-display text-xl leading-none tabular text-[var(--ink)]">
                {Math.round(s.score)}
              </div>
              <div className={`text-[10px] font-medium uppercase tracking-wide ${TONE_CLASS[tier.tone]}`}>
                {tier.label}
              </div>
            </div>
          </div>
          <div className="text-[12.5px] text-[var(--muted)]">
            {s.contact.org} · {s.contact.title}
          </div>

          <div className="mt-2.5 flex gap-4">
            {[
              ["Warmth", s.W],
              ["Fit", s.A],
              ["Record", s.R],
            ].map(([label, v]) => (
              <div key={label as string} className="flex-1">
                <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
                <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-[var(--line-soft)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${Math.round((v as number) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-2.5 text-[13px] leading-snug text-[var(--ink-soft)]">{reasonFor(s)}</p>
          <p className="mt-1.5 text-[12.5px] italic text-[var(--accent-ink)]">↳ {pathText(s)}</p>

          <p className="mt-1 text-[11.5px] text-[var(--muted)]">{COST_LABEL[s.contact.type]}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10.5px] text-[var(--muted)]">
              {TYPE_LABEL[s.contact.type]}
            </span>
            {s.contact.focus && (
              <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10.5px] text-[var(--muted)]">
                {FOCUS_LABEL[s.contact.focus]}
              </span>
            )}
            {s.explore && (
              <span className="rounded-full border border-[var(--investor)]/30 bg-[var(--investor)]/10 px-2 py-0.5 text-[10.5px] text-[var(--investor)]">
                New contact · testing
              </span>
            )}
            {s.safety.status === "review" && (
              <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2 py-0.5 text-[10.5px] text-[var(--accent-ink)]">
                Needs a partner look
              </span>
            )}
          </div>

          <div className="mt-3">
            {!outcome && (
              <button
                onClick={onIntroduce}
                data-testid="introduce-btn"
                className="rounded-md bg-[var(--ink)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--accent-ink)]"
              >
                Introduce me
              </button>
            )}
            {outcome === "sent" && (
              <span className="text-[12.5px] text-[var(--muted)]">Introduction sent — awaiting reply</span>
            )}
            {outcome === "helped" && (
              <span className="text-[12.5px] font-medium text-[var(--good)]">✓ It helped — credited</span>
            )}
            {outcome === "not-helped" && (
              <span className="text-[12.5px] font-medium text-[var(--bad)]">Didn&rsquo;t work out — logged</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
