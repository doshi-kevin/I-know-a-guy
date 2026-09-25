import { Practice, Sector } from "./types";

export type LogStatus = "pending" | "sent" | "won" | "lost" | "declined";

export interface LogEntry {
  id: string;
  companyName: string;
  practice: Practice;
  sector: Sector;
  attorneyId?: string;
  attorneyName?: string;
  contactId?: string;
  contactName?: string;
  status: LogStatus;
  dealValue?: number;
  commission?: number;
  reason?: string;
  ts: number;
}

// A little history, so the firm's dashboard doesn't look empty the first
// time you switch to it — this is what "a few weeks of real use" would
// look like. All fictional.
export const SEED_LOG: LogEntry[] = [
  {
    id: "seed-1", companyName: "Halyard Robotics", practice: "patent", sector: "deeptech",
    attorneyId: "a7", attorneyName: "Elena Sorvino", contactId: "p1", contactName: "Morgan Achterberg",
    status: "won", dealValue: 12000, commission: 120, ts: Date.now() - 12 * 86400000,
  },
  {
    id: "seed-2", companyName: "Northfield Analytics", practice: "visa", sector: "fintech",
    attorneyId: "a2", attorneyName: "Julian Park", contactId: "b1", contactName: "Lena Hartigan",
    status: "won", dealValue: 6000, commission: 60, ts: Date.now() - 9 * 86400000,
  },
  {
    id: "seed-3", companyName: "Bramblewood Health", practice: "ip", sector: "healthtech",
    attorneyId: "a5", attorneyName: "Owen Achebe", contactId: "i1", contactName: "Keiko Tanabe",
    status: "won", dealValue: 4000, commission: 40, ts: Date.now() - 7 * 86400000,
  },
  {
    id: "seed-4", companyName: "Solace Robotics", practice: "patent", sector: "deeptech",
    attorneyId: "a8", attorneyName: "Caleb Moreno", contactId: "p3", contactName: "Anika Rao",
    status: "lost", ts: Date.now() - 5 * 86400000,
  },
  {
    id: "seed-5", companyName: "Pinegate Consumer", practice: "ip", sector: "consumer",
    status: "declined", reason: "Too expensive", ts: Date.now() - 3 * 86400000,
  },
  {
    id: "seed-6", companyName: "Kestrel Data", practice: "visa", sector: "saas",
    attorneyId: "a9", attorneyName: "Priya Kapoor", contactId: "b2", contactName: "Andre Solis",
    status: "sent", ts: Date.now() - 1 * 86400000,
  },
];
