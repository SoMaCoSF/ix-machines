"use client";
import { useState } from "react";
import { parseBomText } from "../../lib/data";
import { useStore } from "../../lib/store";
import { readDropped, mintDropped } from "../../lib/ingest";
import { GRAINGER_SAMPLE } from "../../lib/catalogs";
import { groupedFormats } from "../../lib/formats";

const SAMPLE = `SKU,Name,Qty,Serial\nMCU-ESP32S3,ESP32-S3 DevKit,2,ES3-99102\nMOT-NEMA17,NEMA 17 stepper,4,\nSNS-BME280,BME280 breakout,1,BME-118\nWIR-22AWG,22AWG silicone,1\n`;

export default function UploadPage() {
  const { groups, activeGroup, setActiveGroup, addParts, addAssets } = useStore();
  const [text, setText] = useState(SAMPLE);
  const [preview, setPreview] = useState(() => parseBomText(SAMPLE));
  const [dropped, setDropped] = useState([]);
  const [hover, setHover] = useState(false);
  const [done, setDone] = useState(null);

  const parse = (t) => { setText(t); setPreview(parseBomText(t)); };

  const onDrop = async (ev) => {
    ev.preventDefault();
    setHover(false);
    const recs = await readDropped(ev.dataTransfer?.files || ev.target.files);
    setDropped((d) => [...recs, ...d].slice(0, 40));
  };

  const commitText = () => {
    const minted = addParts(preview, activeGroup);
    setDone(minted);
  };

  const commitDrop = () => {
    const { assets, parts } = mintDropped(dropped, activeGroup);
    addAssets(assets);
    const minted = addParts(parts, activeGroup);
    setDone(minted);
  };

  const loadGrainger = () => parse(GRAINGER_SAMPLE);

  const buckets = {};
  for (const r of dropped) {
    buckets[r.family] = (buckets[r.family] || 0) + 1;
  }

  return (
    <>
      <div className="kicker">CATALOGER · INGEST → IDENTIFY → VALIDATE · wrap 128-bit</div>
      <h1>Drop the weird drawer.</h1>
      <p className="lead">
        CSV, XLS, DXF, STEP, STL, OBJ, KiCad, Gerber, photos of labels, Grainger-style catalogs.
        Each file is classified, minted a GYST UUID, and sortable. Vendor rows wrap under a manufacturer namespace (Grainger 0x1B1).
      </p>

      <div
        className={"drop " + (hover ? "on" : "")}
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
      >
        <div className="kicker" style={{ margin: 0 }}>drop zone</div>
        <strong>Drag files here</strong>
        <div className="meta">or click to pick · csv · xlsx · dxf · step · stl · obj · png · pdf · kicad_pcb · zip</div>
        <label className="btn ghost" style={{ marginTop: 12 }}>
          Browse
          <input type="file" multiple hidden onChange={onDrop} />
        </label>
      </div>

      {dropped.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>Sorted drops</h2>
            <button className="btn" type="button" onClick={commitDrop}>Mint files + rows</button>
          </div>
          <div className="row" style={{ marginBottom: 10 }}>
            {Object.entries(buckets).map(([k, n]) => <span className="tag" key={k}>{k} {n}</span>)}
          </div>
          <table>
            <thead><tr><th>File</th><th>Family</th><th>Ext</th><th>Rows</th><th>Vendor</th></tr></thead>
            <tbody>
              {dropped.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td className="mono">{r.family}</td>
                  <td className="mono">{r.ext}</td>
                  <td>{r.catalog?.items?.length || (r.lines?.length || 0)}</td>
                  <td className="mono">{r.catalog?.vendor?.id || r.vendor?.id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <label className="meta">Bench</label>
          <select value={activeGroup} onChange={(e) => setActiveGroup(e.target.value)} style={{ margin: "8px 0 14px" }}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.city}</option>)}
          </select>
          <label className="meta">Paste BOM / catalog text</label>
          <textarea value={text} onChange={(e) => parse(e.target.value)} style={{ marginTop: 8 }} />
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={loadGrainger}>Load Grainger sample</button>
            <button className="btn" type="button" onClick={commitText}>Mint pasted rows</button>
          </div>
        </div>
        <div className="card">
          <h2>Parse preview</h2>
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Qty</th><th>Serial</th></tr></thead>
            <tbody>{preview.slice(0, 20).map((r, i) => <tr key={i}><td className="mono">{r.sku}</td><td>{r.name}</td><td>{r.qty}</td><td className="mono">{r.serial || "—"}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      {done && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Minted</h2>
          {done.slice(0, 30).map((p) => <div key={p.uuid} className="mono" style={{ marginBottom: 6 }}>{p.short} · {p.sku} · {p.uuid}</div>)}
        </div>
      )}

      <p className="lead" style={{ marginTop: 22 }}><a href="/formats">Full format index →</a></p>
    </>
  );
}
