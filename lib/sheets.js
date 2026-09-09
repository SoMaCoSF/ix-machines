/**
 * Materials inventory sheets — the book the warehouse already keeps.
 * "e-east" here is that class of feed: East Materials / mill books, takeoff
 * sheets, daily on-hand CSVs, Google Sheets exports. Same row shape as a
 * garage BOM, different authority (vendor stock vs bench lot).
 *
 * Ingest path: drop CSV, or paste a published sheet URL.
 * Google:  https://docs.google.com/spreadsheets/d/{id}/export?format=csv
 */

import { rowsFromCsv, detectVendor, mapHeaders } from "./catalogs";

export const SHEET_FIELDS = [
  ["sku", ["sku", "stock", "stocknumber", "item", "itemno", "partno", "model", "modelno", "modelnumber"]],
  ["mpn", ["mpn", "mfrpart", "manufacturerpart", "modelnumber", "pn"]],
  ["name", ["name", "description", "commonname", "financialname", "itemdescription", "title"]],
  ["qty", ["qty", "quantity", "onhand", "totalonhand", "qoh", "stockqty"]],
  ["uom", ["uom", "unit", "unitofmeasure"]],
  ["material", ["material", "matl", "alloy", "grade", "substance"]],
  ["category", ["category", "class", "commodity", "object"]],
  ["unspsc", ["unspsc"]],
];

export const EAST_SAMPLE = `Model No,Description,Material,Grade,Qty,UOM,Category
HJSIL-200,Fumed silica HJSIL 200,SiO2,200 m2/g,4,BAG,powder
MEGEL-AG,Silica aerogel blanket 10mm,SiO2 aerogel,10mm,12,M2,insulation
608-2Z,Deep groove ball bearing,steel,chrome,40,EA,motion
2020-T,2020 T-slot extrusion 1m,aluminum,6063-T5,24,EA,structure
M5-12-SHCS,M5x12 socket cap,steel,12.9,200,EA,fastener
PETG-BK-1KG,PETG 1.75mm black,PETG,1.75,6,KG,consumable
LRS-350-24,Mean Well 24V 14.6A enclosed,electronics,24V,3,EA,power
`;

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function parseSheetText(text, filename = "sheet.csv") {
  const { headers, rows } = rowsFromCsv(text);
  const vendor = /east/i.test(filename + headers.join(" "))
    ? { id: "east", name: "East / mill book", ns: 0x1b8 }
    : detectVendor(filename, headers);
  const idx = {};
  headers.forEach((h, i) => {
    const n = norm(h);
    for (const [field, aliases] of SHEET_FIELDS) {
      if (aliases.some((a) => norm(a) === n) && idx[field] == null) idx[field] = i;
    }
  });
  const items = rows.map((cells) => {
    const get = (k) => (idx[k] != null ? cells[idx[k]] : "") || "";
    const sku = get("sku") || cells[0] || "SHEET";
    return {
      sku: slug(sku),
      name: get("name") || sku,
      qty: Number(get("qty")) || 1,
      mpn: get("mpn") || sku,
      material: get("material") || null,
      category: (get("category") || "material").toLowerCase(),
      uom: get("uom") || "EA",
      unspsc: get("unspsc") || null,
      vendor: vendor.id,
      vendorName: vendor.name,
      condition: "sheet-stock",
    };
  });
  return { vendor, headers, items, source: filename };
}

export function sheetToCsvUrl(input) {
  const s = String(input || "").trim();
  const m = s.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m) return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`;
  return s;
}

function slug(s) {
  return String(s).toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "PART";
}
