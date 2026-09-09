"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AGENTS, GROUPS, RECIPES, SEED_PARTS, coverage } from "./data";
import { TYPE, IX_NS, mint } from "./gyst";
import { scanPool } from "./watcher";

const KEY = "ix-machines.v3";
const Ctx = createContext(null);

function load() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem("ix-machines.v2") || localStorage.getItem("ix-machines.v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }) {
  const [parts, setParts] = useState(SEED_PARTS);
  const [files, setFiles] = useState([]);
  const [sources, setSources] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [events, setEvents] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeGroup, setActiveGroup] = useState(GROUPS[1].id);

  useEffect(() => {
    const saved = load();
    if (saved) {
      if (saved.parts?.length) setParts(saved.parts);
      if (saved.files) setFiles(saved.files);
      if (saved.sources) setSources(saved.sources);
      if (saved.builds) setBuilds(saved.builds);
      if (saved.shipments) setShipments(saved.shipments);
      if (saved.events) setEvents(saved.events);
      if (saved.activeGroup) setActiveGroup(saved.activeGroup);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const slimFiles = files.map(({ photo, ...f }) => f);
    localStorage.setItem(KEY, JSON.stringify({
      parts: parts.map(({ photo, ...p }) => ({ ...p, photo: photo && String(photo).length > 20000 ? null : photo })),
      builds, shipments, events, activeGroup, files: slimFiles, sources,
    }));
  }, [parts, files, sources, builds, shipments, events, activeGroup, hydrated]);

  const log = (agent, text, extra = {}) => {
    const ev = mint(TYPE.event, IX_NS);
    setEvents((e) => [{ id: ev.formatted, ts: Date.now(), agent, text, ...extra }, ...e].slice(0, 80));
    return ev;
  };

  const scan = useMemo(() => scanPool(RECIPES, parts), [parts]);

  useEffect(() => {
    if (!hydrated) return;
    log("MATCHER", `Scan: ${scan.headline} · ${scan.lots} lots / ${scan.skus} SKUs.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan.headline, scan.lots]);

  const api = useMemo(() => {
    const addParts = (rows, groupId, photos) => {
      const minted = rows.map((r, i) => {
        const id = mint(TYPE.part, r.vendor === "east" ? 0x1b8 : IX_NS);
        return {
          uuid: id.formatted,
          short: id.short,
          sku: r.sku,
          name: r.name,
          category: r.category || "misc",
          qty: Number(r.qty) || 1,
          condition: r.condition || "used-good",
          groupId: groupId || activeGroup,
          serial: r.serial || null,
          mpn: r.mpn || null,
          material: r.material || null,
          unspsc: r.unspsc || null,
          vendor: r.vendor || null,
          uom: r.uom || "EA",
          notes: r.notes || "",
          photoHint: photos?.[i] ? "uploaded" : "none",
          photo: photos?.[i] || r.photo || null,
          tags: r.tags || [],
          cad: r.cad || null,
          fileUuid: r.fileUuid || null,
        };
      });
      setParts((p) => [...minted, ...p]);
      log("CATALOGER", `Ingested ${minted.length} lot(s) into ${groupId || activeGroup}.`);
      return minted;
    };

    const addAssets = (assets) => {
      setFiles((f) => [...assets, ...f]);
      log("CATALOGER", `Wrapped ${assets.length} file asset(s).`);
    };

    const addSource = (src) => {
      const id = mint(TYPE.catalog, src.ns || 0x1b8);
      const rec = { uuid: id.formatted, short: id.short, ...src, at: Date.now() };
      setSources((s) => [rec, ...s]);
      log("CATALOGER", `Bound sheet source ${src.name || src.url || "local"}.`);
      return rec;
    };

    const openBuild = (recipe) => {
      const cov = coverage(recipe, parts);
      const id = mint(TYPE.build, IX_NS);
      const crate = mint(TYPE.crate, IX_NS);
      const build = {
        id: recipe.id,
        uuid: id.formatted,
        short: id.short,
        crate: crate.formatted,
        name: recipe.name,
        recipeId: recipe.id,
        status: cov.ready ? "ready" : "gathering",
        coverage: cov.pct,
        openedAt: Date.now(),
        lines: cov.lines,
      };
      setBuilds((b) => [build, ...b]);
      log("FOREMAN", `Opened build ${id.short} — ${recipe.name} (${cov.pct}% coverage).`);
      return build;
    };

    const planShip = (build) => {
      const hops = [];
      const needGroups = new Set();
      for (const line of build.lines || []) {
        for (const g of line.groups || []) needGroups.add(g);
      }
      const nodes = [...needGroups];
      const dest = nodes[0] || activeGroup;
      nodes.forEach((from, i) => {
        if (from === dest && nodes.length === 1) return;
        const label = mint(TYPE.shipment, IX_NS);
        hops.push({ uuid: label.formatted, short: label.short, from, to: dest, status: "staged", seq: i + 1 });
      });
      if (hops.length === 0) {
        const label = mint(TYPE.shipment, IX_NS);
        hops.push({ uuid: label.formatted, short: label.short, from: dest, to: dest, status: "local", seq: 1 });
      }
      const ship = { uuid: mint(TYPE.shipment, IX_NS).formatted, buildUuid: build.uuid, buildName: build.name, crate: build.crate, hops, createdAt: Date.now() };
      setShipments((s) => [ship, ...s]);
      log("SHIPPER", `Staged ${hops.length} hop(s) for crate ${build.crate.slice(0, 8)}.`);
      return ship;
    };

    const reset = () => {
      setParts(SEED_PARTS);
      setFiles([]);
      setSources([]);
      setBuilds([]);
      setShipments([]);
      setEvents([]);
      localStorage.removeItem(KEY);
      localStorage.removeItem("ix-machines.v2");
      localStorage.removeItem("ix-machines.v1");
    };

    return { addParts, addAssets, addSource, openBuild, planShip, reset, log };
  }, [parts, activeGroup]);

  const markets = RECIPES.map((r) => ({ recipe: r, coverage: coverage(r, parts) })).sort(
    (a, b) => b.coverage.pct - a.coverage.pct
  );

  return (
    <Ctx.Provider
      value={{
        parts, files, sources, builds, shipments, events,
        groups: GROUPS, agents: AGENTS, recipes: RECIPES, markets, scan,
        activeGroup, setActiveGroup, hydrated, ...api,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
