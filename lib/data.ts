import { Attorney, Client, Contact, Link } from "./types";

/**
 * I Know a Guy — Hollis & Crane LLP (fictional).
 * A small, focused network across three niches: Visa Sponsorship, IP and
 * Patents. Built to be readable at a glance, not exhaustive.
 * All people, companies and outcomes are fictional.
 */

export const ATTORNEYS: Attorney[] = [
  { id: "a1", kind: "attorney", name: "Dana Whitfield", practice: "visa", city: "Boston", intros: 12, wins: 8 },
  { id: "a2", kind: "attorney", name: "Julian Park", practice: "visa", city: "New York", intros: 21, wins: 15 },
  { id: "a3", kind: "attorney", name: "Nadia Farouk", practice: "visa", city: "Washington DC", intros: 9, wins: 6 },
  { id: "a9", kind: "attorney", name: "Priya Kapoor", practice: "visa", city: "New York", intros: 8, wins: 5 },
  { id: "a4", kind: "attorney", name: "Sofia Brandt", practice: "ip", city: "New York", intros: 14, wins: 8 },
  { id: "a5", kind: "attorney", name: "Owen Achebe", practice: "ip", city: "Boston", intros: 17, wins: 12 },
  { id: "a6", kind: "attorney", name: "Marcus Oyelaran", practice: "ip", city: "New York", intros: 11, wins: 7 },
  { id: "a10", kind: "attorney", name: "Lucia Ferreira", practice: "ip", city: "Washington DC", intros: 7, wins: 4 },
  { id: "a7", kind: "attorney", name: "Elena Sorvino", practice: "patent", city: "Boston", intros: 13, wins: 9 },
  { id: "a8", kind: "attorney", name: "Caleb Moreno", practice: "patent", city: "Boston", intros: 10, wins: 6 },
  { id: "a11", kind: "attorney", name: "Tomás Reyes", practice: "patent", city: "Washington DC", intros: 9, wins: 5 },
  { id: "a12", kind: "attorney", name: "Grace Linwood", practice: "patent", city: "New York", intros: 6, wins: 4 },
];

export const CLIENTS: Client[] = [
  {
    id: "vellum",
    kind: "client",
    name: "Vellum Learning",
    contactName: "Priya Raman, CEO",
    sector: "edtech",
    stage: "seed",
    city: "New York",
    team: ["a2", "a3"],
  },
  {
    id: "meridian",
    kind: "client",
    name: "Meridian Health",
    contactName: "Maya Lindgren, CEO",
    sector: "healthtech",
    stage: "seed",
    city: "Boston",
    team: ["a5", "a4"],
  },
  {
    id: "tern",
    kind: "client",
    name: "Tern Robotics",
    contactName: "Ana Kowalski, CEO",
    sector: "deeptech",
    stage: "seed",
    city: "Boston",
    team: ["a7", "a8"],
  },
];

