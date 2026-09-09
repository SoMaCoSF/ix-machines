/**
 * GYST UUIDv8 — IX-Machines mint / parse / route
 * Layout (SPEC v0.2.0): Type(12) | Namespace(12) | Timestamp(24) | Version/Flags | Depth/Spatial | Payload
 */

export const IX_NS = 0x1a1;

export const TYPE = {
  user: 0x010,
  event: 0x011,
  product: 0x015,
  lot: 0x210,
  part: 0x211,
  bom: 0x212,
  label: 0x213,
  group: 0x220,
  shipment: 0x221,
  crate: 0x222,
  build: 0x230,
  recipe: 0x231,
  market: 0x3a0,
  agent: 0x500,
  colloquy: 0x009,
  turn: 0x005,
  heartbeat: 0x825,
};

export const TYPE_NAMES = Object.fromEntries(
  Object.entries(TYPE).map(([k, v]) => [v, k])
);

function strip(uuid) {
  return String(uuid).replace(/-/g, "").toLowerCase();
}

function toHex(n, width) {
  return (n >>> 0).toString(16).padStart(width, "0");
}

export function formatUuid(h) {
  const s = strip(h).padEnd(32, "0").slice(0, 32);
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

export function parse(uuid) {
  const h = strip(uuid);
  if (h.length !== 32 || !/^[0-9a-f]+$/.test(h)) {
    throw new Error("GYST_PARSE: need 32 hex chars");
  }
  const type = parseInt(h.slice(0, 3), 16) & 0xfff;
  const ns = parseInt(h.slice(3, 6), 16) & 0xfff;
  const ts = parseInt(h.slice(6, 12), 16) & 0xffffff;
  return {
    raw: h,
    formatted: formatUuid(h),
    type,
    typeHex: "0x" + toHex(type, 3),
    typeName: TYPE_NAMES[type] || "unknown",
    namespace: ns,
    namespaceHex: "0x" + toHex(ns, 3),
    timestampSlice: ts,
    versionNibble: parseInt(h[12], 16),
    payload: h.slice(13),
    short: h.slice(0, 8).toUpperCase(),
  };
}

export function mint(typeCode, namespace = IX_NS, entropy) {
  const type = (typeof typeCode === "string" ? parseInt(typeCode, 16) : typeCode) & 0xfff;
  const ns = namespace & 0xfff;
  const ts = Math.floor(Date.now() / 1000) & 0xffffff;
  let rest;
  if (entropy && String(entropy).length >= 8) {
    rest = strip(String(entropy)).slice(0, 19);
  } else if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const b = new Uint8Array(10);
    crypto.getRandomValues(b);
    rest = Array.from(b, (x) => toHex(x, 2)).join("");
  } else {
    rest = toHex((Math.random() * 0xffffffff) >>> 0, 8) + toHex((Math.random() * 0xffffffff) >>> 0, 8);
  }
  const h = (toHex(type, 3) + toHex(ns, 3) + toHex(ts, 6) + "8" + rest).slice(0, 32).padEnd(32, "0");
  return parse(h);
}

export function route(parsed) {
  const t = parsed.type;
  if (t >= 0x210 && t <= 0x21f) return { handler: "Inventory", block: "parts" };
  if (t >= 0x220 && t <= 0x22f) return { handler: "Ship", block: "logistics" };
  if (t >= 0x230 && t <= 0x23f) return { handler: "Build", block: "projects" };
  if (t >= 0x3a0 && t <= 0x3af) return { handler: "Locus", block: "financial" };
  if (t >= 0x500 && t <= 0x5ff) return { handler: "Vertex", block: "agent" };
  if (t === 0x009 || t === 0x005 || t === 0x825) return { handler: "Colloquy", block: "session" };
  return { handler: "Canvas", block: "core" };
}

export function assimilate(uuid) {
  const id = parse(uuid);
  return {
    phase: ["INGEST", "IDENTIFY", "VALIDATE", "ROUTE", "EXECUTE", "REPORT"],
    identity: id,
    route: route(id),
    report: mint(TYPE.event, id.namespace),
  };
}

export function seedMint(typeCode, namespace, entropyHex) {
  const type = typeCode & 0xfff;
  const ns = namespace & 0xfff;
  const ts = 0x68be3100 & 0xffffff;
  const rest = strip(entropyHex).padEnd(19, "0").slice(0, 19);
  const h = (toHex(type, 3) + toHex(ns, 3) + toHex(ts, 6) + "8" + rest).slice(0, 32).padEnd(32, "0");
  return parse(h);
}
