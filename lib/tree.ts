import { ALL_ATTORNEYS, ALL_CLIENTS, ALL_CONTACTS, homeAttorneyId } from "./data";
import { Practice } from "./types";

/**
 * A fixed, hand-computed radial layout: Hollis & Crane at the center, three
 * practice branches at 120° apart, attorneys along each branch, and their
 * contacts as leaves. No physics, no settling — the same shape every time.
 */

export type NodeKind = "hub" | "practice" | "attorney" | "contact" | "client" | "incoming";

export interface TreeNode {
  id: string;
  kind: NodeKind;
  name: string;
  x: number;
  y: number;
  angle: number;
  r: number;
  practice?: Practice;
  parentId?: string;
}
export interface TreeEdge {
  id: string;
  parentId: string;
  childId: string;
}

const R_PRACTICE = 90;
const R_ATTORNEY = 195;
const R_LEAF = 300;
const R_LEAF_BAND = 46; // extra radius per band, so dense attorneys fan into rings instead of cramming
export const R_INCOMING = 480;

const PRACTICES: Practice[] = ["visa", "ip", "patent"];
const SLICE = (Math.PI * 2) / 3;

export function polar(angle: number, r: number) {
  // Rotate so the first practice sits at the top (-90°).
  const a = angle - Math.PI / 2;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

export function buildTree() {
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];

  nodes.push({ id: "hub", kind: "hub", name: "Hollis & Crane", x: 0, y: 0, angle: 0, r: 0 });

  PRACTICES.forEach((practice, pi) => {
    const center = pi * SLICE;
    const pPos = polar(center, R_PRACTICE);
    nodes.push({ id: `p-${practice}`, kind: "practice", name: practice, x: pPos.x, y: pPos.y, angle: center, r: R_PRACTICE, practice });
    edges.push({ id: `hub-${practice}`, parentId: "hub", childId: `p-${practice}` });

    const attorneys = ALL_ATTORNEYS.filter((a) => a.practice === practice);
    const attorneySpread = SLICE * 0.72;
    attorneys.forEach((a, ai) => {
      const t = attorneys.length > 1 ? ai / (attorneys.length - 1) - 0.5 : 0;
      const angle = center + t * attorneySpread;
      const pos = polar(angle, R_ATTORNEY);
      nodes.push({ id: a.id, kind: "attorney", name: a.name, x: pos.x, y: pos.y, angle, r: R_ATTORNEY, practice, parentId: `p-${practice}` });
      edges.push({ id: `p-${practice}-${a.id}`, parentId: `p-${practice}`, childId: a.id });
    });

    // Leaves (contacts + clients) grouped under their home attorney, spread
    // across the same angular slice the attorneys occupy.
    const leavesByAttorney = new Map<string, { id: string; name: string; kind: "contact" | "client" }[]>();
    attorneys.forEach((a) => leavesByAttorney.set(a.id, []));

    ALL_CONTACTS.forEach((c) => {
      const home = homeAttorneyId(c.id);
      if (home && leavesByAttorney.has(home)) leavesByAttorney.get(home)!.push({ id: c.id, name: c.name, kind: "contact" });
    });
    ALL_CLIENTS.forEach((cl) => {
      const home = cl.team.find((t) => leavesByAttorney.has(t));
      if (home) leavesByAttorney.get(home)!.push({ id: cl.id, name: cl.name, kind: "client" });
    });

    attorneys.forEach((a, ai) => {
      const t = attorneys.length > 1 ? ai / (attorneys.length - 1) - 0.5 : 0;
      const attorneyAngle = center + t * attorneySpread;
      const leaves = leavesByAttorney.get(a.id) ?? [];
      const leafSpread = attorneys.length > 1 ? attorneySpread / attorneys.length : SLICE * 0.6;
      // Dense attorneys fan their contacts into concentric bands (3 leaves
      // per angular slot) rather than cramming everyone onto one ring —
      // reads as layered "petals" instead of a crowded arc.
      const perBand = Math.max(3, Math.ceil(leaves.length / 3));
      leaves.forEach((leaf, li) => {
        const band = Math.floor(li / perBand);
        const within = li % perBand;
        const slotCount = Math.min(perBand, leaves.length - band * perBand);
        const lt = slotCount > 1 ? within / (slotCount - 1) - 0.5 : 0;
        const angle = attorneyAngle + lt * leafSpread * 0.92;
        const r = R_LEAF + band * R_LEAF_BAND;
        const pos = polar(angle, r);
        nodes.push({ id: leaf.id, kind: leaf.kind, name: leaf.name, x: pos.x, y: pos.y, angle, r, practice, parentId: a.id });
        edges.push({ id: `${a.id}-${leaf.id}`, parentId: a.id, childId: leaf.id });
      });
    });
  });

  return { nodes, edges };
}

export function bounds(nodes: TreeNode[], pad = 40) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  nodes.forEach((n) => {
    x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
    x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y);
  });
  return { x0: x0 - pad, y0: y0 - pad, x1: x1 + pad, y1: y1 + pad };
}
