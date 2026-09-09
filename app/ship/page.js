"use client";
import Link from "next/link";
import { useStore } from "../../lib/store";

export default function ShipPage() {
  const { shipments, builds, groups, planShip } = useStore();
  const gName = (id) => groups.find((g) => g.id === id)?.name || id;
  return (
    <>
      <div className="kicker">SHIPPER · type 0x221 shipment · 0x222 crate</div>
      <h1>Labeled hops between benches.</h1>
      <p className="lead">Every crate and every hop is a GYST UUID. Print the label, tape it to the extrusion, scan it at the next garage.</p>
      {builds.length > 0 && (
        <div className="row" style={{ marginBottom: 16 }}>
          <button className="btn" type="button" onClick={() => planShip(builds[0])}>Stage hops for latest build</button>
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
