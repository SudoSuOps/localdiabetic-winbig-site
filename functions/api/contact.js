// Cloudflare Pages Function — POST /api/contact -> sends an email via Resend.
// Requires env var RESEND_API_KEY (set in the Pages project settings).
// Member front door: a real person reaching out for help. Goes to build@localdiabetic.com,
// submitter as reply-to so we can answer like neighbors.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

const clean = (v, n) => String(v ?? "").trim().slice(0, n);
const looksEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ error: "bad request" }, 400); }

  const name = clean(data.name, 120);
  const email = clean(data.email, 160);
  const forwho = clean(data.topic, 80) || "Myself";
  const message = clean(data.message, 4000);
  if (data.company) return json({ ok: true });            // honeypot
  if (!looksEmail(email) || message.length < 2) return json({ error: "Please add a valid email and a short note." }, 400);
  if (!env.RESEND_API_KEY) return json({ error: "We can't take messages just yet — email build@localdiabetic.com." }, 500);

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "LocalDiabetic <build@localdiabetic.com>",
      to: ["build@localdiabetic.com"],
      reply_to: email,
      subject: `[LocalDiabetic] New member — ${name || email} (for: ${forwho})`,
      text: `Someone reached out from localdiabetic.com\n\nName: ${name}\nEmail: ${email}\nThis is for: ${forwho}\n\n${message}`,
    }),
  });
  if (!r.ok) return json({ error: "Something hiccuped — please email build@localdiabetic.com and we'll answer.", detail: (await r.text()).slice(0, 200) }, 502);
  return json({ ok: true });
}

export const onRequestGet = () => json({ ok: true, endpoint: "contact" });

// Preflight / method probe — the form POSTs same-origin (no preflight needed),
// but answer OPTIONS cleanly for robustness and any future cross-origin use.
export function onRequestOptions() {
  return new Response(null, { status: 204, headers: {
    "Allow": "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }});
}
