"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "../../../lib/store";
import { coverage, CAD_TOOLS } from "../../../lib/data";
import { designBrief, toolsFor } from "../../../lib/cad";

export default function BuildPage() {
  const { id } = useParams();
  const { recipes, parts, openBuild, planShip } = useStore();
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return <p>Unknown recipe.</p>;
  const cov = coverage(recipe, parts);
  const tools = toolsFor(recipe);
  return (
    <>
      <div className="kicker">BUILD · type 0x230</div>
      <h1>{recipe.name}</h1>
      <p className="lead">{recipe.blurb}</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <span className={"tag " + (cov.ready ? "ok" : "warn")}>{cov.pct}% coverage</span>
        <button className="btn" type="button" onClick={() => openBuild(recipe)}>Open project UUID</button>
        <button className="btn ghost" type="button" onClick={() => { const b = openBuild(recipe); planShip(b); }}>Open + stage ship</button>
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>BOM vs pool</h2>
          <table>
            <thead><tr><th>SKU</th><th>Need</th><th>Have</th></tr></thead>
            <tbody>{cov.lines.map((l) => <tr key={l.sku}><td className="mono">{l.sku}</td><td>{l.qty}</td><td style={{ color: l.ok ? "var(--ok)" : "var(--bad)" }}>{l.have}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card">
          <h2>CAD / viz tools</h2>
          {tools.map((t) => <div key={t.id} style={{ marginBottom: 12 }}><a href={t.href} target="_blank" rel="noreferrer"><strong>{t.name}</strong></a><div className="meta">{t.kind} — {t.use}</div></div>)}
          {CAD_TOOLS.filter((t) => !tools.find((x) => x.id === t.id)).map((t) => <div key={t.id} className="meta" style={{ marginBottom: 8 }}>Also available: {t.name}</div>)}
          <pre className="meta" style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{designBrief(recipe, cov)}</pre>
          <Link className="btn ghost" href="/marketplace">Back to market</Link>
        </div>
      </div>
    </>
  );
}
