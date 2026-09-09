import { classify } from "./formats";
import { normalizeCatalog, detectVendor } from "./catalogs";
import { parseBomText } from "./data";
import { mint, TYPE } from "./gyst";

const TEXT_CAP = 1_500_000;

export async function readDropped(fileList) {
  const files = Array.from(fileList || []);
  const out = [];
  for (const file of files) {
    const meta = classify(file.name, file.type);
    const rec = {
      name: file.name,
      size: file.size,
      mime: file.type,
      ...meta,
      text: null,
      dataUrl: null,
      lines: [],
      vendor: null,
    };
    if (meta.family === "image" || String(file.type).startsWith("image/")) {
      rec.dataUrl = await readDataUrl(file);
    } else if (meta.text && file.size < TEXT_CAP) {
      rec.text = await file.text();
      rec.lines = extractLines(rec);
      rec.vendor = detectVendor(file.name, rec.lines[0] ? rec.lines[0].split(/[,\t]/) : []);
    } else if (meta.family === "list" || meta.family === "catalog" || meta.family === "workbook") {
      // workbook binary — wrap only
      rec.lines = [];
    }
    out.push(rec);
  }
  return out;
}

function extractLines(rec) {
  if (!rec.text) return [];
  if (rec.family === "catalog" || /grainger|unspsc|supplierpart/i.test(rec.name + rec.text.slice(0, 200))) {
    const cat = normalizeCatalog(rec.text, rec.name);
    rec.catalog = cat;
    return cat.items.map((i) => i);
  }
  if (rec.ext === "json" || rec.ext === "ndjson") {
    try {
      const parsed = rec.ext === "ndjson"
        ? rec.text.split(/\n/).filter(Boolean).map((l) => JSON.parse(l))
        : JSON.parse(rec.text);
      const arr = Array.isArray(parsed) ? parsed : parsed.items || parsed.parts || [parsed];
      return arr.map((row) => ({
        sku: row.sku || row.SKU || row.id || "JSON",
        name: row.name || row.description || row.title || String(row.sku || "json"),
        qty: Number(row.qty || row.quantity || 1),
        serial: row.serial || "",
        mpn: row.mpn || row.MPN || null,
      }));
    } catch {
      return parseBomText(rec.text);
    }
  }
  return parseBomText(rec.text);
}

export function mintDropped(dropped, groupId) {
  const assets = [];
  const parts = [];
  for (const rec of dropped) {
    const ns = rec.catalog?.vendor?.ns || rec.vendor?.ns || 0x1a1;
    const fileId = mint(rec.gystType || TYPE.asset || 0x214, ns, rec.name);
    assets.push({
      uuid: fileId.formatted,
      short: fileId.short,
      name: rec.name,
      family: rec.family,
      ext: rec.ext,
      size: rec.size,
      vendor: rec.catalog?.vendor?.id || rec.vendor?.id || null,
      photo: rec.dataUrl || null,
      groupId,
    });
    const rows = rec.catalog?.items || (Array.isArray(rec.lines) && rec.lines[0]?.sku ? rec.lines : []);
    if (rows.length) {
      for (const row of rows) {
        const id = mint(TYPE.part, ns, (row.sku || row.vendorSku || rec.name) + String(row.mpn || ""));
        parts.push({
          uuid: id.formatted,
          short: id.short,
          sku: row.sku || row.vendorSku || rec.ext.toUpperCase(),
          name: row.name || rec.name,
          category: rec.family === "catalog" ? "catalog" : rec.family,
          qty: Number(row.qty) || 1,
          condition: rec.family === "catalog" ? "vendor-row" : "file",
          groupId,
          serial: row.serial || null,
          mpn: row.mpn || null,
          unspsc: row.unspsc || null,
          vendor: row.vendor || rec.catalog?.vendor?.id || null,
          notes: `from ${rec.name} · file ${fileId.short}`,
          photoHint: rec.dataUrl ? "uploaded" : rec.family,
          photo: rec.dataUrl || null,
          tags: [rec.ext, rec.family].filter(Boolean),
          cad: rec.family === "cad3d" || rec.family === "cad2d" || rec.family === "mesh" ? rec.ext : null,
          fileUuid: fileId.formatted,
        });
      }
    } else {
      const id = mint(TYPE.part, ns, rec.name);
      parts.push({
        uuid: id.formatted,
        short: id.short,
        sku: rec.ext ? rec.ext.toUpperCase() + "-FILE" : "FILE",
        name: rec.name,
        category: rec.family,
        qty: 1,
        condition: "file",
        groupId,
        serial: null,
        mpn: null,
        notes: `${rec.family} · ${rec.use}`,
        photoHint: rec.dataUrl ? "uploaded" : rec.family,
        photo: rec.dataUrl || null,
        tags: [rec.ext, rec.family],
        cad: rec.family.startsWith("cad") || rec.family === "mesh" ? rec.ext : null,
        fileUuid: fileId.formatted,
      });
    }
  }
  return { assets, parts };
}

function readDataUrl(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}
