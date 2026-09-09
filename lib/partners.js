/**
 * Partner rails. These are not pretend vendors.
 * We do not place live paid orders from this MVP. We mint a hop + an order packet
 * the human (or a later worker) can submit on the partner's actual portal.
 */

export const PARTNERS = [
  {
    id: "nox",
    name: "NOX Metals",
    ns: 0x1c1,
    kind: "stock-cut metal",
    href: "https://noxmetals.co/",
    city: "Detroit, MI",
    ships: "cut-to-size Al plate / bar",
    accepts: ["dims", "alloy", "qty"],
    files: [],
    lead: "days, not weeks",
    fills: ["EXT-2020", "EXT-2040", "PLATE-AL", "BAR-AL"],
    note: "AI nest on plate. Instant quote portal (GONDOR). Good when the corpus is short on stock metal, not when you need a 2D profile.",
  },
  {
    id: "sendcutsend",
    name: "SendCutSend",
    ns: 0x1c2,
    kind: "profile cut + bend",
    href: "https://sendcutsend.com/",
    city: "Reno, NV",
    ships: "laser / waterjet / CNC parts, US 2–4 day",
    accepts: ["dxf", "dwg", "ai", "eps", "step", "stp"],
    files: ["dxf", "dwg", "step", "stp"],
    lead: "2–4 business days",
    fills: ["BKT-2020", "PLATE", "PANEL", "BRACKET"],
    note: "One part per file, 1:1 scale. No STL. Attach the DXF that already lives on a lot.",
  },
  {
    id: "pcbway",
    name: "PCBWay",
    ns: 0x1c3,
    kind: "PCB + SMT",
    href: "https://www.pcbway.com/",
    city: "Hangzhou → any bench",
    ships: "bare board or assembled",
    accepts: ["gbr", "zip", "kicad_pcb", "bom", "pos"],
    files: ["gbr", "zip", "csv"],
    lead: "quote in minutes, fab in days",
    fills: ["PCB-PROTO79", "PCB-CTRL", "PCB"],
    note: "Gerber + BOM + centroid for assembly. Partner API exists; keys stay off this hobby deploy.",
  },
];

export const PARTNER_NS = Object.fromEntries(PARTNERS.map((p) => [p.id, p.ns]));

export function partnerForShort(sku) {
  const s = String(sku || "").toUpperCase();
  if (/PCB|GBR|KICAD/.test(s)) return PARTNERS.find((p) => p.id === "pcbway");
  if (/BKT|BRKT|PANEL|PLATE|DXF|BRACKET/.test(s)) return PARTNERS.find((p) => p.id === "sendcutsend");
  if (/EXT|BAR|AL-|6061|7075|STOCK/.test(s)) return PARTNERS.find((p) => p.id === "nox");
  return PARTNERS.find((p) => p.id === "sendcutsend");
}

export function packetFor(partner, line, dest) {
  return {
    partner: partner.id,
    partnerName: partner.name,
    sku: line.sku,
    qty: line.short || line.qty || 1,
    dest,
    submit: partner.href,
    files: partner.files,
    brief: `${partner.name} fill ${line.sku} × ${line.short || line.qty} → ${dest}. Attach ${partner.files.join("/") || "spec only"}.`,
  };
}
