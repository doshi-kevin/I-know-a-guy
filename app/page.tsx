"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RadialNetwork, { Activation, IncomingClient } from "@/components/RadialNetwork";
import PipelineSteps from "@/components/PipelineSteps";
import RecommendationCard from "@/components/RecommendationCard";
import ConsentModal from "@/components/ConsentModal";
import IntakeForm, { IntakeState } from "@/components/IntakeForm";
import YesTracking from "@/components/YesTracking";
import NoTracking from "@/components/NoTracking";
import { ALL_ATTORNEYS, ALL_CONTACTS, LINKS } from "@/lib/data";
import { Need, RankResult, ScoredContact, rank } from "@/lib/engine";
import { PRACTICE_LABEL } from "@/lib/types";

type Phase = "intake" | "transition" | "searching" | "results" | "tracking-yes" | "tracking-no" | "done";
type Outcome = "sent" | "helped" | "not-helped";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function Page() {
  const [phase, setPhase] = useState<Phase>("intake");
  const [need, setNeed] = useState<Need | null>(null);
  const [result, setResult] = useState<RankResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [incoming, setIncoming] = useState<IncomingClient | null>(null);
  const [focusSeq, setFocusSeq] = useState(0);
  const [focusIds, setFocusIds] = useState<string[] | undefined>(undefined);
  const [consentFor, setConsentFor] = useState<ScoredContact | null>(null);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [creditNote, setCreditNote] = useState<string | null>(null);
  const [hoveredContact, setHoveredContact] = useState<string | null>(null);
  const [trackingContact, setTrackingContact] = useState<ScoredContact | null>(null);

  const goTo = (ids: string[]) => {
    setFocusIds(ids);
    setFocusSeq((n) => n + 1);
  };

  const runFlow = useCallback(async (intake: IntakeState) => {
    const n: Need = {
      raw: intake.detail,
      practice: intake.practice,
      focus: intake.focus,
      clientName: intake.companyName,
      sector: intake.sector,
      stage: intake.stage,
      city: intake.city,
      budget: intake.budget,
      urgency: intake.urgency,
    };
    setNeed(n);
    setOutcomes({});
    setCreditNote(null);

    // --- transition: the request flies from the user's company into the firm ---
    setPhase("transition");
    setIncoming({ id: "incoming", name: intake.companyName, arrived: false, t0: performance.now() });
    // let the network's own initial mount fit the whole tree, so the viewer
    // sees the full firm before the search narrows in on one branch
    await sleep(950);
    setIncoming((prev) => (prev ? { ...prev, arrived: true } : prev));
    await sleep(300);

    // --- searching: light up the matched branch, comb through its whole
    // roster in cascading waves, then narrow down to the picks ---
    setPhase("searching");
    setStepIndex(0);
    const res = rank(n);
    setResult(res);

    const branchAttorneys = ALL_ATTORNEYS.filter((a) => a.practice === n.practice).map((a) => a.id);
    const base: Activation = {
      practiceId: n.practice,
      attorneyIds: [],
      consideredContactIds: [],
      blockedContactIds: [],
      topContactIds: [],
    };
    setActivation(base);
    goTo([`p-${n.practice}`, ...branchAttorneys]);
    await sleep(550);

    // attorneys join the search one at a time — a quick cascade of blinks
    // down the branch rather than everyone appearing at once
    for (let i = 0; i < branchAttorneys.length; i++) {
      setActivation({ ...base, attorneyIds: branchAttorneys.slice(0, i + 1) });
      await sleep(130);
    }
    await sleep(300);

    setStepIndex(1);
    // comb through every candidate the engine actually has access to, in
    // waves — this is the "network searching itself" moment
    const wavesN = 5;
    const pool = res.poolIds;
    const waveSize = Math.max(1, Math.ceil(pool.length / wavesN));
    let revealed: string[] = [];
    for (let w = 0; w < wavesN && revealed.length < pool.length; w++) {
      revealed = pool.slice(0, revealed.length + waveSize);
      setActivation({ ...base, attorneyIds: branchAttorneys, consideredContactIds: revealed });
      await sleep(260);
    }
    await sleep(350);

    // narrow down to just the finalists and show anyone the safety check caught
    const consideredIds = [...res.top.map((s) => s.contact.id), ...res.review.map((r) => r.c.id), ...res.blocked.map((b) => b.c.id)];
    setActivation({
      practiceId: n.practice,
      attorneyIds: branchAttorneys,
      consideredContactIds: consideredIds,
      blockedContactIds: res.blocked.map((b) => b.c.id),
      topContactIds: [],
    });
    await sleep(750);

    setStepIndex(2);
    await sleep(550);

    setStepIndex(3);
    const topIds = res.top.map((s) => s.contact.id);
    const attorneyIds = res.top.map((s) => s.attorney?.id).filter(Boolean) as string[];
    setActivation({
      practiceId: n.practice,
      attorneyIds,
      consideredContactIds: consideredIds,
      blockedContactIds: res.blocked.map((b) => b.c.id),
      topContactIds: topIds,
    });
    goTo(["hub", `p-${n.practice}`, ...attorneyIds, ...topIds]);
    await sleep(550);

    setPhase("results");
  }, []);

  const approveIntro = useCallback(() => {
    if (!consentFor) return;
    setTrackingContact(consentFor);
    setOutcomes((o) => ({ ...o, [consentFor.contact.id]: "sent" }));
    setConsentFor(null);
    setTimeout(() => setPhase("tracking-yes"), 500);
  }, [consentFor]);

  const finishYes = useCallback((satisfied: boolean) => {
    const s = trackingContact;
    if (!s) return;
    setOutcomes((o) => ({ ...o, [s.contact.id]: satisfied ? "helped" : "not-helped" }));
    if (satisfied && s.attorney) {
      setCreditNote(
        `${s.contact.name.split(" ")[0]}'s record improves, and the credit for this introduction sits with ${s.attorney.name}. The recommender engine weighs this pairing higher next time.`
      );
    } else {
      setCreditNote("Logged. The engine now weighs this pairing lower for similar requests — it learns from misses too.");
    }
    setPhase("done");
  }, [trackingContact]);

  const finishNo = useCallback((outcome: "elsewhere-succeeded" | "elsewhere-failed", reason: string) => {
    if (outcome === "elsewhere-succeeded") {
      setCreditNote(`Gap logged for "${reason}" — the engine now prioritizes reaching out earlier next time this pattern shows up.`);
    } else {
      setCreditNote(`Reminder set for 30 days. The engine keeps this need open and will resurface a match automatically.`);
    }
    setPhase("done");
  }, []);

  const reset = () => {
    setPhase("intake");
    setNeed(null);
    setResult(null);
    setActivation(null);
    setIncoming(null);
    setOutcomes({});
    setCreditNote(null);
    goTo([]);
  };

  return (
    <div className="flex h-dvh flex-col bg-[var(--paper)]">
      <header className="flex shrink-0 items-center gap-4 border-b border-[var(--line)] px-6 py-3.5">
        <div className="flex items-baseline gap-2">
          <h1 className="font-serif-display text-[19px] font-medium text-[var(--ink)]">I Know a Guy</h1>
          <span className="text-[12px] text-[var(--muted)]">Hollis &amp; Crane LLP</span>
        </div>
        {phase !== "intake" && (
          <div className="ml-auto flex gap-5 text-right text-[11px] text-[var(--muted)]">
            <Stat label="Attorneys" value={ALL_ATTORNEYS.length} />
            <Stat label="Contacts" value={ALL_CONTACTS.length} />
            <Stat label="Relationships" value={LINKS.length} />
          </div>
        )}
      </header>

      {phase === "intake" ? (
        <main className="flex flex-1 items-center justify-center overflow-y-auto px-10 py-12">
          <IntakeForm onSubmit={runFlow} />
        </main>
      ) : (
        <main className="grid min-h-0 flex-1 grid-cols-5">
          <section className="col-span-3 relative border-r border-[var(--line)]">
            <RadialNetwork
              activation={activation}
              incoming={incoming}
              focusKey={String(focusSeq)}
              focusIds={focusIds}
              hoveredExternalId={hoveredContact}
            />
          </section>

          <section className="col-span-2 flex min-h-0 flex-col overflow-y-auto px-5 py-5">
            <AnimatePresence mode="wait">
              {phase === "transition" && (
                <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="h-2 w-2 animate-ping rounded-full bg-[var(--accent)]" />
                  <p className="mt-4 text-[13.5px] text-[var(--ink-soft)]">
                    Sending your request to Hollis &amp; Crane&rsquo;s recommender engine…
                  </p>
                </motion.div>
              )}

              {phase === "searching" && need && (
                <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col justify-center gap-6">
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-[var(--muted)]">Request</p>
                    <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
                      {need.clientName} needs {PRACTICE_LABEL[need.practice].toLowerCase()} help, {need.urgency}.
                    </p>
                  </div>
                  <PipelineSteps activeIndex={stepIndex} />
                </motion.div>
              )}

              {(phase === "results" || phase === "tracking-yes" || phase === "tracking-no" || phase === "done") && result && need && (
                <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-[var(--muted)]">Request</p>
                    <p className="mt-1 text-[13.5px] text-[var(--ink-soft)]">
                      {need.clientName} needs {PRACTICE_LABEL[need.practice].toLowerCase()} help, {need.urgency}.
                    </p>
                  </div>

                  <PipelineSteps activeIndex={4} />

                  {result.blocked.length > 0 && (
                    <div className="rounded-lg border border-[var(--bad)]/25 bg-[var(--bad-soft)] px-3.5 py-2.5">
                      <p className="text-[11.5px] font-medium text-[var(--bad)]">{result.blocked.length} removed by the safety check</p>
                      {result.blocked.map((b) => (
                        <p key={b.c.id} className="mt-0.5 text-[12px] text-[var(--ink-soft)]">
                          <b className="font-medium">{b.c.name}</b> — {b.reason}
                        </p>
                      ))}
                    </div>
                  )}

                  {phase === "results" && (
                    <>
                      <div className="flex flex-col gap-3">
                        {result.top.map((s, i) => (
                          <RecommendationCard
                            key={s.contact.id}
                            s={s}
                            rank={i}
                            outcome={outcomes[s.contact.id]}
                            onIntroduce={() => setConsentFor(s)}
                            onHover={(hovering) => setHoveredContact(hovering ? s.contact.id : null)}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setPhase("tracking-no")}
                        data-testid="no-thanks-btn"
                        className="w-fit text-[12px] text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]"
                      >
                        None of these work for me
                      </button>
                    </>
                  )}

                  {phase === "tracking-yes" && trackingContact && (
                    <YesTracking s={trackingContact} onDone={finishYes} />
                  )}

                  {phase === "tracking-no" && <NoTracking need={need} onDone={finishNo} />}

                  <AnimatePresence>
                    {creditNote && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-lg border border-[var(--good)]/25 bg-[var(--good-soft)] px-3.5 py-2.5 text-[12.5px] text-[var(--ink-soft)]"
                      >
                        {creditNote}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {phase === "done" && (
                    <button onClick={reset} className="mt-1 w-fit text-[12px] text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]">
                      Start over
                    </button>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      )}

      <ConsentModal open={!!consentFor} s={consentFor} need={need} onApprove={approveIntro} onCancel={() => setConsentFor(null)} />

      <footer className="shrink-0 border-t border-[var(--line)] px-6 py-2 text-center text-[10.5px] text-[var(--muted)]">
        All people, companies and outcomes are fictional. Prototype — mock data only.
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="tabular font-serif-display text-[15px] text-[var(--ink)]">{value}</div>
      <div className="text-[9.5px] uppercase tracking-wide">{label}</div>
    </div>
  );
}