// Hand-written contacts that drive the story.
const HAND: Contact[] = [
  // --- Visa sponsorship ---
  {
    id: "b1", kind: "contact", name: "Lena Hartigan", org: "Bayforge Immigration Partners", title: "Global Mobility Counsel",
    type: "immigration", focus: "h1b", sectors: ["edtech", "saas"], stages: ["seed", "Series A"], city: "New York",
    n: 11, s: 9, q: 0.82, standing: "good",
  },
  {
    id: "b2", kind: "contact", name: "Andre Solis", org: "Northgate EdTech Alliance", title: "Talent Mobility Partner",
    type: "sponsor", focus: "h1b", sectors: ["edtech", "saas"], stages: ["seed", "Series A"], city: "New York",
    n: 14, s: 8, q: 0.58, standing: "good",
  },
  {
    id: "b3", kind: "contact", name: "Priti Venkat", org: "Copperline Immigration Law", title: "Startup Immigration",
    type: "immigration", focus: "o1", sectors: ["edtech", "fintech"], stages: ["seed", "Series A"], city: "New York",
    n: 1, s: 1, q: 0.9, standing: "good",
  },
  {
    id: "b4", kind: "contact", name: "Wes Calder", org: "Stonebridge Immigration Group", title: "Corporate Immigration",
    type: "immigration", focus: "h1b", sectors: ["edtech", "saas"], stages: ["seed", "Series A"], city: "New York",
    n: 9, s: 6, q: 0.66, standing: "good",
    conflict: { scope: "any", reason: "represents a competing edtech company in an active visa matter" },
  },
  // --- IP ---
  {
    id: "i1", kind: "contact", name: "Keiko Tanabe", org: "Meridian Arc IP", title: "Trademark & Brand Counsel",
    type: "trademark", focus: "brand", sectors: ["healthtech"], stages: ["seed", "Series A"], city: "Boston",
    n: 8, s: 6, q: 0.76, standing: "good",
  },
  {
    id: "i2", kind: "contact", name: "Imogen Blake", org: "Fairhaven IP Partners", title: "Licensing Broker",
    type: "licensing", focus: "licensing", sectors: ["healthtech", "edtech"], stages: ["seed"], city: "Boston",
    n: 12, s: 8, q: 0.72, standing: "good",
  },
  {
    id: "i3", kind: "contact", name: "Hugo Lindahl", org: "Salt Marsh Brand Law", title: "Trademark Counsel",
    type: "trademark", focus: "brand", sectors: ["healthtech", "consumer"], stages: ["seed", "Series A"], city: "Washington DC",
    n: 5, s: 4, q: 0.78, standing: "good",
  },
  // --- Patents ---
  {
    id: "p1", kind: "contact", name: "Morgan Achterberg", org: "Pillar & Vane IP", title: "Patent Attorney — Software",
    type: "patent", focus: "software", sectors: ["deeptech", "saas"], stages: ["seed", "Series A"], city: "Boston",
    n: 13, s: 10, q: 0.78, standing: "good",
  },
  {
    id: "p2", kind: "contact", name: "Rachel Dunmore", org: "Dunmore Search Group", title: "Prior Art Search",
    type: "priorart", focus: "software", sectors: ["deeptech", "saas"], stages: ["seed", "Series A"], city: "New York",
    n: 9, s: 7, q: 0.76, standing: "good",
  },
  {
    id: "p3", kind: "contact", name: "Anika Rao", org: "Portside Patent Group", title: "Patent Attorney — Robotics",
    type: "patent", focus: "hardware", sectors: ["deeptech"], stages: ["seed", "Series A"], city: "Boston",
    n: 10, s: 8, q: 0.8, standing: "good",
  },
];

// A little ambient texture so the tree looks like a real practice, without
// drowning the one flow that matters.
const FIRST = [
  "Owen", "Nadia", "Hannah", "Raj", "Selma", "Ilias", "Noor", "Delia", "Odile", "Kai", "Ravi", "Zara",
  "Marcus", "Elena", "Theo", "Priya", "Colin", "Renata", "Dmitri", "Fiona", "Amir", "Saoirse", "Lukas", "Ines",
];
const LAST = [
  "Achebe", "Farouk", "Kessler", "Collins", "Alverson", "Ivers", "Thackeray", "Merriweather", "Mandel", "Lomond", "Verhoeven", "Stroud",
  "Bianchi", "Okafor", "Petrov", "Guzman", "Whitfield", "Sorensen", "Delacroix", "Nakamura", "Brennan", "Castellano", "Marsh", "Yilmaz",
];
const ORGS = [
  "Granite Row Immigration", "Longspur Trademark Group", "Quarry Hill Patent Partners", "Lantern Street IP",
  "Ironclad Patent Search", "Brightline Sponsor Network", "Northwind Licensing", "Fieldstone Immigration",
  "Silverbirch Visa Partners", "Windrow Trademark Counsel", "Foxglove Patent Group", "Clearwater Sponsor Alliance",
  "Ambervale IP Search", "Highmoor Immigration Law", "Redstone Licensing Partners", "Oxbow Patent Advisors",
];

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260925);
const TYPES: Array<Contact["type"]> = ["immigration", "sponsor", "trademark", "licensing", "patent", "priorart"];
const FOCUS_BY_TYPE: Record<string, string[]> = {
  immigration: ["h1b", "o1", "l1"],
  sponsor: ["h1b", "l1"],
  trademark: ["brand"],
  licensing: ["licensing"],
  patent: ["software", "hardware"],
  priorart: ["software", "hardware"],
};
const SECTORS: Array<Contact["sectors"][number]> = ["edtech", "saas", "fintech", "healthtech", "deeptech", "consumer"];
const STAGES: Array<Contact["stages"][number]> = ["seed", "Series A", "Series B"];
const CITIES = ["New York", "Boston", "Washington DC"];

