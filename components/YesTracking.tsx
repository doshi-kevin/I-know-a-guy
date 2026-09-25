"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScoredContact } from "@/lib/engine";

const STEPS = ["Introduction sent", "Contact replied", "Meeting scheduled", "Engagement started"];

export default function YesTracking({
  s,
  onDone,
}: {
  s: ScoredContact;
  onDone: (satisfied: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [askSatisfaction, setAskSatisfaction] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setStepIndex(i);
      if (i >= STEPS.length) {
        clearInterval(id);
        setTimeout(() => setAskSatisfaction(true), 500);
      }
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-4">
      <p className="text-[12px] uppercase tracking-wider text-[var(--muted)]">Tracking this introduction</p>
      <p className="mt-1 text-[13.5px] text-[var(--ink)]">
        {s.contact.name} · <span className="text-[var(--muted)]">two-week follow-up</span>
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {STEPS.map((label, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: state === "pending" ? 0.35 : 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  state === "done" ? "bg-[var(--good)]" : state === "active" ? "bg-[var(--accent)] animate-pulse" : "bg-[var(--line)]"
                }`}
              />
              <span className="text-[12.5px] text-[var(--ink-soft)]">{label}</span>
            </motion.div>
          );
        })}
      </div>

      {askSatisfaction && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border-t border-[var(--line-soft)] pt-3">
          <p className="text-[13px] text-[var(--ink)]">Did the introduction actually help — did they spend the money, get the outcome they needed?</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onDone(true)}
              data-testid="helped-btn"
              className="rounded-md bg-[var(--good)] px-3 py-1.5 text-[12px] font-medium text-white"
            >
              Yes, it worked
            </button>
            <button
              onClick={() => onDone(false)}
              className="rounded-md border border-[var(--line)] px-3 py-1.5 text-[12px] text-[var(--ink-soft)]"
            >
              Not really
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
