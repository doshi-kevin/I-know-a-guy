export type Practice = "visa" | "ip" | "patent";

export const PRACTICE_LABEL: Record<Practice, string> = {
  visa: "Visa Sponsorship",
  ip: "Intellectual Property",
  patent: "Patents",
};

export const PRACTICE_BLURB: Record<Practice, string> = {
  visa: "Sponsor employers & immigration counsel for O-1, H-1B and L-1 cases.",
  ip: "Trademark counsel and licensing brokers to protect your brand.",
  patent: "Patent attorneys and prior-art specialists to file and defend.",
};

export type ContactType = "immigration" | "sponsor" | "trademark" | "licensing" | "patent" | "priorart";

export const TYPE_LABEL: Record<ContactType, string> = {
  immigration: "Immigration Attorney",
  sponsor: "Corporate Sponsor",
  trademark: "Trademark Counsel",
  licensing: "IP Licensing Broker",
  patent: "Patent Attorney",
  priorart: "Prior Art Specialist",
};

export const PRACTICE_TYPES: Record<Practice, ContactType[]> = {
  visa: ["immigration", "sponsor"],
  ip: ["trademark", "licensing"],
  patent: ["patent", "priorart"],
};

export const TYPE_PRACTICE: Record<ContactType, Practice> = {
  immigration: "visa",
  sponsor: "visa",
  trademark: "ip",
  licensing: "ip",
  patent: "patent",
  priorart: "patent",
};

export type Sector = "edtech" | "saas" | "fintech" | "healthtech" | "deeptech" | "consumer";

export const SECTOR_LABEL: Record<Sector, string> = {
  edtech: "EdTech",
  saas: "B2B software",
  fintech: "Fintech",
  healthtech: "HealthTech",
  deeptech: "DeepTech / Hardware",
  consumer: "Consumer",
};

export type Stage = "pre-seed" | "seed" | "Series A" | "Series B" | "growth";

// Sub-specialty per practice — the "a few more details" the user gives.
export const FOCUS_OPTIONS: Record<Practice, { value: string; label: string }[]> = {
  visa: [
    { value: "h1b", label: "H-1B (specialty occupation)" },
    { value: "o1", label: "O-1 (extraordinary ability)" },
    { value: "l1", label: "L-1 (intra-company transfer)" },
  ],
  ip: [
    { value: "brand", label: "Brand & trademark" },
    { value: "licensing", label: "Licensing & royalties" },
  ],
  patent: [
    { value: "software", label: "Software & algorithms" },
    { value: "hardware", label: "Hardware & robotics" },
  ],
};

export const FOCUS_LABEL: Record<string, string> = {
  h1b: "H-1B sponsorship",
  o1: "O-1 (extraordinary ability)",
  l1: "L-1 (intra-company transfer)",
  brand: "Brand & trademark",
  licensing: "Licensing & royalties",
  software: "Software & algorithms",
  hardware: "Hardware & robotics",
};

export const COST_LABEL: Record<ContactType, string> = {
  immigration: "Typically $3k–$8k in filing and counsel fees.",
  sponsor: "No fee — the sponsor invests in the hire directly.",
  trademark: "Typically $2k–$6k for a defined engagement.",
  licensing: "Typically a % of licensing revenue, negotiated directly.",
  patent: "Typically $8k–$15k for a full application.",
  priorart: "Typically $1.5k–$4k for a search and report.",
};

// Representative value of an engagement once it closes — what the
// platform's 1% success fee is calculated against. Approximate midpoints
// of the ranges above (sponsor/licensing use the value of what changes
// hands, since there's no legal fee to anchor to).
export const DEAL_VALUE: Record<ContactType, number> = {
  immigration: 6000,
  sponsor: 15000,
  trademark: 4000,
  licensing: 50000,
  patent: 12000,
  priorart: 3000,
};
export const COMMISSION_RATE = 0.01;

export interface Attorney {
  id: string;
  kind: "attorney";
  name: string;
  practice: Practice;
  city: string;
  intros: number;
  wins: number;
}

export interface Client {
  id: string;
  kind: "client";
  name: string;
  contactName: string;
  sector: Sector;
  stage: Stage;
  city: string;
  team: string[]; // attorney ids
}

export interface Link {
  attorneyId: string;
  contactId: string;
  strength: number; // 0..1
  lastContactDays: number;
  touch90: number;
  years: number;
}

export interface Contact {
  id: string;
  kind: "contact";
  name: string;
  org: string;
  title: string;
  type: ContactType;
  focus?: string; // key into FOCUS_LABEL
  sectors: Sector[];
  stages: Stage[];
  city: string;
  n: number; // past intros
  s: number; // successful
  q: number; // hidden true quality (sim only)
  standing: "good" | "license lapsed";
  conflict?: { scope: "any" | "client"; client?: string; reason: string };
  finInterest?: string; // attorney id with recorded interest
  isNew?: boolean;
}

export type AnyNode = Attorney | Client | Contact;
