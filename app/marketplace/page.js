"use client";
import Link from "next/link";
import { useStore } from "../../lib/store";
import { designBrief, toolsFor } from "../../lib/cad";

export default function MarketPage() {
  const { markets, openBuild } = useStore();
  return (
    <>
      <div className="kicker">Dynamic market · only what people actually have</div>
      <h1>Things the pool can build.</h1>
      <p className="lead">Recipes are coverage-ranked against live lots. A 100% row is constructable without a vendor run.</p>
      <div className="grid">
        {markets.map((m) => {
          const tools = toolsFor(m.recipe);
          return (
            <div className="card" key={m.recipe.id}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div><div className="kicker" style={{ margin: 0 }}>{m.recipe.category}</div><h3 style={{ marginTop: 4 }}>{m.recipe.name}</h3></div>
                <span className={"tag " + (m.coverage.ready ? "ok" : m.coverage.pct > 50 ? "warn" : "bad")}>{m.coverage.pct}% · {m.coverage.met}/{m.coverage.total}</span>
              </div>
              <p className="lead" style={{ marginTop: 8 }}>{m.recipe.blurb}</p>
              <div className="bar"><i style={{ width: m.coverage.pct + "%" }} /></div>
              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table>
                  <thead><tr><th>SKU</th><th>Need</th><th>Have</th><th>Benches</th></tr></thead>
                  <tbody>
                    {m.coverage.lines.map((l) => (
                      <tr key={l.sku}>
                        <td className="mono">{l.sku}</td>
                        <td>{l.qty}</td>
                        <td style={{ color: l.ok ? "var(--ok)" : "var(--bad)" }}>{l.have}</td>
                        <td className="meta">{l.groups.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                {tools.map((t) => <a key={t.id} className="btn ghost" href={t.href} target="_blank" rel="noreferrer">{t.name}</a>)}
                <Link className="btn ghost" href={"/build/" + m.recipe.id}>Brief</Link>
                <button className="btn" type="button" onClick={() => openBuild(m.recipe)}>Open build</button>
              </div>
              <pre className="meta" style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{designBrief(m.recipe, m.coverage)}</pre>
            </div>
          );
        })}
      </div>
    </>
  );
}
