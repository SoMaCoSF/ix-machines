"use client";
import Link from "next/link";
import { useStore } from "../lib/store";

export default function Home() {
  const { parts, markets, builds, events, groups, agents } = useStore();
  const lots = parts.length;
  const units = parts.reduce((n, p) => n + Number(p.qty || 0), 0);
  const ready = markets.filter((m) => m.coverage.ready).length;
  return (
    <>
      <div className="kicker">SoMaCo Protocol · GYST UUIDv8 · NS 0x1A1</div>
      <h1>Build from what is actually in the garage.</h1>
      <p className="lead">
        Groups upload lots, BOMs, label photos and serials. Agents mint part and project IDs,
        match recipes against the live pool, open CAD in Onshape or KiCad against that library,
        and stage labeled crates between benches.
      </p>
      <div className="grid g4" style={{ marginBottom: 22 }}>
        <div className="stat"><b>{units}</b><span>Units pooled</span></div>
        <div className="stat"><b>{lots}</b><span>Labeled lots</span></div>
        <div className="stat"><b>{ready}</b><span>Buildable now</span></div>
        <div className="stat"><b>{groups.length}</b><span>Benches</span></div>
      </div>
      <div className="row" style={{ marginBottom: 28 }}>
        <Link className="btn" href="/upload">Ingest a BOM</Link>
        <Link className="btn ghost" href="/marketplace">Open marketplace</Link>
        <Link className="btn ghost" href="/swarm">Run swarm</Link>
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>Highest coverage</h2>
          {markets.slice(0, 4).map((m) => (
            <div key={m.recipe.id} style={{ marginBottom: 14 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{m.recipe.name}</strong>
                <span className={"tag " + (m.coverage.ready ? "ok" : "warn")}>{m.coverage.pct}%</span>
              </div>
              <div className="bar" style={{ marginTop: 6 }}><i style={{ width: m.coverage.pct + "%" }} /></div>
              <div className="meta" style={{ marginTop: 6 }}>{m.coverage.met}/{m.coverage.total} SKUs · {m.recipe.cad.join(" + ")}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Agent lattice</h2>
          {agents.map((a) => (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div className="mono" style={{ color: "var(--amber)" }}>{a.name}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{a.role}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>Open builds</h2>
          {builds.length === 0 && <p className="lead">No projects opened yet. Market → Open build.</p>}
          {builds.slice(0, 5).map((b) => (
            <div key={b.uuid} className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <div><div>{b.name}</div><div className="mono meta">{b.short}</div></div>
              <span className="tag">{b.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Colloquy</h2>
          <div className="feed">
            {events.slice(0, 8).map((e) => (
              <div key={e.id}><span style={{ color: "var(--amber)" }}>{e.agent}</span> · {e.text}</div>
            ))}
            {events.length === 0 && <div>No agent events yet.</div>}
          </div>
        </div>
      </div>
    </>
  );
}
