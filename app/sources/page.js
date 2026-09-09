"use client";
import { useState } from "react";
import { EAST_SAMPLE, parseSheetText, sheetToCsvUrl } from "../../lib/sheets";
import { useStore } from "../../lib/store";

export default function SourcesPage() {
  const { addParts, addSource, sources, activeGroup, scan } = useStore();
  const [url, setUrl] = useState("");
  const [text, setText] = useState(EAST_SAMPLE);
  const [preview, setPreview] = useState(() => parseSheetText(EAST_SAMPLE, "east-materials.csv"));
  const [err, setErr] = useState("");

  const parse = (t, name = "sheet.csv") => {
    setText(t);
    try { setPreview(parseSheetText(t, name)); setErr(""); }
    catch (e) { setErr(String(e.message || e)); }
  };

  const pull = async () => {
    setErr("");
    const target = sheetToCsvUrl(url);
    const res = await fetch("/api/sheet?url=" + encodeURIComponent(target));
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "fetch failed"); return; }
    parse(data.text, target);
    addSource({ name: "remote sheet", url: target, kind: "csv", rows: parseSheetText(data.text, target).items.length });
  };

  const commit = () => {
    addSource({ name: preview.vendor.name, kind: "csv", rows: preview.items.length, ns: preview.vendor.ns });
    addParts(preview.items, activeGroup);
  };

  return (
    <>
      <div className="kicker">sheet feeds · east / mill books · google csv</div>
      <h1>Bind a materials book.</h1>
      <p className="lead">
        Garage lots and warehouse sheets are the same row after wrap: model no, material, qty, unit.
        Drop a CSV, paste an East-style book, or point at a published Google Sheet export.
        MATCHER re-ranks the market the moment the rows land. Live: {scan.headline}.
      </p>

      <div className="card" style={{ marginBottom: 14 }}>
        <label className="meta">Published sheet URL</label>
        <div className="row" style={{ marginTop: 8 }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/… or raw .csv" />
          <button className="btn" type="button" onClick={pull}>Pull</button>
        </div>
        <div className="meta" style={{ marginTop: 8 }}>Allowed: Google Sheets export, raw GitHub CSV. Publish the sheet first or the proxy gets HTML.</div>
        {err && <div className="tag bad" style={{ marginTop: 8 }}>{err}</div>}
      </div>

      <div className="grid g2">
        <div className="card">
          <label className="meta">Sheet text</label>
          <textarea value={text} onChange={(e) => parse(e.target.value, "east-materials.csv")} style={{ marginTop: 8 }} />
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={() => parse(EAST_SAMPLE, "east-materials.csv")}>Load East sample</button>
            <button className="btn" type="button" onClick={commit}>Mint {preview.items.length} rows</button>
          </div>
        </div>
        <div className="card">
          <h2>{preview.vendor.name} · ns 0x{preview.vendor.ns.toString(16)}</h2>
          <table>
            <thead><tr><th>Model</th><th>Name</th><th>Matl</th><th>Qty</th></tr></thead>
            <tbody>
              {preview.items.slice(0, 16).map((r, i) => (
                <tr key={i}><td className="mono">{r.sku}</td><td>{r.name}</td><td className="mono">{r.material || "—"}</td><td>{r.qty} {r.uom}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Bound sources</h2>
          {sources.map((s) => <div key={s.uuid} className="mono">{s.short} · {s.name} · {s.rows || 0} rows</div>)}
        </div>
      )}
    </>
  );
}
