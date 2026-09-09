"use client";
import { useStore } from "../../lib/store";

export default function RipPage() {
  const { builds, rips, ripcycle, parts } = useStore();
  const ripped = parts.filter((p) => p.condition === "ripped" || p.category === "ripped");
  return (
    <>
      <div className="kicker">RIPcycle · type 0x219 · tear down → new lots</div>
      <h1>Nothing stays dead in the pile.</h1>
      <p className="lead">
        A finished, failed, or abandoned build is still a BOM. RIP tears it back into lots with parent UUIDs.
        Those lots re-enter MATCHER like any other garage stock. Offcuts from NOX / SendCutSend belong here too.
      </p>
      <div className="grid g2">
        <div className="card">
          <h2>Open / gatherable builds</h2>
          {builds.filter((b) => b.status !== "ripped").map((b) => (
            <div key={b.uuid} className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div>{b.name}</div>
                <div className="mono meta">{b.short} · {b.status} · {b.coverage}%</div>
              </div>
              <button className="btn" type="button" onClick={() => ripcycle(b)}>RIP</button>
            </div>
          ))}
          {builds.filter((b) => b.status !== "ripped").length === 0 && <p className="lead">Open a build on Market first.</p>}
        </div>
        <div className="card">
          <h2>RIP tickets</h2>
          {rips.length === 0 && <p className="lead">No tear-downs yet.</p>}
          {rips.map((r) => (
            <div key={r.uuid} className="mono" style={{ marginBottom: 8 }}>{r.short} · {r.name} · {r.lots} lots back</div>
          ))}
        </div>
      </div>
      {ripped.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Returned lots</h2>
          <table>
            <thead><tr><th>UUID</th><th>SKU</th><th>Qty</th><th>Parent</th></tr></thead>
            <tbody>
              {ripped.map((p) => (
                <tr key={p.uuid}><td className="mono">{p.short}</td><td className="mono">{p.sku}</td><td>{p.qty}</td><td className="mono">{p.parent ? p.parent.slice(0, 8) : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
