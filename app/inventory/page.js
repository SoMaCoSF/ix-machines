"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "../../lib/store";

export default function InventoryPage() {
  const { parts, groups, scan } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const cats = useMemo(() => ["all", ...new Set(parts.map((p) => p.category))], [parts]);
  const rows = parts.filter((p) => {
    const hay = `${p.sku} ${p.name} ${p.serial || ""} ${p.mpn || ""} ${p.material || ""} ${p.groupId}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (cat !== "all" && p.category !== cat) return false;
    return true;
  });
  const gName = (id) => groups.find((g) => g.id === id)?.name || id;
  return (
    <>
      <div className="kicker">NS 0x1A1 / 0x1B8 · type 0x211 · {scan.headline}</div>
      <h1>Pooled inventory</h1>
      <p className="lead">Lots, model numbers, materials. Matcher watches this table. Nothing ships that is not a row here.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <input placeholder="SKU, MPN, material, serial…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: "auto" }}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Link className="btn" href="/upload">Add lots</Link>
        <Link className="btn ghost" href="/sources">Pull a sheet</Link>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>UUID</th><th>SKU</th><th>MPN / model</th><th>Name</th><th>Matl</th><th>Qty</th><th>Bench</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.uuid}>
                <td className="mono"><Link href={"/part/" + p.uuid}>{p.short}</Link></td>
                <td className="mono">{p.sku}</td>
                <td className="mono">{p.mpn || "—"}</td>
                <td>{p.name}</td>
                <td className="mono">{p.material || "—"}</td>
                <td>{p.qty} {p.uom || ""}</td>
                <td>{gName(p.groupId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
