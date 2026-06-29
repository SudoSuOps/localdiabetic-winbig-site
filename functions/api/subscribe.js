// Cloudflare Pages Function — POST /api/subscribe -> The DailyLocal newsletter signup.
// Reuses RESEND_API_KEY (same as the contact form). On signup: (1) optionally add to a managed Resend
// audience (RESEND_AUDIENCE_ID), (2) send the new subscriber the welcome email, (3) notify build@ so no
// signup is ever lost. Returns ok if the welcome OR the notification went through.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

const clean = (v, n) => String(v ?? "").trim().slice(0, n);
const looksEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

const WELCOME_TEXT = `Hey fren,

Welcome to The DailyLocal.

LocalDiabetic is being built for real life — not as another health app, not as another dashboard, and not as another noisy AI tool.

The idea is simple:

A trusted local helper for diabetics and caregivers.

A place for reminders, records, models, resources, small wins, and practical support — built around privacy, usefulness, and everyday life.

We're starting small:

  • OpenDiabetic models
  • LocalDiabetic tools
  • simple signup updates
  • real-world diabetic support
  • local-first thinking
  • the foundation for a trusted diabetic node

No noise. No hype. Just useful progress.

Thanks for being early.

— Donovan
Type 1 Diabetic · building LocalDiabetic one day at a time

—
You're getting this because you signed up at localdiabetic.com. This is general support, not medical advice. Reply anytime to unsubscribe.`;

const WELCOME_HTML = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:540px;margin:0 auto;color:#2B2118;line-height:1.65;font-size:16px">
  <p style="font-size:22px;font-weight:800;color:#D99A2B;margin:0 0 14px">🐝 The DailyLocal</p>
  <p>Hey fren,</p>
  <p>Welcome to The DailyLocal.</p>
  <p>LocalDiabetic is being built for real life — not as another health app, not as another dashboard, and not as another noisy AI tool.</p>
  <p>The idea is simple:</p>
  <p style="font-weight:700">A trusted local helper for diabetics and caregivers.</p>
  <p>A place for reminders, records, models, resources, small wins, and practical support — built around privacy, usefulness, and everyday life.</p>
  <p>We're starting small:</p>
  <ul style="padding-left:20px;margin:6px 0 14px">
    <li>OpenDiabetic models</li>
    <li>LocalDiabetic tools</li>
    <li>simple signup updates</li>
    <li>real-world diabetic support</li>
    <li>local-first thinking</li>
    <li>the foundation for a trusted diabetic node</li>
  </ul>
  <p>No noise. No hype. Just useful progress.</p>
  <p>Thanks for being early.</p>
  <p>— Donovan<br><span style="color:#6b5e4f">Type 1 Diabetic · building LocalDiabetic one day at a time</span></p>
  <hr style="border:0;border-top:1px solid #ece3d2;margin:22px 0">
  <p style="font-size:12px;color:#9b8e7c">You're getting this because you signed up at localdiabetic.com. General support, not medical advice. Reply anytime to unsubscribe.</p>
</div>`;

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ error: "bad request" }, 400); }
  if (data.company) return json({ ok: true });               // honeypot
  const email = clean(data.email, 160);
  if (!looksEmail(email)) return json({ error: "Please enter a valid email." }, 400);

  // store the subscriber in OUR own list — Cloudflare KV (free, sovereign; no Resend Marketing plan needed)
  if (env.localdiabetics) {
    try {
      await env.localdiabetics.put(`sub:${email.toLowerCase()}`,
        JSON.stringify({ email, date: new Date().toISOString(), source: "localdiabetic.com" }));
    } catch (_) { /* the build@ notification below still captures it */ }
  }
  if (!env.RESEND_API_KEY) return json({ error: "Signups are paused — email build@localdiabetic.com to join." }, 500);

  const auth = { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" };

  // 1. add to the managed audience if one is configured (best-effort; never blocks the signup)
  if (env.RESEND_AUDIENCE_ID) {
    try {
      await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
        method: "POST", headers: auth, body: JSON.stringify({ email, unsubscribed: false }),
      });
    } catch (_) { /* continue */ }
  }

  // 2. send the welcome email to the new subscriber
  const welcome = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: auth,
    body: JSON.stringify({
      from: "Donovan · The DailyLocal <build@localdiabetic.com>",
      to: [email],
      reply_to: "build@localdiabetic.com",
      subject: "Welcome to The DailyLocal 🐝",
      text: WELCOME_TEXT,
      html: WELCOME_HTML,
    }),
  }).catch(() => null);

  // 3. notify build@ so the list is captured even before an audience is set up
  const notify = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: auth,
    body: JSON.stringify({
      from: "The DailyLocal <build@localdiabetic.com>",
      to: ["build@localdiabetic.com"],
      reply_to: email,
      subject: `[The DailyLocal] New subscriber — ${email}`,
      text: `New DailyLocal signup from localdiabetic.com\n\nEmail: ${email}\n\nWelcome email ${welcome && welcome.ok ? "sent ✓" : "FAILED — send manually"}.`,
    }),
  }).catch(() => null);

  if ((welcome && welcome.ok) || (notify && notify.ok)) return json({ ok: true });
  return json({ error: "Couldn't sign you up just now — please email build@localdiabetic.com." }, 502);
}

export const onRequestGet = () => json({ ok: true, endpoint: "subscribe" });

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: {
    "Allow": "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }});
}
