import { coverage } from "./data";

/** MATCHER pass. Re-run whenever the corpus grows. No phantom SKUs. */
export function scanPool(recipes, parts) {
  const ranked = recipes
    .map((recipe) => {
      const cov = coverage(recipe, parts);
      const missing = cov.lines.filter((l) => !l.ok);
      return {
        recipeId: recipe.id,
        name: recipe.name,
        category: recipe.category,
        pct: cov.pct,
        ready: cov.ready,
        met: cov.met,
        total: cov.total,
        missing: missing.map((l) => ({ sku: l.sku, need: l.qty, have: l.have })),
        benches: [...new Set(cov.lines.flatMap((l) => l.groups || []))],
      };
    })
    .sort((a, b) => b.pct - a.pct);

  const ready = ranked.filter((r) => r.ready);
  const close = ranked.filter((r) => !r.ready && r.pct >= 60);
  return {
    at: Date.now(),
    lots: parts.length,
    skus: new Set(parts.map((p) => p.sku)).size,
    ready,
    close,
    ranked,
    headline: ready.length
      ? `${ready.length} build(s) fully covered`
      : close.length
        ? `${close.length} build(s) ≥60% — waiting on ${close[0].missing[0]?.sku || "parts"}`
        : "corpus too thin for a full machine",
  };
}
