"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "../../lib/store";

export default function InventoryPage() {
  const { parts, groups } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const cats = useMemo(() => ["all", ...new Set(parts.map((p) => p.category))], [parts]);
  const rows = parts.filter((p) => {
    const hay = `${p.sku} ${p.name} ${p.serial || ""} ${p.groupId}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (cat !== "all" && p.category !== cat) return false;
    return true;
  });
  const gName = (id) => groups.find((g) => g.id === id)?.name || id;
  return (
    <>
      <div className="kicker">NS 0x1A1 · type 0x211 part</div>
      <h1>Pooled inventory</h1>
      <p className="lead">Every lot carries a GYST UUIDv8. Zero-query type + namespace on the label.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <input placeholder="Search SKU, serial, bench…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: "auto" }}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Link className="btn" href="/upload">Add lots</Link>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>UUID</th><th>SKU</th><th>Name</th><th>Qty</th><th>Serial</th><th>Bench</th><th>CAD</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.uuid}>
                <td className="mono"><Link href={"/part/" + p.uuid}>{p.short}</Link></td>
                <td className="mono">{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.qty}</td>
                <td className="mono">{p.serial || "—"}</td>
                <td>{gName(p.groupId)}</td>
                <td className="mono">{p.cad || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
