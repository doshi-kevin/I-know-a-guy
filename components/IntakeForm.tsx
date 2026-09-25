"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FOCUS_OPTIONS,
  PRACTICE_BLURB,
  PRACTICE_LABEL,
  Practice,
  SECTOR_LABEL,
  Sector,
  Stage,
} from "@/lib/types";

export interface IntakeState {
  practice: Practice;
  focus: string;
  budget: number;
  urgency: "this week" | "this month" | "no rush";
  detail: string;
  companyName: string;
  contactName: string;
  sector: Sector;
  stage: Stage;
  city: string;
}

// Each practice gets its own complete, self-consistent example — switching
// the card swaps the whole scenario, not just the category, so the detail
// text never ends up describing a different company's situation.
const PRESETS: Record<Practice, Omit<IntakeState, "budget" | "urgency">> = {
  visa: {
    practice: "visa",
    focus: "h1b",
    detail: "Our lead engineer's OPT work authorization runs out in 60 days — we need an employer willing to sponsor his H-1B so he can stay on full-time.",
    companyName: "Vellum Learning",
    contactName: "Priya Raman, CEO",
    sector: "edtech",
    stage: "seed",
    city: "New York",
  },
  ip: {
    practice: "ip",
    focus: "brand",
    detail: "We're about to launch under a new brand name and want it trademarked before a competitor files first.",
    companyName: "Meridian Health",
    contactName: "Maya Lindgren, CEO",
    sector: "healthtech",
    stage: "seed",
    city: "Boston",
  },
  patent: {
    practice: "patent",
    focus: "hardware",
    detail: "We've built a novel robotics gripper mechanism and want to file a patent before we demo it publicly.",
    companyName: "Tern Robotics",
    contactName: "Ana Kowalski, CEO",
    sector: "deeptech",
    stage: "seed",
    city: "Boston",
  },
};

export const DEFAULT_INTAKE: IntakeState = { ...PRESETS.visa, budget: 2000, urgency: "this week" };

const PRACTICE_ICON: Record<Practice, string> = { visa: "🛂", ip: "™️", patent: "📄" };
const CITIES = ["New York", "Boston", "Washington DC"];
const STAGES: Stage[] = ["pre-seed", "seed", "Series A", "Series B", "growth"];
const BUDGETS = [500, 1000, 2000, 5000];

export default function IntakeForm({ onSubmit }: { onSubmit: (state: IntakeState) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [state, setState] = useState<IntakeState>(DEFAULT_INTAKE);

  const set = <K extends keyof IntakeState>(key: K, value: IntakeState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-9 flex items-center gap-3 text-[14px] text-[var(--muted)]">
        <StepDot active={step === 1} done={step === 2} n={1} />
        <span className={step === 1 ? "font-medium text-[var(--ink)]" : ""}>What&rsquo;s going on</span>
        <span className="mx-1 h-px w-14 bg-[var(--line)]" />
        <StepDot active={step === 2} done={false} n={2} />
        <span className={step === 2 ? "font-medium text-[var(--ink)]" : ""}>About your company</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="font-serif-display text-4xl font-medium leading-tight text-[var(--ink)]">
              What do you need help with?
            </h2>
            <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-5">
              <select
                value={state.practice}
                onChange={(e) => setState((s) => ({ ...s, ...PRESETS[e.target.value as Practice] }))}
                data-testid="practice-select"
                className="input text-[17px] font-medium"
              >
                {(Object.keys(PRACTICE_LABEL) as Practice[]).map((p) => (
                  <option key={p} value={p}>
                    {PRACTICE_ICON[p]} {PRACTICE_LABEL[p]}
                  </option>
                ))}
              </select>
              <p className="mt-2.5 text-[13.5px] leading-snug text-[var(--muted)]">{PRACTICE_BLURB[state.practice]}</p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-5">
              <Field label="Specifically…">
                <select value={state.focus} onChange={(e) => set("focus", e.target.value)} className="input">
                  {FOCUS_OPTIONS[state.practice].map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="How soon">
                <select
                  value={state.urgency}
                  onChange={(e) => set("urgency", e.target.value as IntakeState["urgency"])}
                  className="input"
                >
                  <option value="this week">This week</option>
                  <option value="this month">This month</option>
                  <option value="no rush">No rush</option>
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label={`Budget for this — $${state.budget.toLocaleString()}`}>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={BUDGETS.indexOf(state.budget)}
                  onChange={(e) => set("budget", BUDGETS[parseInt(e.target.value, 10)])}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Anything else we should know?">
                <textarea
                  value={state.detail}
                  onChange={(e) => set("detail", e.target.value)}
                  rows={3}
                  className="input resize-none"
                />
              </Field>
            </div>

            <button
              onClick={() => setStep(2)}
              data-testid="intake-next"
              className="mt-8 w-fit rounded-lg bg-[var(--ink)] px-8 py-4 text-[16px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--accent-ink)]"
            >
              Next →
            </button>
          </motion.div>
        ) : (
          <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="font-serif-display text-4xl font-medium leading-tight text-[var(--ink)]">
              Tell us about your company
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-5">
              <Field label="Company name">
                <input value={state.companyName} onChange={(e) => set("companyName", e.target.value)} className="input" />
              </Field>
              <Field label="Your name & role">
                <input value={state.contactName} onChange={(e) => set("contactName", e.target.value)} className="input" />
              </Field>
              <Field label="What do you do">
                <select value={state.sector} onChange={(e) => set("sector", e.target.value as Sector)} className="input">
                  {(Object.keys(SECTOR_LABEL) as Sector[]).map((s) => (
                    <option key={s} value={s}>
                      {SECTOR_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Stage">
                <select value={state.stage} onChange={(e) => set("stage", e.target.value as Stage)} className="input">
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <select value={state.city} onChange={(e) => set("city", e.target.value)} className="input">
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-[var(--line)] px-6 py-4 text-[15px] text-[var(--ink-soft)] hover:bg-[var(--line-soft)]"
              >
                ← Back
              </button>
              <button
                onClick={() => onSubmit(state)}
                data-testid="intake-submit"
                className="rounded-lg bg-[var(--ink)] px-8 py-4 text-[16px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--accent-ink)]"
              >
                Send to Hollis &amp; Crane →
              </button>
            </div>
            <p className="mt-4 text-[13px] text-[var(--muted)]">
              Nothing is shared with anyone until you approve a specific introduction.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--paper-raised);
          border-radius: 10px;
          padding: 13px 15px;
          font-size: 15px;
          color: var(--ink);
        }
        .input:focus {
          outline: 2px solid var(--accent);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[12.5px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</div>
      {children}
    </label>
  );
}

function StepDot({ active, done, n }: { active: boolean; done: boolean; n: number }) {
  return (
    <span
      className={`grid h-7 w-7 place-items-center rounded-full text-[12.5px] font-semibold ${
        active ? "bg-[var(--ink)] text-[var(--paper)]" : done ? "bg-[var(--accent)] text-white" : "bg-[var(--line-soft)] text-[var(--muted)]"
      }`}
    >
      {n}
    </span>
  );
}
