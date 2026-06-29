// POST /api/bee — the public "Try it / Ask Bee" chat.
// Bridges to the home diabetic-anchor-27B (on the 5090) through an auth-gated
// proxy exposed via Tailscale Funnel on the NAS. The shared secret lives only
// in CF env, so the funnel endpoint can't be used by anyone but this function.
// Env: BEE_URL (the funnel /api/bee URL), BEE_SECRET (Bearer token).
// Body: { message, history:[{role,content}] }  ->  { reply }
// Degrades to a calm fallback whenever the hive is unreachable or unconfigured.
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

const HIVE_DOWN = "I couldn't reach the hive just now — give me a moment and try again, or email build@localdiabetic.com and we'll help. 🐝";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!env.BEE_URL || !env.BEE_SECRET)
    return json({ reply: HIVE_DOWN, _dbg: { stage: "env", has_url: !!env.BEE_URL, has_secret: !!env.BEE_SECRET, url_host: (env.BEE_URL||"").split("/")[2]||null } });

  let b;
  try { b = await request.json(); } catch { return json({ error: "bad request" }, 400); }
  const message = (b.message || b.text || "").toString().slice(0, 4000).trim();
  if (!message) return json({ error: "empty" }, 400);
  const history = Array.isArray(b.history) ? b.history.slice(-6) : [];

  try {
    const r = await fetch(env.BEE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.BEE_SECRET },
      body: JSON.stringify({ message, history }),
      signal: AbortSignal.timeout(120000),
    });
    const d = await r.json().catch(() => ({}));
    const reply = d.reply || d.text || d.message || d.response;
    return json({ reply: reply || HIVE_DOWN, _dbg: { stage: "fetch", upstream: r.status, url_host: (env.BEE_URL||"").split("/")[2]||null, keys: Object.keys(d) } });
  } catch (e) {
    return json({ reply: HIVE_DOWN, _dbg: { stage: "catch", err: String(e), url_host: (env.BEE_URL||"").split("/")[2]||null } });
  }
}
