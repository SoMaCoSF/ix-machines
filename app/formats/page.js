"use client";
import { groupedFormats, FAMILIES, GYST_FILE_TYPE } from "../../lib/formats";
import { VENDORS } from "../../lib/catalogs";

const LABELS = {
  list: "Lists / BOMs",
  workbook: "Spreadsheets",
  note: "Notes",
  cad3d: "Exact 3D CAD",
  cad2d: "2D CAD / CNC",
  mesh: "Meshes / print / viz",
  ecad: "ECAD",
  fab: "Fab / toolpath",
  image: "Label / serial photos",
  datasheet: "Datasheets",
  catalog: "Manufacturer catalogs",
  archive: "Archives",
};

export default function FormatsPage() {
  const groups = groupedFormats();
  return (
    <>
      <div className="kicker">ingest taxonomy · wrap then sort</div>
      <h1>What the garage actually drops.</h1>
      <p className="lead">
        Odd lots do not arrive as a clean schema. They arrive as a mix of notes, workbooks, STEP files someone emailed in 2019, a phone photo of a nameplate, and a Grainger punchout export. Classify by extension, sniff text when cheap, mint a 128-bit id either way.
      </p>
      {Object.keys(LABELS).map((fam) => (
        <div className="card" key={fam} style={{ marginBottom: 12 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>{LABELS[fam]}</h2>
            <span className="tag">type 0x{GYST_FILE_TYPE[fam].toString(16)}</span>
          </div>
          <table>
            <thead><tr><th>Ext</th><th>Use</th><th>Text parse</th></tr></thead>
            <tbody>
              {(groups[fam] || []).map((f) => (
                <tr key={f.ext}>
                  <td className="mono">.{f.ext}</td>
                  <td>{f.use}</td>
                  <td className="mono">{f.text ? "yes" : "wrap only"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <div className="card">
        <h2>Manufacturer namespaces</h2>
        <p className="lead">Vendor rows mint type 0x215 under a reserved NS so a Grainger # and a garage lot stay distinct but joinable by MPN / UNSPSC.</p>
        <table>
          <thead><tr><th>Vendor</th><th>NS</th><th>Feed you will actually get</th></tr></thead>
          <tbody>
            {Object.values(VENDORS).map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td className="mono">0x{v.ns.toString(16)}</td>
                <td className="meta">{v.id === "grainger" ? "CSV / XLSX contract book, Ariba CIF, cXML PunchOut, EDI 832/846 — no public product API" : "CSV / punchout / REST where they publish one"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
