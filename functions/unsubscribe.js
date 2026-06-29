// /unsubscribe — prefetch-safe unsubscribe for The DailyLocal.
//   GET  ?e=<email>  → a confirmation page (does NOT remove — email security scanners prefetch GET links,
//                       so removing on GET would unsubscribe people by accident)
//   POST ?e=<email>  → actually deletes the subscriber from KV (the confirm button, or a one-click client)

function page(title, msg, btnEmail) {
  const btn = btnEmail
    ? `<form method="POST" action="/unsubscribe?e=${encodeURIComponent(btnEmail)}">` +
      `<button class="btn" type="submit">Yes, unsubscribe</button></form>` +
      `<p class="muted">Changed your mind? <a href="https://localdiabetic.com">Stay with us →</a></p>`
    : `<p style="margin-top:18px"><a href="https://localdiabetic.com" style="color:#D99A2B;font-weight:700">localdiabetic.com</a></p>`;
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · The DailyLocal</title>` +
    `<style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#FBF7EF;` +
    `color:#2B2118;text-align:center;padding:64px 22px;line-height:1.6}.w{max-width:440px;margin:0 auto}` +
    `.bee{font-size:46px}h1{font-size:24px;margin:10px 0}p{color:#5b4f41}.muted{color:#8a7d6c;font-size:14px;margin-top:18px}` +
    `.btn{background:#F2B441;color:#1a1205;border:0;font-weight:800;padding:13px 28px;border-radius:12px;` +
    `font-size:16px;cursor:pointer;margin-top:20px}.btn:hover{background:#D99A2B}</style></head>` +
    `<body><div class="w"><div class="bee">🐝</div><h1>${title}</h1><p>${msg}</p>${btn}</div></body></html>`,
    { headers: { "Content-Type": "text/html" } });
}

export function onRequestGet({ request }) {
  const email = (new URL(request.url).searchParams.get("e") || "").toLowerCase().trim();
  if (!email) return page("Unsubscribe", "No email address was provided.", null);
  return page("Unsubscribe from The DailyLocal?",
    `This stops The DailyLocal emails to <b>${email}</b>.`, email);
}

export async function onRequestPost({ request, env }) {
  const email = (new URL(request.url).searchParams.get("e") || "").toLowerCase().trim();
  if (email && env.localdiabetics) {
    try { await env.localdiabetics.delete(`sub:${email}`); } catch (_) { /* idempotent */ }
  }
  return page("You're unsubscribed.",
    `${email || "You"} won't get The DailyLocal anymore. No hard feelings — take care of yourself. 🐝`, null);
}
