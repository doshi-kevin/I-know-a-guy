"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildTree, bounds, polar, TreeNode, R_INCOMING } from "@/lib/tree";
import { PRACTICE_LABEL, Practice } from "@/lib/types";

const TYPE_COLOR: Record<string, string> = {
  immigration: "#2E7D6B",
  sponsor: "#4FA88A",
  trademark: "#6F5FB0",
  licensing: "#9B7FD1",
  patent: "#3E6FA6",
  priorart: "#6FA0D6",
};
const PRACTICE_COLOR: Record<Practice, string> = { visa: "#2E7D6B", ip: "#6F5FB0", patent: "#3E6FA6" };

export interface Activation {
  practiceId: Practice;
  attorneyIds: string[];
  consideredContactIds: string[];
  blockedContactIds: string[];
  topContactIds: string[]; // ordered, best first
}
export interface IncomingClient {
  id: string;
  name: string;
  arrived: boolean; // false = still flying in from outside
  t0: number; // performance.now() when the flight started
}

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 1 ? 1 - Math.pow(1 - t, 3) : 1);

export default function RadialNetwork({
  activation,
  incoming,
  focusKey,
  focusIds,
  hoveredExternalId,
  onHoverContact,
}: {
  activation: Activation | null;
  incoming?: IncomingClient | null;
  focusKey?: string; // change this string to trigger a camera tween to focusIds
  focusIds?: string[];
  hoveredExternalId?: string | null;
  onHoverContact?: (id: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 700 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const { nodes, edges } = useMemo(() => buildTree(), []);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Camera transform (scale + pan), tweened manually.
  const camRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const camTarget = useRef({ scale: 1, tx: 0, ty: 0 });
  const camFrom = useRef({ scale: 1, tx: 0, ty: 0 });
  const camT0 = useRef(0);
  const camDur = useRef(700);

  // Per-node/edge opacity state, eased toward a target each frame.
  const opacity = useRef(new Map<string, number>());
  const edgeOpacity = useRef(new Map<string, number>());
  const dirty = useRef(true);

  // "Blink" flashes: a bright expanding ring fired the instant a node crosses
  // from dim into the active set — the flicker that makes the search feel
  // like it's actually discovering people, not just fading things in.
  const prevActive = useRef(new Map<string, boolean>());
  const flashes = useRef(new Map<string, number>());
  // Ambient scanning particles that hop along the currently-active branch
  // while the engine is searching, independent of the final warm path.
  const scanPulses = useRef<{ parentId: string; childId: string; t0: number }[]>([]);
  const lastScanSpawn = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
      dirty.current = true;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitTo = (ids: string[] | undefined, durationMs = 700) => {
    const targets = ids && ids.length ? nodes.filter((n) => ids.includes(n.id)) : nodes;
    // when fitting everything while a request is still flying in, make sure
    // its off-tree starting point is in frame too
    const extra =
      (!ids || !ids.length) && incoming && !incoming.arrived
        ? [{ ...polar(-Math.PI / 2 + 0.001, R_INCOMING), id: "incoming", kind: "incoming" as const, name: "", angle: 0, r: R_INCOMING }]
        : [];
    const b = bounds([...targets, ...extra], ids && ids.length ? 90 : 40);
    const w = dims.w || 900;
    const h = dims.h || 700;
    const scale = clamp(Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0)), 0.35, 2.2);
    const cx = (b.x0 + b.x1) / 2;
    const cy = (b.y0 + b.y1) / 2;
    camFrom.current = { ...camRef.current };
    camTarget.current = { scale, tx: w / 2 - cx * scale, ty: h / 2 - cy * scale };
    camT0.current = performance.now();
    camDur.current = durationMs;
    dirty.current = true;
  };

  // Initial fit once we know the container size.
  const didInitialFit = useRef(false);
  useEffect(() => {
    if (didInitialFit.current || !dims.w || !dims.h) return;
    didInitialFit.current = true;
    fitTo(undefined, 0);
    camRef.current = { ...camTarget.current };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, dims.h]);

  // Camera tween trigger.
  const lastFocusKey = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!didInitialFit.current) return;
    if (focusKey === lastFocusKey.current) return;
    lastFocusKey.current = focusKey;
    fitTo(focusIds, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  // ---- target opacities from activation state ----
  function targetFor(n: TreeNode): number {
    if (!activation) return 1; // idle: calm, everything visible
    if (n.kind === "hub") return 1;
    if (n.kind === "incoming") return 1;
    if (n.kind === "practice") return n.id === `p-${activation.practiceId}` ? 1 : 0.12;
    const onBranch = n.practice === activation.practiceId;
    if (n.kind === "attorney") {
      if (activation.attorneyIds.includes(n.id)) return 1;
      return onBranch ? 0.3 : 0.08;
    }
    // contact / client leaves
    if (activation.topContactIds.includes(n.id)) return 1;
    if (activation.blockedContactIds.includes(n.id)) return 0.85;
    if (activation.consideredContactIds.includes(n.id)) return 0.55;
    return onBranch ? 0.16 : 0.06;
  }
  function edgeTargetFor(parentId: string, childId: string): number {
    if (!activation) return 1;
    const child = nodeById.get(childId);
    if (!child) return 0.1;
    if (parentId === "hub") return childId === `p-${activation.practiceId}` ? 1 : 0.1;
    const onBranch = child.practice === activation.practiceId;
    if (child.kind === "attorney") return activation.attorneyIds.includes(childId) ? 1 : onBranch ? 0.25 : 0.06;
    if (activation.topContactIds.includes(childId)) return 1;
    if (activation.blockedContactIds.includes(childId)) return 0.7;
    if (activation.consideredContactIds.includes(childId)) return 0.45;
    return onBranch ? 0.12 : 0.05;
  }

  function contactTypeOf(id: string): string {
    // cheap lookup without importing data again at draw time
    return (window as unknown as { __ikagTypes?: Record<string, string> }).__ikagTypes?.[id] ?? "";
  }

  // ---- drawing (defined before the render loop that calls it) ----
  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dims.w, dims.h);
    const cam = camRef.current;
    ctx.save();
    ctx.translate(cam.tx, cam.ty);
    ctx.scale(cam.scale, cam.scale);
    const inv = 1 / cam.scale;

    // incoming client + its dashed line to the hub
    if (incoming) {
      const t = incoming.arrived ? 1 : clamp((now - incoming.t0) / 900);
      const start = polar(-Math.PI / 2 + 0.001, R_INCOMING);
      const x = incoming.arrived ? 0 : lerp(start.x, 0, ease(t));
      const y = incoming.arrived ? 0 : lerp(start.y, 0, ease(t));
      if (!incoming.arrived) {
        ctx.setLineDash([4 * inv, 4 * inv]);
        ctx.strokeStyle = "rgba(180,130,62,0.5)";
        ctx.lineWidth = 1.4 * inv;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#4A5568";
        ctx.beginPath();
        ctx.rect(x - 5, y - 5, 10, 10);
        ctx.fill();
        ctx.font = `600 ${12 * inv}px Inter, sans-serif`;
        ctx.fillStyle = "#211D16";
        ctx.textAlign = "center";
        ctx.fillText(incoming.name, x, y - 12 * inv);
      }
    }

    // edges
    const topChain = activation?.topContactIds.length ? pathToRoot(activation.topContactIds[0], nodeById) : [];
    edges.forEach((ed) => {
      const p = nodeById.get(ed.parentId);
      const c = nodeById.get(ed.childId);
      if (!p || !c) return;
      const op = edgeOpacity.current.get(ed.id) ?? 1;
      if (op < 0.02) return;
      const isTop = topChain.some((id, i) => id === ed.parentId && topChain[i + 1] === ed.childId);
      ctx.globalAlpha = op;
      ctx.strokeStyle = isTop ? "#B4823E" : "rgba(138,130,114,0.55)";
      ctx.lineWidth = (isTop ? 2.2 : 1) * inv;
      // radial "elbow" curve: bend at the parent's angle, child's radius
      const mid = polar(p.angle, c.r);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(mid.x, mid.y, c.x, c.y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // flowing particles along the #1 path
    if (activation?.topContactIds.length) {
      const chain = pathToRoot(activation.topContactIds[0], nodeById);
      for (let i = 0; i < chain.length - 1; i++) {
        const a = nodeById.get(chain[i]);
        const b = nodeById.get(chain[i + 1]);
        if (!a || !b) continue;
        const mid = polar(a.angle, b.r);
        for (let j = 0; j < 2; j++) {
          const ph = ((now / 900 + j * 0.5 + i * 0.25) % 1);
          const pt = quadPoint(a, mid, b, ph);
          ctx.globalAlpha = Math.sin(ph * Math.PI);
          ctx.fillStyle = "#F0D9A0";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 * inv, 0, 7);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // scanning pulses: quick sparks hopping outward along the branch being
    // searched, so "finding the network" reads as active discovery
    scanPulses.current.forEach((p) => {
      const a = nodeById.get(p.parentId);
      const b = nodeById.get(p.childId);
      if (!a || !b) return;
      const t = clamp((now - p.t0) / 900);
      if (t >= 1) return;
      const mid = polar(a.angle, b.r);
      const pt = quadPoint(a, mid, b, ease(t));
      const alpha = Math.sin(t * Math.PI);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#B4823E";
      ctx.shadowColor = "#D9B263";
      ctx.shadowBlur = 8 * inv;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.6 * inv, 0, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    // nodes
    nodes.forEach((n) => {
      const op = opacity.current.get(n.id) ?? 1;
      if (op < 0.02) return;
      ctx.globalAlpha = op;
      const isTop1 = activation?.topContactIds[0] === n.id || (n.kind === "attorney" && activation?.topContactIds.length && isAncestorOfTop1(n.id, activation, nodeById));
      const isTopOther = activation?.topContactIds.slice(1).includes(n.id);
      const isBlocked = activation?.blockedContactIds.includes(n.id);
      const isHover = hoverId === n.id || hoveredExternalId === n.id;

      let r = n.kind === "hub" ? 13 : n.kind === "practice" ? 9 : n.kind === "attorney" ? 6.4 : n.kind === "client" ? 4.6 : 3.4;
      if (isTop1) r *= 1.5;
      else if (isTopOther) r *= 1.25;
      if (isHover) r *= 1.25;
      if (n.kind === "hub") r += Math.sin(now / 1100) * 0.5; // a slow breath, so the firm never looks static

      const isActiveBranch = n.kind === "practice" && activation && n.id === `p-${activation.practiceId}`;
      if (n.kind === "hub" || isActiveBranch || isTop1 || isTopOther) {
        ctx.shadowColor = isTop1 ? "#D9B263" : isTopOther ? "#E4C888" : isActiveBranch ? PRACTICE_COLOR[n.practice as Practice] : "rgba(33,29,22,0.4)";
        ctx.shadowBlur = (isTop1 ? 16 : isTopOther ? 11 : n.kind === "hub" ? 7 : 9) * inv;
      }

      ctx.beginPath();
      if (n.kind === "client") {
        ctx.rect(n.x - r, n.y - r, r * 2, r * 2);
      } else if (n.kind === "practice") {
        // diamond
        ctx.moveTo(n.x, n.y - r);
        ctx.lineTo(n.x + r, n.y);
        ctx.lineTo(n.x, n.y + r);
        ctx.lineTo(n.x - r, n.y);
        ctx.closePath();
      } else {
        ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
      }
      ctx.fillStyle =
        n.kind === "hub"
          ? "#211D16"
          : n.kind === "practice"
          ? PRACTICE_COLOR[n.practice as Practice]
          : n.kind === "attorney"
          ? "#211D16"
          : n.kind === "client"
          ? "#4A5568"
          : TYPE_COLOR[contactTypeOf(n.id)] ?? "#8A8272";
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isTop1) {
        ctx.lineWidth = 2 * inv;
        ctx.strokeStyle = "#B4823E";
        ctx.stroke();
      } else if (isTopOther) {
        ctx.lineWidth = 1.5 * inv;
        ctx.strokeStyle = "#C9A968";
        ctx.stroke();
      } else if (isBlocked) {
        ctx.lineWidth = 1.5 * inv;
        ctx.strokeStyle = "#B4402E";
        ctx.stroke();
      } else if (n.kind === "attorney") {
        ctx.lineWidth = 1 * inv;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.stroke();
      }

      if (isBlocked) {
        ctx.strokeStyle = "#B4402E";
        ctx.lineWidth = 1.4 * inv;
        const rr = r * 0.55;
        ctx.beginPath();
        ctx.moveTo(n.x - rr, n.y - rr);
        ctx.lineTo(n.x + rr, n.y + rr);
        ctx.moveTo(n.x + rr, n.y - rr);
        ctx.lineTo(n.x - rr, n.y + rr);
        ctx.stroke();
      }

      // the blink: a bright ring bursting outward the moment this node
      // enters the story
      const flashT0 = flashes.current.get(n.id);
      if (flashT0 !== undefined) {
        const ft = (now - flashT0) / 550;
        if (ft < 1) {
          ctx.globalAlpha = (1 - ft) * 0.85 * op;
          ctx.strokeStyle = isBlocked ? "#B4402E" : "#D9B263";
          ctx.lineWidth = (2.2 - ft * 1.6) * inv;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + ft * 16 * inv, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.globalAlpha = op;
        } else {
          flashes.current.delete(n.id);
        }
      }

      // practice / hub labels always show; others on hover or top pick
      const showLabel =
        n.kind === "hub" ||
        n.kind === "practice" ||
        isHover ||
        isTop1 ||
        isTopOther ||
        (n.kind === "attorney" && activation === null);
      if (showLabel) {
        const fontSize = (n.kind === "hub" || n.kind === "practice" ? 12 : 11) * inv;
        ctx.font = `${n.kind === "practice" || n.kind === "hub" ? "700" : "600"} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const label = n.kind === "practice" ? PRACTICE_LABEL[n.practice as Practice].toUpperCase() : n.name;
        if (n.kind === "hub") {
          ctx.textAlign = "center";
          ctx.fillStyle = "#211D16";
          ctx.fillText(label, n.x, n.y + r + fontSize + 3);
        } else if (n.kind === "practice") {
          const out = polar(n.angle, n.r + r + 6);
          ctx.textAlign = out.x >= -1 ? "left" : "right";
          ctx.fillStyle = "rgba(74,69,59,0.85)";
          ctx.fillText(label, out.x, out.y);
        } else {
          // radiate the label outward along the node's own angle, rather
          // than always to the right — keeps stacked leaves from colliding
          const out = polar(n.angle, n.r + r + 6);
          const rightSide = out.x >= n.x;
          ctx.textAlign = rightSide ? "left" : "right";
          const tw = ctx.measureText(label).width;
          const padX = 4 * inv;
          const boxX = rightSide ? out.x : out.x - tw - padX * 2;
          ctx.fillStyle = "rgba(250,247,241,0.92)";
          ctx.fillRect(boxX, out.y - fontSize / 2 - 1, tw + padX * 2, fontSize + 2);
          ctx.fillStyle = isTop1 || isTopOther ? "#6B4A1E" : "#211D16";
          ctx.fillText(label, rightSide ? out.x + padX : out.x - padX, out.y);
        }
      }
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }, [dims, incoming, activation, edges, nodes, nodeById, hoverId, hoveredExternalId]);

  // ---- render loop ----
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();

      // camera easing
      const ct = clamp((now - camT0.current) / camDur.current);
      const e = ease(ct);
      camRef.current = {
        scale: lerp(camFrom.current.scale, camTarget.current.scale, e),
        tx: lerp(camFrom.current.tx, camTarget.current.tx, e),
        ty: lerp(camFrom.current.ty, camTarget.current.ty, e),
      };
      if (ct < 1) dirty.current = true;

      // opacity easing
      let anyMoving = false;
      nodes.forEach((n) => {
        const cur = opacity.current.get(n.id) ?? (activation ? 0.3 : 1);
        const tgt = targetFor(n);
        if (Math.abs(cur - tgt) > 0.002) {
          opacity.current.set(n.id, lerp(cur, tgt, 0.12));
          anyMoving = true;
        } else {
          opacity.current.set(n.id, tgt);
        }
        // fire a blink the instant this node newly becomes part of the story
        const isActiveNow = tgt >= 0.5;
        if (isActiveNow && !prevActive.current.get(n.id)) {
          flashes.current.set(n.id, now);
        }
        prevActive.current.set(n.id, isActiveNow);
      });
      edges.forEach((ed) => {
        const key = ed.id;
        const cur = edgeOpacity.current.get(key) ?? (activation ? 0.2 : 1);
        const tgt = edgeTargetFor(ed.parentId, ed.childId);
        if (Math.abs(cur - tgt) > 0.002) {
          edgeOpacity.current.set(key, lerp(cur, tgt, 0.12));
          anyMoving = true;
        } else {
          edgeOpacity.current.set(key, tgt);
        }
      });
      if (anyMoving) dirty.current = true;

      // while the engine is actively searching a branch (no picks settled
      // yet), keep firing little scan pulses along its edges — a visible
      // "still looking" heartbeat rather than a static lit-up tree
      if (activation && !activation.topContactIds.length && now - lastScanSpawn.current > 260) {
        lastScanSpawn.current = now;
        const liveEdges = edges.filter((ed) => {
          const child = nodeById.get(ed.childId);
          if (!child) return false;
          if (ed.parentId === "hub") return ed.childId === `p-${activation.practiceId}`;
          return child.practice === activation.practiceId;
        });
        if (liveEdges.length) {
          const pick = liveEdges[Math.floor(Math.random() * liveEdges.length)];
          scanPulses.current.push({ parentId: pick.parentId, childId: pick.childId, t0: now });
          if (scanPulses.current.length > 24) scanPulses.current.shift();
        }
      }
      scanPulses.current = scanPulses.current.filter((p) => now - p.t0 < 900);

      // ambient redraw for the flowing warm-path particles, scan pulses,
      // flashes and the incoming-client flight
      if (activation && activation.topContactIds.length) dirty.current = true;
      if (scanPulses.current.length) dirty.current = true;
      if (flashes.current.size) dirty.current = true;
      if (incoming && !incoming.arrived) dirty.current = true;
      dirty.current = true; // the hub's slow breathing glow never fully stops

      if (dirty.current) {
        draw(now);
        dirty.current = false;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, activation, incoming, nodes, edges, hoverId, hoveredExternalId, dims]);

  // expose a type map once on window for the canvas draw fn (avoids importing
  // the whole CONTACTS array into every closure)
  useEffect(() => {
    import("@/lib/data").then(({ ALL_CONTACTS }) => {
      const map: Record<string, string> = {};
      ALL_CONTACTS.forEach((c) => (map[c.id] = c.type));
      (window as unknown as { __ikagTypes?: Record<string, string> }).__ikagTypes = map;
      dirty.current = true;
    });
  }, []);

  function onMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cam = camRef.current;
    const gx = (mx - cam.tx) / cam.scale;
    const gy = (my - cam.ty) / cam.scale;
    let best: TreeNode | null = null;
    let bestD = 18 / cam.scale;
    nodes.forEach((n) => {
      const d = Math.hypot(n.x - gx, n.y - gy);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    });
    const id = best ? (best as TreeNode).id : null;
    if (id !== hoverId) {
      setHoverId(id);
      dirty.current = true;
      if (id && (nodeById.get(id)?.kind === "contact" || nodeById.get(id)?.kind === "client")) {
        onHoverContact?.(id);
      } else {
        onHoverContact?.(null);
      }
    }
    setTooltipPos(id ? { x: mx, y: my } : null);
  }

  const hoveredNode = hoverId ? nodeById.get(hoverId) : null;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        style={{ width: dims.w, height: dims.h }}
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHoverId(null);
          setTooltipPos(null);
          onHoverContact?.(null);
        }}
      />
      {hoveredNode && tooltipPos && (hoveredNode.kind === "contact" || hoveredNode.kind === "client") && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-[var(--line)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-[11.5px] shadow-md"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y + 10 }}
        >
          <div className="font-medium text-[var(--ink)]">{hoveredNode.name}</div>
        </div>
      )}
    </div>
  );
}

function pathToRoot(id: string, nodeById: Map<string, TreeNode>): string[] {
  const chain: string[] = [id];
  let cur = nodeById.get(id);
  while (cur?.parentId) {
    chain.unshift(cur.parentId);
    cur = nodeById.get(cur.parentId);
  }
  return chain;
}

function isAncestorOfTop1(id: string, activation: Activation, nodeById: Map<string, TreeNode>): boolean {
  const chain = pathToRoot(activation.topContactIds[0], nodeById);
  return chain.includes(id);
}

function quadPoint(a: { x: number; y: number }, mid: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mid.x + t * t * b.x;
  const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * mid.y + t * t * b.y;
  return { x, y };
}
