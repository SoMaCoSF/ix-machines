"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AGENTS, GROUPS, RECIPES, SEED_PARTS, coverage } from "./data";
import { TYPE, IX_NS, mint } from "./gyst";

const KEY = "ix-machines.v2";
const Ctx = createContext(null);

function load() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem("ix-machines.v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }) {
  const [parts, setParts] = useState(SEED_PARTS);
  const [files, setFiles] = useState([]);
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
    localStorage.setItem(KEY, JSON.stringify({ parts: parts.map(({ photo, ...p }) => ({ ...p, photo: photo && photo.length > 20000 ? null : photo })), builds, shipments, events, activeGroup, files: slimFiles }));
  }, [parts, files, builds, shipments, events, activeGroup, hydrated]);

  const log = (agent, text, extra = {}) => {
    const ev = mint(TYPE.event, IX_NS);
    setEvents((e) => [{ id: ev.formatted, ts: Date.now(), agent, text, ...extra }, ...e].slice(0, 80));
    return ev;
  };

  const api = useMemo(() => {
    const addParts = (rows, groupId, photos) => {
      const minted = rows.map((r, i) => {
        const id = mint(TYPE.part, IX_NS);
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
          unspsc: r.unspsc || null,
          vendor: r.vendor || null,
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
      setBuilds([]);
      setShipments([]);
      setEvents([]);
      localStorage.removeItem(KEY);
      localStorage.removeItem("ix-machines.v1");
    };

    return { addParts, addAssets, openBuild, planShip, reset, log };
  }, [parts, activeGroup]);

  const markets = RECIPES.map((r) => ({ recipe: r, coverage: coverage(r, parts) })).sort(
    (a, b) => b.coverage.pct - a.coverage.pct
  );

  return (
    <Ctx.Provider
      value={{
        parts,
        files,
        builds,
        shipments,
        events,
        groups: GROUPS,
        agents: AGENTS,
        recipes: RECIPES,
        markets,
        activeGroup,
        setActiveGroup,
        hydrated,
        ...api,
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
