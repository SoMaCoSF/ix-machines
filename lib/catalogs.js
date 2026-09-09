/**
 * Manufacturer catalog adapters.
 * Grainger does not publish a public product API. Real feeds arrive as:
 *   CSV / XLSX contract catalogs, Ariba CIF, cXML PunchOut, EDI 832/846.
 * Same shape at McMaster (HTML+limited export), Digi-Key/Mouser (CSV + REST),
 * Fastenal / MSC / Newark (punchout + CSV).
 *
 * We normalize to one row: vendor, vendorSku, mpn, brand, name, unspsc, uom, qty.
 * Then mint type 0x215 under a vendor namespace. The garage lot (0x211) can point at it.
 */

export const VENDORS = {
  grainger: { id: "grainger", name: "Grainger", ns: 0x1b1, unspsc: true },
  mcmaster: { id: "mcmaster", name: "McMaster-Carr", ns: 0x1b2, unspsc: false },
  digikey: { id: "digikey", name: "Digi-Key", ns: 0x1b3, unspsc: false },
  mouser: { id: "mouser", name: "Mouser", ns: 0x1b4, unspsc: false },
  newark: { id: "newark", name: "Newark / Farnell", ns: 0x1b5, unspsc: false },
  fastenal: { id: "fastenal", name: "Fastenal", ns: 0x1b6, unspsc: true },
  msc: { id: "msc", name: "MSC Industrial", ns: 0x1b7, unspsc: true },
  generic: { id: "generic", name: "Unknown mill / surplus", ns: 0x1a1, unspsc: false },
};

const HEADER_MAP = {
  sku: ["sku", "item", "itemnumber", "item_number", "item #", "graingernumber", "grainger #", "productid", "product_id", "supplierpartid"],
  mpn: ["mpn", "mfrpart", "manufacturerpart", "manufacturerpartid", "mfr #", "manufacturer part number"],
  brand: ["brand", "mfr", "manufacturer", "manufacturername", "vendor"],
  name: ["name", "description", "itemdescription", "title", "productname"],
  unspsc: ["unspsc", "unspsc_code", "commodity"],
  uom: ["uom", "unit", "unitofmeasure", "u/m"],
  qty: ["qty", "quantity", "qtyavail", "qoh", "onhand"],
  gtin: ["gtin", "gtin14", "upc", "ean"],
};

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function detectVendor(filename, headers) {
  const blob = (filename + " " + (headers || []).join(" ")).toLowerCase();
  if (/grainger/.test(blob)) return VENDORS.grainger;
  if (/mcmaster/.test(blob)) return VENDORS.mcmaster;
  if (/digi[- ]?key/.test(blob)) return VENDORS.digikey;
  if (/mouser/.test(blob)) return VENDORS.mouser;
  if (/newark|farnell/.test(blob)) return VENDORS.newark;
  if (/fastenal/.test(blob)) return VENDORS.fastenal;
  if (/\bmsc\b/.test(blob)) return VENDORS.msc;
  if (/unspsc|supplierpartid|cif_/.test(blob)) return VENDORS.grainger;
  return VENDORS.generic;
}

export function mapHeaders(headers) {
  const out = {};
  headers.forEach((h, i) => {
    const n = norm(h);
    for (const [field, aliases] of Object.entries(HEADER_MAP)) {
      if (aliases.some((a) => norm(a) === n) && out[field] == null) out[field] = i;
    }
  });
  return out;
}

export function rowsFromCsv(text) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitCsv(lines[0]);
  const rows = lines.slice(1).map((line) => splitCsv(line));
  return { headers, rows };
}

function splitCsv(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { q = !q; continue; }
    if ((c === "," || c === "\t") && !q) { out.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

export function normalizeCatalog(text, filename = "") {
  const { headers, rows } = rowsFromCsv(text);
  const vendor = detectVendor(filename, headers);
  const map = mapHeaders(headers);
  const items = rows.map((cells) => {
    const get = (k) => (map[k] != null ? cells[map[k]] : "") || "";
    const sku = get("sku") || cells[0] || "UNK";
    return {
      vendor: vendor.id,
      vendorName: vendor.name,
      vendorSku: sku,
      mpn: get("mpn") || null,
      brand: get("brand") || vendor.name,
      name: get("name") || sku,
      unspsc: get("unspsc") || null,
      uom: get("uom") || "EA",
      qty: Number(get("qty")) || 1,
      gtin: get("gtin") || null,
      sku,
    };
  });
  return { vendor, headers, items };
}

export const GRAINGER_SAMPLE = `Grainger #,Manufacturer Part Number,Manufacturer,Description,UNSPSC,UOM,Qty
1A412,91251A540,McMaster-style hex,Hex Head Cap Screw 1/4-20 x 1 Grade 8,31161501,PK,4
6PA58,ESP32-S3-WROOM-1-N16R8,Espressif,ESP32-S3-WROOM-1 module 16MB,32101600,EA,2
4JY37,LRS-350-24,MEAN WELL,Power Supply 24V 14.6A Enclosed,39121004,EA,1
5UE48,608-2Z,SKF,Ball Bearing 608-2Z 8x22x7,31171504,EA,20
3GNZ8,NEMA17-HS4401,StepperOnline,Stepper Motor NEMA 17 1.8deg,26111500,EA,4
`;