// Never let a generated contact collide with a real attorney or client name.
// Pre-shuffle every First x Last combination (288 of them) and hand them out
// in order, skipping any that collide — guarantees no duplicates and no
// wasted "Contact 42" fallbacks the way a diagonal-shift search could.
const takenNames = new Set<string>([...ATTORNEYS.map((a) => a.name), ...CLIENTS.map((c) => c.name), ...HAND.map((c) => c.name)]);
const namePool: string[] = [];
FIRST.forEach((f) => LAST.forEach((l) => namePool.push(`${f} ${l}`)));
for (let i = namePool.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [namePool[i], namePool[j]] = [namePool[j], namePool[i]];
}
let namePoolCursor = 0;
function uniqueFillerName(i: number): string {
  while (namePoolCursor < namePool.length) {
    const name = namePool[namePoolCursor++];
    if (!takenNames.has(name)) {
      takenNames.add(name);
      return name;
    }
  }
  return `Contact ${i}`;
}

const FILLER: Contact[] = Array.from({ length: 110 }).map((_, i) => {
  const type = TYPES[Math.floor(rand() * TYPES.length)];
  const sector = SECTORS[Math.floor(rand() * SECTORS.length)];
  const n = Math.floor(rand() * 10);
  const s = Math.min(n, Math.round(n * (0.3 + rand() * 0.4)));
  const focusPool = FOCUS_BY_TYPE[type];
  return {
    id: `x${i}`,
    kind: "contact",
    name: uniqueFillerName(i),
    org: ORGS[i % ORGS.length],
    title: "Advisor",
    type,
    focus: focusPool[Math.floor(rand() * focusPool.length)],
    sectors: [sector],
    stages: [STAGES[Math.floor(rand() * STAGES.length)]],
    city: CITIES[Math.floor(rand() * CITIES.length)],
    n,
    s,
    q: 0.4 + rand() * 0.4,
    standing: "good",
  } as Contact;
});

export const CONTACTS: Contact[] = [...HAND, ...FILLER];

// Attorney -> contact relationships. Hand-tuned for the hero contacts,
// generated lightly for the rest.
const HAND_LINKS: Link[] = [
  { attorneyId: "a2", contactId: "b1", strength: 0.9, lastContactDays: 6, touch90: 14, years: 4 },
  { attorneyId: "a3", contactId: "b1", strength: 0.35, lastContactDays: 60, touch90: 3, years: 1 },
  { attorneyId: "a2", contactId: "b2", strength: 0.8, lastContactDays: 10, touch90: 9, years: 3 },
  { attorneyId: "a3", contactId: "b3", strength: 0.45, lastContactDays: 40, touch90: 3, years: 0.5 },
  { attorneyId: "a2", contactId: "b3", strength: 0.4, lastContactDays: 55, touch90: 3, years: 1 },
  { attorneyId: "a2", contactId: "b4", strength: 0.5, lastContactDays: 30, touch90: 4, years: 2 },
  { attorneyId: "a5", contactId: "i1", strength: 0.9, lastContactDays: 5, touch90: 13, years: 5 },
  { attorneyId: "a4", contactId: "i1", strength: 0.5, lastContactDays: 30, touch90: 4, years: 2 },
  { attorneyId: "a5", contactId: "i2", strength: 0.8, lastContactDays: 8, touch90: 9, years: 3 },
  { attorneyId: "a6", contactId: "i3", strength: 0.7, lastContactDays: 15, touch90: 7, years: 3 },
  { attorneyId: "a7", contactId: "p1", strength: 0.9, lastContactDays: 5, touch90: 12, years: 4 },
  { attorneyId: "a8", contactId: "p1", strength: 0.45, lastContactDays: 40, touch90: 4, years: 1 },
  { attorneyId: "a7", contactId: "p2", strength: 0.7, lastContactDays: 15, touch90: 6, years: 2 },
  { attorneyId: "a8", contactId: "p3", strength: 0.85, lastContactDays: 6, touch90: 11, years: 4 },
];

