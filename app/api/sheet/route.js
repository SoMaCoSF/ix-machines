export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("url") || "";
  if (!/^https:\/\/(docs\.google\.com|drive\.google\.com|raw\.githubusercontent\.com)\//i.test(url)) {
    return Response.json({ error: "url must be a published Google Sheet export or raw github csv" }, { status: 400 });
  }
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return Response.json({ error: `upstream ${res.status}` }, { status: 502 });
  const text = await res.text();
  return Response.json({ text, bytes: text.length });
}
