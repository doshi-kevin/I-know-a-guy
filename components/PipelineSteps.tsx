"use client";

const STEPS = [
  { key: "find", label: "Find", done: "Searched the firm's network" },
  { key: "safety", label: "Safety check", done: "Conflicts & standing checked" },
  { key: "score", label: "Score", done: "Ranked on warmth, fit & record" },
  { key: "explain", label: "Explain", done: "Reasons ready to share" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export default function PipelineSteps({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {STEPS.map((step, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <div
            key={step.key}
            className={`rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
              state === "pending"
                ? "border-[var(--line)] bg-[var(--paper-raised)]/40 opacity-50"
                : state === "active"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-[var(--paper-raised)]"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  state === "done" ? "bg-[var(--good)]" : state === "active" ? "bg-[var(--accent)]" : "bg-[var(--line)]"
                }`}
              />
              {step.label}
            </div>
            <div className="mt-1 text-[12px] leading-snug text-[var(--ink-soft)]">
              {state === "pending" ? " " : step.done}
            </div>
          </div>
        );
      })}
    </div>
  );
}
