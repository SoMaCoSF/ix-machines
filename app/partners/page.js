"use client";
import { useStore } from "../../lib/store";

export default function PartnersPage() {
  const { partners, fillShorts, receiveOrder, orders, scan, activeGroup } = useStore();
  return (
    <>
      <div className="kicker">inbound · type 0x223 · ns 0x1C1–1C3</div>
      <h1>Partner rails.</h1>
      <p className="lead">
        Short SKUs do not invent stock. They open a packet to a real mill: NOX for plate/bar,
        SendCutSend for DXF profiles, PCBWay for Gerber + BOM. Receive lands a lot on {activeGroup}.
        Live shorts: {scan.headline}.
      </p>
      <div className="row" style={{ marginBottom: 16 }}>
        <button className="btn" type="button" onClick={fillShorts}>Open packets for current shorts</button>
      </div>
      <div className="grid g3" style={{ marginBottom: 16 }}>
        {partners.map((p) => (
          <div className="card" key={p.id}>
            <div className="kicker" style={{ margin: 0 }}>ns 0x{p.ns.toString(16)}</div>
            <h3>{p.name}</h3>
            <div className="meta">{p.kind} · {p.city}</div>
            <p className="lead" style={{ marginTop: 8 }}>{p.note}</p>
            <div className="tag">{p.lead}</div>
            <div className="row" style={{ marginTop: 10 }}>
              <a className="btn ghost" href={p.href} target="_blank" rel="noreferrer">Portal</a>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>Open packets</h2>
        {orders.length === 0 && <p className="lead">No packets. Run the button after a matcher scan shows missing SKUs.</p>}
        <table>
          <thead><tr><th>Hop</th><th>Partner</th><th>SKU</th><th>Qty</th><th>State</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.uuid}>
                <td className="mono">{o.short}</td>
                <td>{o.partnerName}</td>
                <td className="mono">{o.sku}</td>
                <td>{o.qty}</td>
                <td><span className="tag">{o.status}</span></td>
                <td>
                  {o.status !== "received" && <button className="btn ghost" type="button" onClick={() => receiveOrder(o)}>Mark received</button>}
                  <a className="btn ghost" href={o.href} target="_blank" rel="noreferrer">Submit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
