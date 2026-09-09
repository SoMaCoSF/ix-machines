import { TYPE, IX_NS, seedMint, formatUuid } from "./gyst";

export const GROUPS = [
  { id: "bay-garage", name: "Bay Garage Collective", city: "Oakland, CA", members: 7, lat: 37.8044, lng: -122.2712 },
  { id: "rocklin-shop", name: "Rocklin Bench", city: "Rocklin, CA", members: 3, lat: 38.7907, lng: -121.2358 },
  { id: "sonoma-barn", name: "Sonoma Barn Lab", city: "Sonoma, CA", members: 4, lat: 38.2919, lng: -122.458 },
  { id: "austin-loft", name: "Austin Loft Bench", city: "Austin, TX", members: 5, lat: 30.2672, lng: -97.7431 },
];

function part(opts) {
  const id = seedMint(TYPE.part, IX_NS, opts.entropy);
  return {
    uuid: id.formatted, short: id.short, sku: opts.sku, name: opts.name, category: opts.category,
    qty: opts.qty, condition: opts.condition || "used-good", groupId: opts.groupId,
    serial: opts.serial || null, mpn: opts.mpn || null, notes: opts.notes || "",
    photoHint: opts.photoHint || "label", tags: opts.tags || [], cad: opts.cad || null,
  };
}

