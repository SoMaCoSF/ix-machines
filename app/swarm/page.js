"use client";
import { useState } from "react";
import { useStore } from "../../lib/store";
import { coverage } from "../../lib/data";
import { TYPE, IX_NS, mint } from "../../lib/gyst";

export default function SwarmPage() {
  const { agents, recipes, parts, openBuild, planShip, log, events, builds } = useStore();
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
    push("CATALOGER", `Pool holds ${parts.length} lots. All type 0x211 / ns 0x1A1.`);
    await wait(280);
    const ranked = recipes.map((r) => ({ r, c: coverage(r, parts) })).sort((a, b) => b.c.pct - a.c.pct);
    push("MATCHER", `Ranked ${ranked.length} recipes. Top: ${ranked[0].r.name} at ${ranked[0].c.pct}%.`);
    await wait(280);
    const pick = ranked.find((x) => x.c.pct >= 70) || ranked[0];
    push("DESIGNER", `Routing ${pick.r.name} → ${(pick.r.cad || []).join(", ")}. Constraint: no phantom SKUs.`);
    await wait(280);
    const build = openBuild(pick.r);
    push("FOREMAN", `Build ${build.short} opened. Status ${build.status}.`);
    await wait(280);
    const ship = planShip(build);
    push("SHIPPER", `Crate ${build.crate.slice(0, 8)} · ${ship.hops.length} hop(s) staged.`);
    setRunning(false);
  };
  return (
    <>
      <div className="kicker">Vertex · type 0x500 · assimilation INGEST→REPORT</div>
      <h1>Agent swarm</h1>
      <p className="lead">Five named agents walk the lattice: catalog, match, design, open a project UUID, stage shipping labels.</p>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn" type="button" onClick={run} disabled={running}>{running ? "Swarming…" : "Run swarm on live pool"}</button>
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
