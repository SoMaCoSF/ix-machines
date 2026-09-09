/**
 * IX-Machines ingest taxonomy.
 * Garage lots arrive as whatever is on the stick: notes, CAD, ECAD, photos, punchout dumps.
 * Classify by extension first, sniff text second. Fail closed to family "unknown".
 */

export const FAMILIES = {
  list: "list",
  workbook: "workbook",
  note: "note",
  cad3d: "cad3d",
  cad2d: "cad2d",
  mesh: "mesh",
  ecad: "ecad",
  fab: "fab",
  image: "image",
  datasheet: "datasheet",
  catalog: "catalog",
  archive: "archive",
  unknown: "unknown",
};

export const GYST_FILE_TYPE = {
  list: 0x212,
  workbook: 0x212,
  note: 0x214,
  cad3d: 0x216,
  cad2d: 0x216,
  mesh: 0x216,
  ecad: 0x217,
  fab: 0x217,
  image: 0x213,
  datasheet: 0x218,
  catalog: 0x215,
  archive: 0x214,
  unknown: 0x214,
};

const ROWS = [
  // lists / BOMs
  ["csv", "list", "BOM / inventory rows", true],
  ["tsv", "list", "BOM / inventory rows", true],
  ["txt", "note", "notes or one-SKU-per-line", true],
  ["md", "note", "build notes / README", true],
  ["json", "list", "structured BOM or catalog dump", true],
  ["ndjson", "list", "newline catalog dump", true],
  ["xml", "catalog", "cXML / BMEcat / generic XML", true],
  ["cxml", "catalog", "Ariba / Grainger punchout", true],
  ["cif", "catalog", "Ariba Catalog Interchange Format", true],
  ["bom", "list", "named BOM export", true],
  // workbooks — binary; classify + wrap, cell parse later
  ["xls", "workbook", "Excel 97-2003 catalog / BOM", false],
  ["xlsx", "workbook", "Excel catalog / BOM", false],
  ["xlsm", "workbook", "Excel macro workbook", false],
  ["ods", "workbook", "OpenDocument spreadsheet", false],
  ["numbers", "workbook", "Apple Numbers", false],
  // 2D CAD / CNC
  ["dxf", "cad2d", "AutoCAD exchange — laser / CNC", false],
  ["dwg", "cad2d", "AutoCAD native", false],
  ["svg", "cad2d", "2D profile / stencil", true],
  // 3D exact
  ["step", "cad3d", "ISO 10303 STEP — preferred 3D exchange", true],
  ["stp", "cad3d", "ISO 10303 STEP", true],
  ["p21", "cad3d", "STEP physical file", true],
  ["iges", "cad3d", "legacy NURBS exchange", true],
  ["igs", "cad3d", "legacy NURBS exchange", true],
  ["x_t", "cad3d", "Parasolid text", true],
  ["x_b", "cad3d", "Parasolid binary", false],
  ["sat", "cad3d", "ACIS SAT", true],
  ["brep", "cad3d", "OpenCASCADE B-rep", false],
  ["fcstd", "cad3d", "FreeCAD native", false],
  ["sldprt", "cad3d", "SolidWorks part", false],
  ["sldasm", "cad3d", "SolidWorks assembly", false],
  ["ipt", "cad3d", "Inventor part", false],
  ["iam", "cad3d", "Inventor assembly", false],
  ["f3d", "cad3d", "Fusion 360", false],
  ["3dm", "cad3d", "Rhino", false],
  ["scad", "cad3d", "OpenSCAD source", true],
  // mesh / print / viz
  ["stl", "mesh", "print mesh", false],
  ["obj", "mesh", "wavefront mesh", true],
  ["3mf", "mesh", "additive package", false],
  ["amf", "mesh", "additive XML mesh", true],
  ["glb", "mesh", "glTF binary viz", false],
  ["gltf", "mesh", "glTF viz", true],
  ["fbx", "mesh", "Autodesk FBX", false],
  ["ply", "mesh", "scan / point cloud", false],
  ["wrl", "mesh", "VRML / KiCad 3D", true],
  // ECAD
  ["kicad_sch", "ecad", "KiCad schematic", true],
  ["kicad_pcb", "ecad", "KiCad board", true],
  ["kicad_pro", "ecad", "KiCad project", true],
  ["kicad_mod", "ecad", "KiCad footprint", true],
  ["sch", "ecad", "Eagle / generic schematic", true],
  ["brd", "ecad", "Eagle board", false],
  ["net", "ecad", "netlist", true],
  // fab
  ["gbr", "fab", "Gerber layer", true],
  ["gbl", "fab", "Gerber bottom copper", true],
  ["gtl", "fab", "Gerber top copper", true],
  ["gbs", "fab", "Gerber bottom mask", true],
  ["gts", "fab", "Gerber top mask", true],
  ["drl", "fab", "Excellon drill", true],
  ["gcode", "fab", "toolpath", true],
  ["nc", "fab", "CNC / Excellon", true],
  // evidence
  ["jpg", "image", "label / serial photo", false],
  ["jpeg", "image", "label / serial photo", false],
  ["png", "image", "label / serial photo", false],
  ["webp", "image", "label / serial photo", false],
  ["heic", "image", "phone photo", false],
  ["tif", "image", "scan", false],
  ["tiff", "image", "scan", false],
  ["gif", "image", "capture", false],
  ["pdf", "datasheet", "datasheet / drawing / label sheet", false],
  // archives of mixed garage dumps
  ["zip", "archive", "mixed dump — unpack next", false],
  ["7z", "archive", "mixed dump", false],
  ["rar", "archive", "mixed dump", false],
];

export const FORMATS = ROWS.map(([ext, family, use, text]) => ({
  ext,
  family,
  use,
  text,
  gystType: GYST_FILE_TYPE[family],
}));

const BY_EXT = Object.fromEntries(FORMATS.map((f) => [f.ext, f]));

export function extOf(name) {
  const n = String(name || "").toLowerCase();
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1) : "";
}

export function classify(name, mime = "") {
  const ext = extOf(name);
  if (BY_EXT[ext]) return { ...BY_EXT[ext], mime, name };
  if (String(mime).startsWith("image/")) {
    return { ext, family: "image", use: "label / serial photo", text: false, gystType: 0x213, mime, name };
  }
  if (String(mime).includes("csv")) {
    return { ext: ext || "csv", family: "list", use: "BOM rows", text: true, gystType: 0x212, mime, name };
  }
  return { ext: ext || "bin", family: "unknown", use: "untyped blob — wrap anyway", text: false, gystType: 0x214, mime, name };
}

export function groupedFormats() {
  const map = {};
  for (const f of FORMATS) {
    if (!map[f.family]) map[f.family] = [];
    map[f.family].push(f);
  }
  return map;
}