export const SEED_PARTS = [
  part({ entropy: "esp32s3wroom01", sku: "MCU-ESP32S3", name: "ESP32-S3-WROOM-1", category: "mcu", qty: 6, groupId: "bay-garage", serial: "ES3-88421", mpn: "ESP32-S3-WROOM-1-N16R8", tags: ["wifi","ble"], cad: "kicad" }),
  part({ entropy: "rp2040zero0001", sku: "MCU-RP2040", name: "RP2040 Zero", category: "mcu", qty: 4, groupId: "rocklin-shop", serial: "RP-11092", tags: ["usb-c"], cad: "kicad" }),
  part({ entropy: "stm32f411ceu6", sku: "MCU-STM32F4", name: "STM32F411CEU6 Black Pill", category: "mcu", qty: 3, groupId: "sonoma-barn", serial: "ST-44109", tags: ["arm"], cad: "kicad" }),
  part({ entropy: "nema17hs4401", sku: "MOT-NEMA17", name: "NEMA 17 stepper 1.8deg", category: "motion", qty: 8, groupId: "bay-garage", serial: "NM17-2201", tags: ["stepper"], cad: "onshape" }),
  part({ entropy: "nema17hs4402", sku: "MOT-NEMA17", name: "NEMA 17 stepper 1.8deg", category: "motion", qty: 4, groupId: "austin-loft", tags: ["stepper"], cad: "onshape" }),
  part({ entropy: "drv8825break01", sku: "DRV-8825", name: "DRV8825 stepper driver", category: "driver", qty: 6, groupId: "bay-garage", serial: "DRV-0912", cad: "kicad" }),
  part({ entropy: "tmc2209uart01", sku: "DRV-TMC2209", name: "TMC2209 UART driver", category: "driver", qty: 3, groupId: "rocklin-shop", cad: "kicad" }),
  part({ entropy: "gt2belt5m0001", sku: "BELT-GT2-6", name: "GT2 6mm belt 5m", category: "motion", qty: 2, groupId: "bay-garage", cad: "onshape" }),
  part({ entropy: "gt2pulley20t01", sku: "PUL-GT2-20", name: "GT2 20T pulley 5mm bore", category: "motion", qty: 10, groupId: "sonoma-barn", cad: "onshape" }),
  part({ entropy: "vslot2020ext1", sku: "EXT-2020", name: "2020 V-slot 1m", category: "structure", qty: 12, groupId: "bay-garage", cad: "onshape" }),
  part({ entropy: "vslot2040ext1", sku: "EXT-2040", name: "2040 V-slot 500mm", category: "structure", qty: 6, groupId: "austin-loft", cad: "onshape" }),
  part({ entropy: "corner20brkt1", sku: "BKT-2020", name: "2020 corner bracket", category: "structure", qty: 40, groupId: "bay-garage", cad: "onshape" }),
  part({ entropy: "lead8mm300mm1", sku: "LEAD-8-300", name: "T8 leadscrew 300mm", category: "motion", qty: 3, groupId: "rocklin-shop", cad: "onshape" }),
  part({ entropy: "lm8uulinear01", sku: "BRG-LM8UU", name: "LM8UU linear bearing", category: "motion", qty: 16, groupId: "sonoma-barn", cad: "onshape" }),
  part({ entropy: "smoothrod8x400", sku: "ROD-8-400", name: "8mm smooth rod 400mm", category: "motion", qty: 6, groupId: "sonoma-barn", cad: "onshape" }),
  part({ entropy: "endermagnetich", sku: "HOT-V6", name: "V6 hotend clone + heatbreak", category: "thermal", qty: 2, groupId: "bay-garage", serial: "V6-3381", cad: "onshape" }),
  part({ entropy: "heatbedmk2b01", sku: "BED-MK2B", name: "MK2B heated bed 214mm", category: "thermal", qty: 1, groupId: "austin-loft", cad: "kicad" }),
  part({ entropy: "psu24v15a0001", sku: "PSU-24-15", name: "Mean Well 24V 15A PSU", category: "power", qty: 2, groupId: "rocklin-shop", serial: "MW-24-4481", mpn: "LRS-350-24", cad: "onshape" }),
  part({ entropy: "psu12v10a0001", sku: "PSU-12-10", name: "12V 10A brick PSU", category: "power", qty: 3, groupId: "bay-garage", cad: "onshape" }),
  part({ entropy: "buckxl4015e1", sku: "REG-XL4015", name: "XL4015 5A buck module", category: "power", qty: 8, groupId: "sonoma-barn", cad: "kicad" }),
  part({ entropy: "ina219break01", sku: "SNS-INA219", name: "INA219 current sensor", category: "sensor", qty: 5, groupId: "rocklin-shop", cad: "kicad" }),
  part({ entropy: "bme280break01", sku: "SNS-BME280", name: "BME280 temp/humidity/pressure", category: "sensor", qty: 4, groupId: "bay-garage", cad: "kicad" }),
  part({ entropy: "vl53l0xtof001", sku: "SNS-VL53", name: "VL53L0X ToF rangefinder", category: "sensor", qty: 3, groupId: "austin-loft", cad: "kicad" }),
  part({ entropy: "ssd1306128x64", sku: "DSP-SSD1306", name: "SSD1306 128x64 OLED", category: "display", qty: 7, groupId: "bay-garage", cad: "kicad" }),
  part({ entropy: "ili9341tft24", sku: "DSP-ILI9341", name: "ILI9341 2.4in TFT", category: "display", qty: 2, groupId: "sonoma-barn", cad: "kicad" }),
  part({ entropy: "sg90microserv", sku: "SRV-SG90", name: "SG90 micro servo", category: "motion", qty: 12, groupId: "austin-loft", cad: "onshape" }),
  part({ entropy: "mg996rservo01", sku: "SRV-MG996", name: "MG996R metal servo", category: "motion", qty: 4, groupId: "rocklin-shop", cad: "onshape" }),
  part({ entropy: "a4988silent01", sku: "DRV-A4988", name: "A4988 stepper driver", category: "driver", qty: 8, groupId: "austin-loft", cad: "kicad" }),
  part({ entropy: "limitmicrosw1", sku: "SW-LIMIT", name: "Micro limit switch", category: "sensor", qty: 20, groupId: "bay-garage", cad: "onshape" }),
  part({ entropy: "608zzbearing1", sku: "BRG-608ZZ", name: "608ZZ skate bearing", category: "motion", qty: 30, groupId: "sonoma-barn", cad: "onshape" }),
  part({ entropy: "petg1kgblack1", sku: "FIL-PETG-BK", name: "PETG 1.75mm 1kg black", category: "consumable", qty: 3, groupId: "rocklin-shop" }),
  part({ entropy: "pla1kggrey001", sku: "FIL-PLA-GY", name: "PLA 1.75mm 1kg grey", category: "consumable", qty: 2, groupId: "bay-garage" }),
  part({ entropy: "protoboard7x9", sku: "PCB-PROTO79", name: "7x9cm protoboard", category: "pcb", qty: 15, groupId: "sonoma-barn", cad: "kicad" }),
  part({ entropy: "dupontjumper1", sku: "WIR-DUPONT", name: "Dupont jumper pack 40x3", category: "wire", qty: 6, groupId: "austin-loft" }),
  part({ entropy: "awg22hookup1", sku: "WIR-22AWG", name: "22AWG hookup wire 30m mix", category: "wire", qty: 2, groupId: "bay-garage" }),
  part({ entropy: "mosfetirf5201", sku: "FET-IRF520", name: "IRF520 MOSFET module", category: "power", qty: 6, groupId: "rocklin-shop", cad: "kicad" }),
  part({ entropy: "relaysongler1", sku: "RLY-5V1", name: "5V 1-ch relay module", category: "power", qty: 8, groupId: "sonoma-barn", cad: "kicad" }),
  part({ entropy: "rpi4b4gb00001", sku: "SBC-RPI4-4", name: "Raspberry Pi 4B 4GB", category: "sbc", qty: 2, groupId: "rocklin-shop", serial: "10000000a1b2c3d4", cad: "kicad" }),
  part({ entropy: "jetsonorinano", sku: "SBC-ORIN-N", name: "Jetson Orin Nano 8GB", category: "sbc", qty: 1, groupId: "bay-garage", serial: "JN-88A21", cad: "onshape" }),
  part({ entropy: "webcamc920logi", sku: "CAM-C920", name: "Logitech C920 webcam", category: "sensor", qty: 2, groupId: "austin-loft" }),
];

