"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Need, ScoredContact } from "@/lib/engine";

export default function ConsentModal({
  open,
  s,
  need,
  onApprove,
  onCancel,
}: {
  open: boolean;
  s: ScoredContact | null;
  need: Need | null;
  onApprove: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && s && need && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#211D16]/40 p-6 backdrop-blur-[2px]"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--paper-raised)] p-6 shadow-xl"
          >
            <h3 className="font-serif-display text-lg font-medium text-[var(--ink)]">Approve this introduction</h3>
            <p className="mt-1 text-[12.5px] text-[var(--muted)]">
              {need.clientName} sees exactly this before anything is sent.
            </p>
            <div className="mt-4 rounded-lg border border-[var(--line-soft)] bg-[var(--paper)] p-3.5 text-[13px] leading-relaxed text-[var(--ink-soft)]">
              Hi {s.contact.name.split(" ")[0]} — {s.attorney?.name ?? "the team"} here.
              <br />
              <br />
              {need.clientName} is an early-stage {need.sector} company looking for help{" "}
              {need.urgency === "no rush" ? "in the coming months" : need.urgency}. You two haven&rsquo;t met — given your work
              with {s.contact.sectors[0]} companies, I thought it was worth an introduction. May I connect you by email?
              <br />
              <br />— {s.attorney?.name ?? "Hollis & Crane"}, Hollis &amp; Crane LLP
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={onApprove}
                data-testid="approve-btn"
                className="rounded-md bg-[var(--ink)] px-4 py-2 text-[13px] font-medium text-[var(--paper)] hover:bg-[var(--accent-ink)]"
              >
                Approve and send
              </button>
              <button
                onClick={onCancel}
                className="rounded-md border border-[var(--line)] px-4 py-2 text-[13px] text-[var(--ink-soft)] hover:bg-[var(--line-soft)]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
