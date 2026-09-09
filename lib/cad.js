import { CAD_TOOLS } from "./data";

export function toolsFor(recipe) {
  const ids = recipe?.cad || [];
  return CAD_TOOLS.filter((t) => ids.includes(t.id));
}

export function designBrief(recipe, coverage) {
  const have = (coverage?.lines || []).filter((l) => l.ok).map((l) => `${l.qty} x ${l.sku}`);
  const miss = (coverage?.lines || []).filter((l) => !l.ok).map((l) => `${l.short} x ${l.sku}`);
  return [
    `PROJECT: ${recipe.name}`,
    `CONSTRAINT: design only from inventoried SKUs. Do not introduce phantom vendors.`,
    `IN HAND: ${have.join(", ") || "none"}`,
    `SHORT: ${miss.join(", ") || "none"}`,
    `CAD: ${(recipe.cad || []).join(", ")}`,
    `OUTPUT: assembly tree + fastener schedule + control-board netlist keyed to GYST part UUIDs.`,
  ].join("\n");
}

export { CAD_TOOLS };
