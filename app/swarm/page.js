"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "../../lib/store";
import { coverage } from "../../lib/data";
import { TYPE, IX_NS, mint } from "../../lib/gyst";

export default function SwarmPage() {
  const { agents, recipes, parts, openBuild, planShip, log, events, builds, scan } = useStore();
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState([]);
  const run = async () => {
    setRunning(true);
    const steps = [];
    const push = (agent, text) => {
      const ev = mint(TYPE.turn, IX_NS);
      steps.push({ id: ev.formatted, agent, text });
      setTrace([...steps]);
      log(agent, text);
    };
    push("CATALOGER", `Pool holds ${parts.length} lots / ${scan.skus} SKUs.`);
    await wait(220);
    push("MATCHER", scan.headline);
    await wait(220);
    const pick = recipes.map((r) => ({ r, c: coverage(r, parts) })).sort((a, b) => b.c.pct - a.c.pct)[0];
    push("DESIGNER", `Routing ${pick.r.name} → ${(pick.r.cad || []).join(", ")}.`);
    await wait(220);
    const build = openBuild(pick.r);
    push("FOREMAN", `Build ${build.short} opened. Status ${build.status}.`);
    await wait(220);
    const ship = planShip(build);
    push("SHIPPER", `Crate ${build.crate.slice(0, 8)} · ${ship.hops.length} hop(s).`);
    setRunning(false);
  };
  return (
    <>
      <div className="kicker">watcher is live · MATCHER re-ranks on every ingest</div>
      <h1>Agent swarm</h1>
      <p className="lead">Corpus in, scan out. {scan.headline}. Ready builds sit on the market until someone opens a project UUID.</p>
      <div className="grid g3" style={{ marginBottom: 16 }}>
        <div className="stat"><b>{scan.lots}</b><span>Lots</span></div>
        <div className="stat"><b>{scan.ready.length}</b><span>Fully covered</span></div>
        <div className="stat"><b>{scan.close.length}</b><span>Close (≥60%)</span></div>
      </div>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn" type="button" onClick={run} disabled={running}>{running ? "Swarming…" : "Run swarm on live pool"}</button>
        <Link className="btn ghost" href="/marketplace">Open market</Link>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Matcher board</h2>
        <table>
          <thead><tr><th>Recipe</th><th>Cover</th><th>Missing</th></tr></thead>
          <tbody>
            {scan.ranked.map((r) => (
              <tr key={r.recipeId}>
                <td>{r.name}</td>
                <td className={r.ready ? "tag ok" : r.pct >= 60 ? "tag warn" : "mono"}>{r.pct}%</td>
                <td className="meta">{r.missing.map((m) => m.sku).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>Roster</h2>
          {agents.map((a) => (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div className="mono" style={{ color: "var(--amber)" }}>{a.name}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{a.role}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Trace</h2>
          <div className="feed">
            {(trace.length ? trace : events.slice(0, 12)).map((e) => (
              <div key={e.id}><span style={{ color: "var(--amber)" }}>{e.agent}</span> · {e.text}</div>
            ))}
          </div>
        </div>
      </div>
      {builds[0] && <div className="card" style={{ marginTop: 14 }}><h2>Latest project</h2><div className="mono">{builds[0].uuid} · crate {builds[0].crate}</div></div>}
    </>
  );
}
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
