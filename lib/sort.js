import { partnerForShort, packetFor } from "./partners";
import { GROUPS } from "./data";

/** Surplus at one bench that another bench is short. */
export function sortMoves(parts) {
  const bySku = {};
  for (const p of parts) {
    if (!bySku[p.sku]) bySku[p.sku] = [];
    bySku[p.sku].push(p);
  }
  const moves = [];
  for (const sku of Object.keys(bySku)) {
    const lots = bySku[sku];
    const totals = {};
    for (const l of lots) totals[l.groupId] = (totals[l.groupId] || 0) + Number(l.qty || 0);
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (entries.length < 2) continue;
    const [rich, poor] = [entries[0], entries[entries.length - 1]];
    if (rich[1] >= 4 && poor[1] <= 1) {
      moves.push({ sku, from: rich[0], to: poor[0], qty: Math.min(2, Math.floor(rich[1] / 2)), reason: "rebalance" });
    }
  }
  return moves;
}

export function fillPlan(scan, destGroup) {
  const dest = destGroup || GROUPS[1].id;
  const shorts = (scan.close[0]?.missing || scan.ranked.find((r) => r.missing.length)?.missing || []).slice(0, 6);
  return shorts.map((line) => {
    const partner = partnerForShort(line.sku);
    return { ...packetFor(partner, line, dest), partner };
  });
}