export const RECIPES = [
  { id: "ix-corexy-mini", name: "CoreXY Mini Plotter", blurb: "300mm belt plotter / light mill from 2020 extrusion and NEMA 17s.", category: "machine", cad: ["onshape","kicad"], tools: ["Onshape assembly","KiCad control board"], required: [{sku:"MCU-ESP32S3",qty:1},{sku:"MOT-NEMA17",qty:3},{sku:"DRV-8825",qty:3},{sku:"BELT-GT2-6",qty:1},{sku:"PUL-GT2-20",qty:4},{sku:"EXT-2020",qty:6},{sku:"BKT-2020",qty:16},{sku:"PSU-24-15",qty:1},{sku:"SW-LIMIT",qty:4},{sku:"DSP-SSD1306",qty:1}] },
  { id: "ix-prusa-ish", name: "Bed-slinger 3D Printer", blurb: "Classic cartesian printer from pooled garage steppers, rods, and a V6.", category: "machine", cad: ["onshape","kicad"], tools: ["Onshape frame","KiCad RAMPS-class board"], required: [{sku:"MCU-ESP32S3",qty:1},{sku:"MOT-NEMA17",qty:4},{sku:"DRV-TMC2209",qty:4},{sku:"LEAD-8-300",qty:2},{sku:"ROD-8-400",qty:4},{sku:"BRG-LM8UU",qty:8},{sku:"HOT-V6",qty:1},{sku:"BED-MK2B",qty:1},{sku:"PSU-24-15",qty:1},{sku:"EXT-2020",qty:8},{sku:"FIL-PETG-BK",qty:1}] },
  { id: "ix-enviro-node", name: "LoRa-ready Enviro Node", blurb: "BME280 + INA219 telemetry brick with OLED.", category: "electronics", cad: ["kicad"], tools: ["KiCad schematic + PCB","Flux.ai assist"], required: [{sku:"MCU-ESP32S3",qty:1},{sku:"SNS-BME280",qty:1},{sku:"SNS-INA219",qty:1},{sku:"DSP-SSD1306",qty:1},{sku:"REG-XL4015",qty:1},{sku:"PCB-PROTO79",qty:1},{sku:"WIR-DUPONT",qty:1}] },
  { id: "ix-arm-4dof", name: "4-DoF Desktop Arm", blurb: "MG996 + SG90 arm on 2020 base.", category: "robot", cad: ["onshape"], tools: ["Onshape joints"], required: [{sku:"MCU-RP2040",qty:1},{sku:"SRV-MG996",qty:2},{sku:"SRV-SG90",qty:2},{sku:"EXT-2020",qty:1},{sku:"PSU-12-10",qty:1},{sku:"DSP-SSD1306",qty:1}] },
  { id: "ix-vision-cell", name: "Edge Vision Cell", blurb: "Orin Nano + C920 inspection cell on 2040 spine.", category: "compute", cad: ["onshape"], tools: ["Onshape enclosure"], required: [{sku:"SBC-ORIN-N",qty:1},{sku:"CAM-C920",qty:1},{sku:"EXT-2040",qty:2},{sku:"PSU-24-15",qty:1},{sku:"DSP-ILI9341",qty:1}] },
  { id: "ix-cnc-foam", name: "Foam / PCB Carver", blurb: "Gantry from 2040 + leadscrew Z. Soft materials only.", category: "machine", cad: ["onshape","kicad"], tools: ["Onshape gantry","KiCad GRBL-class"], required: [{sku:"MCU-STM32F4",qty:1},{sku:"MOT-NEMA17",qty:3},{sku:"DRV-8825",qty:3},{sku:"LEAD-8-300",qty:1},{sku:"EXT-2040",qty:4},{sku:"EXT-2020",qty:4},{sku:"PSU-24-15",qty:1},{sku:"SW-LIMIT",qty:6}] },
];