const PRACTICE_OF: Record<string, "visa" | "ip" | "patent"> = {
  immigration: "visa", sponsor: "visa", trademark: "ip", licensing: "ip", patent: "patent", priorart: "patent",
};

const FILLER_LINKS: Link[] = [];
FILLER.forEach((c, i) => {
  const practice = PRACTICE_OF[c.type];
  const candidates = ATTORNEYS.filter((a) => a.practice === practice);
  const attorney = candidates.length ? candidates[i % candidates.length] : ATTORNEYS[i % ATTORNEYS.length];
  const strength = 0.15 + rand() * 0.45;
  FILLER_LINKS.push({
    attorneyId: attorney.id,
    contactId: c.id,
    strength,
    lastContactDays: Math.round(10 + (1 - strength) * 160),
    touch90: Math.round(strength * 10),
    years: +(0.5 + strength * 6).toFixed(1),
  });
  // A light second tie *within the same practice*, so a branch has a little
  // internal texture without stray lines crossing the whole tree.
  if (i % 4 === 0) {
    const same = candidates.filter((a) => a.id !== attorney.id);
    const other = same[i % Math.max(1, same.length)];
    if (other) {
      FILLER_LINKS.push({
        attorneyId: other.id,
        contactId: c.id,
        strength: 0.1 + rand() * 0.2,
        lastContactDays: 90,
        touch90: 1,
        years: 1,
      });
    }
  }
});

export const LINKS: Link[] = [...HAND_LINKS, ...FILLER_LINKS];

// One filler contact flagged for a partner financial-interest review, one
// with a lapsed license — so the safety check has something real to catch.
const reviewCandidate = FILLER.find((c) => c.type === "trademark" || c.type === "patent");
if (reviewCandidate) reviewCandidate.finInterest = "a4";
const lapsedCandidate = FILLER.find((c) => c.id !== reviewCandidate?.id && (c.type === "immigration" || c.type === "priorart"));
if (lapsedCandidate) lapsedCandidate.standing = "license lapsed";

// Convenience aliases used across components.
export const ALL_ATTORNEYS = ATTORNEYS;
export const ALL_CLIENTS = CLIENTS;
export const ALL_CONTACTS = CONTACTS;

export const byId = new Map<string, Attorney | Client | Contact>();
[...ATTORNEYS, ...CLIENTS, ...CONTACTS].forEach((n) => byId.set(n.id, n));

export const linksByContact = new Map<string, Link[]>();
export const linksByAttorney = new Map<string, Link[]>();
LINKS.forEach((l) => {
  if (!linksByContact.has(l.contactId)) linksByContact.set(l.contactId, []);
  linksByContact.get(l.contactId)!.push(l);
  if (!linksByAttorney.has(l.attorneyId)) linksByAttorney.set(l.attorneyId, []);
  linksByAttorney.get(l.attorneyId)!.push(l);
});

// Each contact's "home" attorney — the strongest tie — used to place it on
// exactly one branch of the tree, even though scoring still considers every
// tie it actually has.
export function homeAttorneyId(contactId: string): string | undefined {
  const links = linksByContact.get(contactId);
  if (!links || !links.length) return undefined;
  return links.slice().sort((a, b) => b.strength - a.strength)[0].attorneyId;
}
