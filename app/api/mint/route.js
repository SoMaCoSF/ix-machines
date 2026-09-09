import { NextResponse } from "next/server";
import { mint, parse, TYPE, IX_NS } from "../../../lib/gyst";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "part";
  const code = TYPE[type] ?? TYPE.part;
  const id = mint(code, IX_NS);
  return NextResponse.json({ ok: true, identity: id, spec: "GYST UUIDv8 v0.2.0", ns: "0x1A1" });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (body.uuid) {
    try { return NextResponse.json({ ok: true, identity: parse(body.uuid) }); }
    catch (e) { return NextResponse.json({ ok: false, error: String(e.message) }, { status: 400 }); }
  }
  const type = body.type || "part";
  return NextResponse.json({ ok: true, identity: mint(TYPE[type] ?? TYPE.part, IX_NS, body.entropy) });
}
