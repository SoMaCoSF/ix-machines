"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "../../../lib/store";
import { parse, route, assimilate } from "../../../lib/gyst";

export default function PartPage() {
  const { uuid } = useParams();
  const decoded = decodeURIComponent(uuid);
  const { parts, groups } = useStore();
  const part = parts.find((p) => p.uuid === decoded || p.short === decoded);
  let parsed; try { parsed = parse(part?.uuid || decoded); } catch { parsed = null; }
  const g = groups.find((x) => x.id === part?.groupId);
  return (
    <>
      <div className="kicker">PART · type {parsed?.typeHex || "—"}</div>
      <h1>{part?.name || "Unknown lot"}</h1>
      {part && <p className="lead">{part.sku} · qty {part.qty} · {g?.name} ({g?.city})</p>}
      {part?.photo && <img src={part.photo} alt="label" style={{ maxWidth: 320, border: "1px solid var(--line2)", marginBottom: 16 }} />}
      <div className="grid g2">
        <div className="card">
          <h2>Identity</h2>
          {parsed ? (
            <table><tbody>
              <tr><th>UUID</th><td className="mono">{parsed.formatted}</td></tr>
              <tr><th>Type</th><td className="mono">{parsed.typeHex} {parsed.typeName}</td></tr>
              <tr><th>Namespace</th><td className="mono">{parsed.namespaceHex}</td></tr>
              <tr><th>Route</th><td className="mono">{JSON.stringify(route(parsed))}</td></tr>
              <tr><th>Serial</th><td className="mono">{part?.serial || "—"}</td></tr>
            </tbody></table>
          ) : <p>Could not parse UUID.</p>}
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href={"/label/" + (part?.uuid || decoded)}>Print label</Link>
            <Link className="btn ghost" href="/inventory">Inventory</Link>
          </div>
        </div>
        <div className="card">
          <h2>Assimilate</h2>
          {parsed && <pre className="meta" style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(assimilate(parsed.formatted), null, 2)}</pre>}
        </div>
      </div>
    </>
  );
}
