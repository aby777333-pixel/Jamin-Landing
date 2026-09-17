import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

/**
 * 🚨 ON-DEMAND REFRESH FROM THE ADMIN CONSOLE (2026-09-17, layout engine brief:
 * "implement appropriate cache invalidation … so published changes appear
 * consistently on both platforms").
 *
 * The app already hears property UPDATEs over realtime. The website is
 * statically generated with an hourly window, so without this a published
 * layout or a plot marked sold could take up to an hour to reach it. The
 * console calls this after a publish or a plot save; the next visit to the
 * property page regenerates it.
 *
 * ⚠️ NO SHARED SECRET — THE CALLER PROVES WHO THEY ARE. admin.html is a static
 * page, so any secret embedded in it would be public. Instead the console sends
 * its own Supabase session token, and this route asks the database, AS THAT
 * USER, whether they are a super admin (`is_super_admin()` reads auth.uid()).
 * Anyone else gets a 403 and nothing is invalidated.
 *
 * ⚠️ It only ever MARKS paths stale — it writes nothing and returns nothing
 * private. The worst an abuser with an admin token could do is make pages
 * regenerate sooner.
 */

const ALLOWED_ORIGINS = [
  "https://merry-begonia-4c3cd1.netlify.app",
  "https://jaminbazaar.in",
  "https://www.jaminbazaar.in",
  "http://localhost:8081",
  "http://localhost:4173",
];

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cors(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const headers = cors(request.headers.get("origin"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!url || !key || !token) {
    return Response.json({ ok: false, error: "unauthorised" }, { status: 401, headers });
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: isAdmin, error } = await sb.rpc("is_super_admin");
  if (error || isAdmin !== true) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403, headers });
  }

  let body: { slug?: unknown; id?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* an empty body just refreshes the listings */
  }
  const clean = (v: unknown) =>
    typeof v === "string" && /^[a-z0-9-]{1,120}$/i.test(v) ? v : null;
  const slug = clean(body.slug);
  const id = clean(body.id);

  const paths = ["/", "/properties", "/projects"];
  if (slug) paths.push(`/property/${slug}`);
  if (id) paths.push(`/property/${id}`);
  for (const p of paths) revalidatePath(p);

  return Response.json({ ok: true, revalidated: paths }, { headers });
}
