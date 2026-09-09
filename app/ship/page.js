"use client";
import Link from "next/link";
import { useStore } from "../../lib/store";

export default function ShipPage() {
  const { shipments, builds, groups, planShip, moves, fillShorts } = useStore();
  const gName = (id) => groups.find((g) => g.id === id)?.name || id;
  return (
    <>
      <div className="kicker">SHIPPER · 0x221 hop · 0x222 crate · 0x223 inbound</div>
      <h1>Sort the corpus. Fill what you lack.</h1>
      <p className="lead">Bench-to-bench hops first. Partner packets only when a SKU is missing everywhere. Every hop is a UUID you can tape to a crate.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        {builds.length > 0 && <button className="btn" type="button" onClick={() => planShip(builds[0])}>Stage bench hops</button>}
        <button className="btn ghost" type="button" onClick={fillShorts}>Fill shorts via partners</button>
        <Link className="btn ghost" href="/partners">Partner rails</Link>
      </div>
      {moves.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <h2>Sorter proposals</h2>
          <table>
            <thead><tr><th>SKU</th><th>From</th><th>To</th><th>Qty</th></tr></thead>
            <tbody>
              {moves.map((m, i) => (
                <tr key={i}><td className="mono">{m.sku}</td><td>{gName(m.from)}</td><td>{gName(m.to)}</td><td>{m.qty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {shipments.length === 0 && <p className="lead">No shipments yet. Open a build, then stage hops.</p>}
      <div className="grid">
        {shipments.map((s) => (
          <div className="card" key={s.uuid}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>{s.buildName}</h3>
              <Link className="btn ghost" href={"/label/" + s.crate}>Crate label</Link>
            </div>
            <div className="mono meta">crate {s.crate}</div>
            <table style={{ marginTop: 10 }}>
              <thead><tr><th>#</th><th>Hop UUID</th><th>From</th><th>To</th><th>State</th></tr></thead>
              <tbody>
                {s.hops.map((h) => (
                  <tr key={h.uuid}>
                    <td>{h.seq}</td>
                    <td className="mono"><Link href={"/label/" + h.uuid}>{h.short}</Link></td>
                    <td>{gName(h.from)}</td>
                    <td>{gName(h.to)}</td>
                    <td><span className="tag">{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
