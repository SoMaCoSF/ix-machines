"use client";
import { useState } from "react";
import { parseBomText } from "../../lib/data";
import { useStore } from "../../lib/store";

const SAMPLE = `SKU,Name,Qty,Serial\nMCU-ESP32S3,ESP32-S3 DevKit,2,ES3-99102\nMOT-NEMA17,NEMA 17 stepper,4,\nSNS-BME280,BME280 breakout,1,BME-118\nWIR-22AWG,22AWG silicone,1\n`;

export default function UploadPage() {
  const { groups, activeGroup, setActiveGroup, addParts } = useStore();
  const [text, setText] = useState(SAMPLE);
  const [preview, setPreview] = useState(() => parseBomText(SAMPLE));
  const [photos, setPhotos] = useState([]);
  const [done, setDone] = useState(null);
  const parse = (t) => { setText(t); setPreview(parseBomText(t)); };
  const onFiles = async (list) => {
    const files = Array.from(list || []).slice(0, 8);
    const urls = await Promise.all(files.map((f) => new Promise((res) => {
      const r = new FileReader(); r.onload = () => res({ name: f.name, data: r.result }); r.readAsDataURL(f);
    })));
    setPhotos(urls);
  };
  const commit = () => {
    const minted = addParts(preview.map((r, i) => ({ ...r, notes: photos[i] ? `label photo: ${photos[i].name}` : r.notes })), activeGroup, photos.map((p) => p.data));
    setDone(minted);
  };
  return (
    <>
      <div className="kicker">CATALOGER · INGEST → IDENTIFY → VALIDATE</div>
      <h1>Ingest lots, BOMs, labels.</h1>
      <p className="lead">Paste a CSV / TSV / one-item-per-line list. Attach photos of silkscreens, barcodes, or serial plates. Cataloger mints a type-0x211 UUID per lot.</p>
      <div className="grid g2">
        <div className="card">
          <label className="meta">Bench</label>
          <select value={activeGroup} onChange={(e) => setActiveGroup(e.target.value)} style={{ margin: "8px 0 14px" }}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.city}</option>)}
          </select>
          <label className="meta">BOM / inventory list</label>
          <textarea value={text} onChange={(e) => parse(e.target.value)} style={{ marginTop: 8 }} />
          <div className="row" style={{ marginTop: 12 }}>
            <label className="btn ghost">Label / serial photos<input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} /></label>
            <button className="btn" onClick={commit} type="button">Mint lots</button>
          </div>
          {photos.length > 0 && (
            <div className="row" style={{ marginTop: 12 }}>
              {photos.map((p) => <img key={p.name} src={p.data} alt={p.name} style={{ width: 72, height: 72, objectFit: "cover", border: "1px solid var(--line2)" }} />)}
            </div>
          )}
        </div>
        <div className="card">
          <h2>Parse preview</h2>
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Qty</th><th>Serial</th></tr></thead>
            <tbody>{preview.map((r, i) => <tr key={i}><td className="mono">{r.sku}</td><td>{r.name}</td><td>{r.qty}</td><td className="mono">{r.serial || "—"}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      {done && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Minted</h2>
          {done.map((p) => <div key={p.uuid} className="mono" style={{ marginBottom: 6 }}>{p.short} · {p.sku} · {p.uuid}</div>)}
        </div>
      )}
    </>
  );
}
