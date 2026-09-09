"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../lib/store";

const LINKS = [
  ["/", "Deck"],
  ["/inventory", "Inventory"],
  ["/upload", "Ingest"],
  ["/formats", "Formats"],
  ["/marketplace", "Market"],
  ["/swarm", "Swarm"],
  ["/ship", "Ship"],
];

export default function Shell({ children }) {
  const path = usePathname();
  const { groups, activeGroup, setActiveGroup } = useStore();
  return (
    <div className="app">
      <header className="top">
        <Link href="/" className="brand">
          <b>IX-MACHINES</b>
          <span>SOM.1A1</span>
        </Link>
        <nav className="nav">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? "on" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        <select
          value={activeGroup}
          onChange={(e) => setActiveGroup(e.target.value)}
          style={{ width: "auto", minWidth: 180 }}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </header>
      <main className="wrap">{children}</main>
    </div>
  );
}
