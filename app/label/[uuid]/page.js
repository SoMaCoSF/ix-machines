"use client";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { parse } from "../../../lib/gyst";
import { useStore } from "../../../lib/store";

export default function LabelPage() {
  const { uuid } = useParams();
  const decoded = decodeURIComponent(uuid);
  const { parts, builds, groups } = useStore();
  const part = parts.find((p) => p.uuid === decoded);
  const build = builds.find((b) => b.uuid === decoded || b.crate === decoded);
  let parsed; try { parsed = parse(decoded); } catch { parsed = null; }
  const bits = useMemo(() => parsed ? parsed.raw.slice(0, 16).split("").map((c) => parseInt(c, 16) % 2) : [], [parsed]);
  const title = part?.name || build?.name || parsed?.typeName || "IX LOT";
  const sub = part?.sku || (build ? "CRATE " + (build.crate || "").slice(0, 8) : parsed?.typeHex);
  const g = groups.find((x) => x.id === part?.groupId);
  return (
    <>
      <div className="kicker">Print · GYST UUIDv8 label</div>
      <h1>Part / project label</h1>
      <div className="label-sheet" style={{ maxWidth: 420 }}>
        <div className="tiny">IX-MACHINES · SOMACOSF · NS 0x1A1</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{title}</div>
        <div className="tiny">{sub}</div>
        <div className="blocks">{bits.map((b, i) => <i key={i} style={{ opacity: b ? 1 : 0.2 }} />)}</div>
        <div className="uid">{parsed?.formatted || decoded}</div>
        <div className="tiny">TYPE {parsed?.typeHex} · {parsed?.typeName?.toUpperCase()} · TS {parsed?.timestampSlice}</div>
        {part?.serial && <div className="tiny">SERIAL {part.serial}</div>}
        {g && <div className="tiny">FROM {g.name.toUpperCase()} · {g.city.toUpperCase()}</div>}
        <div className="tiny" style={{ marginTop: 10 }}>FAIL CLOSED · NO JOIN REQUIRED TO ROUTE</div>
      </div>
      <button className="btn ghost" type="button" style={{ marginTop: 16 }} onClick={() => window.print()}>Print</button>
    </>
  );
}
