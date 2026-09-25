import { CLIENTS, CONTACTS, byId, linksByContact } from "./data";
import { Attorney, Client, Contact, FOCUS_LABEL, Link, Practice, PRACTICE_TYPES, Sector, Stage } from "./types";

export interface Need {
  raw: string;
  practice: Practice;
  focus?: string;
  clientName: string;
  sector: Sector;
  stage: Stage;
  city: string;
  budget: number; // service fee budget in $, context only
  urgency: "this week" | "this month" | "no rush";
}

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const STAGES: Stage[] = ["pre-seed", "seed", "Series A", "Series B", "growth"];

export interface SafetyResult {
  status: "pass" | "review" | "block";
  reason: string;
}

export function safetyCheck(c: Contact, clientId: string): SafetyResult {
  if (c.standing !== "good") return { status: "block", reason: "not in good standing" };
  if (c.conflict) {
    const k = c.conflict;
    if (k.scope === "any" && clientId !== k.client) return { status: "block", reason: k.reason };
    if (k.scope === "client" && clientId === k.client) return { status: "block", reason: k.reason };
  }
  if (c.finInterest) {
    const a = byId.get(c.finInterest) as Attorney | undefined;
    return {
      status: "review",
      reason: `a partner (${a?.name ?? "at the firm"}) has a recorded financial interest — needs a quick look`,
    };
  }
  return { status: "pass", reason: "" };
}

export interface Warmth {
  W: number;
  recency: number;
  frequency: number;
  tenure: number;
}
function warmth(l: Link, onTeam: boolean): Warmth {
  const recency = clamp(1 - l.lastContactDays / 180);
  const frequency = clamp(l.touch90 / 12);
  const tenure = clamp(l.years / 8);
  let W = 0.45 * recency + 0.35 * frequency + 0.2 * tenure;
  if (onTeam) W += 0.05;
  return { W: clamp(W), recency, frequency, tenure };
}

export interface Alignment {
  A: number;
  sector: number;
  stage: number;
  place: number;
  focus: number;
}
function alignment(c: Contact, need: Need): Alignment {
  const sector = c.sectors.includes(need.sector) ? 1 : 0.25;
  const si = STAGES.indexOf(need.stage);
  let best = 9;
  c.stages.forEach((s) => {
    const d = Math.abs(STAGES.indexOf(s) - si);
    if (d < best) best = d;
  });
  const stage = best === 0 ? 1 : best === 1 ? 0.6 : 0.2;
  const place = c.city === need.city ? 1 : 0.6;
  const focus = !need.focus ? 0.7 : c.focus === need.focus ? 1 : 0.4;
  return { A: clamp(0.4 * sector + 0.2 * stage + 0.15 * place + 0.25 * focus), sector, stage, place, focus };
}

function record(c: Contact): number {
  return clamp((c.s + 2.2) / (c.n + 4));
}

export interface ScoredContact {
  contact: Contact;
  score: number;
  A: number;
  W: number;
  R: number;
  al: Alignment;
  w: Warmth;
  attorney: Attorney | null;
  link: Link | null;
  onTeam: boolean;
  safety: SafetyResult;
  explore?: boolean;
}

function scoreContact(c: Contact, need: Need, client: Client | undefined): ScoredContact {
  const al = alignment(c, need);
  const links = linksByContact.get(c.id) ?? [];
  let bestW: Warmth | null = null;
  let bestLink: Link | null = null;
  links.forEach((l) => {
    const onTeam = !!client?.team.includes(l.attorneyId);
    const w = warmth(l, onTeam);
    if (!bestW || w.W > bestW.W) {
      bestW = w;
      bestLink = l;
    }
  });
  if (!bestW) bestW = { W: 0, recency: 0, frequency: 0, tenure: 0 };
  const R = record(c);
  const score = (0.45 * al.A + 0.3 * bestW.W + 0.25 * R) * 100;
  const attorney = bestLink ? (byId.get((bestLink as Link).attorneyId) as Attorney) : null;
  return {
    contact: c,
    score,
    A: al.A,
    W: bestW.W,
    R,
    al,
    w: bestW,
    attorney,
    link: bestLink,
    onTeam: !!(client && bestLink && client.team.includes((bestLink as Link).attorneyId)),
    safety: safetyCheck(c, need.clientName),
  };
}

export interface RankResult {
  need: Need;
  client: Client | undefined;
  top: ScoredContact[];
  blocked: { c: Contact; reason: string }[];
  review: { c: Contact; reason: string }[];
  poolIds: string[]; // every candidate the engine actually looked at, for the search animation
  counts: { contacts: number; reachable: number; offering: number };
}

export function rank(need: Need): RankResult {
  // The requesting company isn't necessarily one of the firm's existing
  // clients — it's whoever just filled out the form. If the name happens to
  // match a known client (the default demo scenarios), use their team so
  // "already on this client's team" can show up; otherwise there's no team.
  const client = CLIENTS.find((c) => c.name.toLowerCase() === need.clientName.toLowerCase());
  const wantTypes = PRACTICE_TYPES[need.practice];
  const pool = CONTACTS.filter((c) => wantTypes.includes(c.type) && (linksByContact.get(c.id)?.length ?? 0) > 0);
  const blocked: { c: Contact; reason: string }[] = [];
  const review: { c: Contact; reason: string }[] = [];
  const scored: ScoredContact[] = [];

  pool.forEach((c) => {
    const sf = safetyCheck(c, client?.id ?? "");
    if (sf.status === "block") {
      blocked.push({ c, reason: sf.reason });
      return;
    }
    if (sf.status === "review") review.push({ c, reason: sf.reason });
    scored.push(scoreContact(c, need, client));
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  // Exploration slot: a promising newcomer earns a look even without a track record.
  const explorer = scored.find((s) => s.contact.n < 3 && s.A >= 0.75 && !top.includes(s));
  if (explorer && top.length === 3) {
    top[2] = explorer;
    explorer.explore = true;
  }

  return {
    need,
    client,
    top,
    blocked,
    review,
    poolIds: pool.map((c) => c.id),
    counts: { contacts: CONTACTS.length, reachable: pool.length, offering: pool.length },
  };
}

export function reasonFor(s: ScoredContact): string {
  const sectors = s.contact.sectors.join(", ");
  const track =
    s.contact.n > 0
      ? `${s.contact.s} of ${s.contact.n} past introductions led to an engagement.`
      : "No track record with us yet — this would be the first.";
  const focusNote = s.contact.focus ? ` Specializes in ${FOCUS_LABEL[s.contact.focus]}.` : "";
  return `Works with ${sectors} companies at ${s.contact.stages[0]}${
    s.contact.stages.length > 1 ? `–${s.contact.stages[s.contact.stages.length - 1]}` : ""
  } in ${s.contact.city}.${focusNote} ${track}`;
}

export function pathText(s: ScoredContact): string {
  if (!s.attorney || !s.link) return "No one at the firm knows them well yet.";
  return `Ask ${s.attorney.name} — ${s.link.touch90} touchpoints with ${s.contact.name.split(" ")[0]} in the last 90 days${
    s.onTeam ? ", already on this client's team" : ""
  }.`;
}

export function tierOf(score: number): { label: string; tone: "strong" | "good" | "dev" } {
  if (score >= 80) return { label: "Strong", tone: "strong" };
  if (score >= 60) return { label: "Good", tone: "good" };
  return { label: "Developing", tone: "dev" };
}

export const ALL_STAGES = STAGES;