export const AGENTS = [
  { id: "cataloger", name: "CATALOGER", type: TYPE.agent, role: "Ingest BOMs, label photos, serials. Mint part UUIDs. Fail closed on untyped rows." },
  { id: "matcher", name: "MATCHER", type: TYPE.agent, role: "Coverage against live pooled inventory. No phantom SKUs. Partial fills stay visible." },
  { id: "designer", name: "DESIGNER", type: TYPE.agent, role: "Route a build to Onshape / KiCad / Flux from the component library that actually exists." },
  { id: "shipper", name: "SHIPPER", type: TYPE.agent, role: "Mint crate + part labels. Propose multi-node hops between groups." },
  { id: "foreman", name: "FOREMAN", type: TYPE.agent, role: "Open a build project UUID, assign agents, emit completion receipts." },
];

export const CAD_TOOLS = [
  { id: "onshape", name: "Onshape", kind: "MCAD / assemblies", href: "https://cad.onshape.com", use: "Frames, pulleys, extrusions, printed fixtures" },
  { id: "kicad", name: "KiCad", kind: "ECAD / PCB", href: "https://www.kicad.org", use: "Control boards, breakouts, harness docs" },
  { id: "flux", name: "Flux.ai", kind: "AI ECAD", href: "https://www.flux.ai", use: "Schematic assist from the live part library" },
  { id: "freecad", name: "FreeCAD", kind: "MCAD", href: "https://www.freecad.org", use: "Offline parametric when Onshape is the wrong tool" },
  { id: "openscad", name: "OpenSCAD", kind: "CSG / code CAD", href: "https://openscad.org", use: "Deterministic printed parts keyed to GYST IDs" },
];

export function poolBySku(parts) {
  const map = {};
  for (const p of parts) {
    if (!map[p.sku]) map[p.sku] = { sku: p.sku, name: p.name, qty: 0, lots: [] };
    map[p.sku].qty += Number(p.qty) || 0;
    map[p.sku].lots.push(p);
  }
  return map;
}

export function coverage(recipe, parts) {
  const pool = poolBySku(parts);
  const lines = recipe.required.map((need) => {
    const have = pool[need.sku]?.qty || 0;
    const lots = pool[need.sku]?.lots || [];
    return { ...need, have, name: pool[need.sku]?.name || need.sku, ok: have >= need.qty, short: Math.max(0, need.qty - have), groups: [...new Set(lots.map((l) => l.groupId))] };
  });
  const met = lines.filter((l) => l.ok).length;
  const pct = Math.round((met / lines.length) * 100);
  return { lines, met, total: lines.length, pct, ready: pct === 100 };
}

export function parseBomText(text) {
  const rows = [];
  const raw = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of raw) {
    const cells = line.split(/[,|\t]/).map((c) => c.trim());
    if (cells.length === 1) { rows.push({ sku: slugSku(cells[0]), name: cells[0], qty: 1, serial: "", notes: "" }); continue; }
    const qtyCell = cells.find((c) => /^\d+$/.test(c));
    const skuCell = cells.find((c) => /[A-Z0-9]-|[A-Z]{2,}/.test(c) && c.length < 24) || cells[0];
    const name = cells.filter((c) => c !== qtyCell && c !== skuCell)[0] || skuCell;
    const serial = cells.find((c) => /^(SN|S\/N|SER)/i.test(c) || (/^[A-Z0-9-]{6,}$/.test(c) && c !== skuCell)) || "";
    rows.push({ sku: slugSku(skuCell), name, qty: Number(qtyCell) || 1, serial: String(serial).replace(/^(SN|S\/N)[:\s]*/i, ""), notes: cells.slice(3).join(" ") });
  }
  return rows;
}

function slugSku(s) {
  return String(s).toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20) || "PART";
}

export { formatUuid };
