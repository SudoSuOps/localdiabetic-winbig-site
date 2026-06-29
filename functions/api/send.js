// POST /api/send — broadcast a DailyLocal issue to the KV subscriber list via Resend's FREE transactional
// tier (no Marketing plan needed). Protected by SEND_SECRET. Body: { secret, subject, html, text, dryRun, max }.
//   • dryRun:true  → returns the subscriber count + a sample, sends nothing (always check this first)
//   • max:N        → cap a send (the free tier allows ~100/day, 3,000/mo — batch large lists)
// Adds the required List-Unsubscribe header + a footer unsubscribe link to every email.

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

function unsubUrl(email) {
  return `https://localdiabetic.com/unsubscribe?e=${encodeURIComponent(email)}`;
}
function unsubHtml(email) {
  return `<hr style="border:0;border-top:1px solid #ece3d2;margin:22px 0">` +
    `<p style="font-size:12px;color:#9b8e7c">You're getting The DailyLocal because you signed up at ` +
    `localdiabetic.com. General support, not medical advice. <a href="${unsubUrl(email)}">Unsubscribe</a>.</p>`;
}
function unsubText(email) {
  return `\n\n—\nThe DailyLocal · localdiabetic.com · general support, not medical advice.` +
    `\nUnsubscribe: ${unsubUrl(email)}`;
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: "bad request" }, 400); }
  if (!env.SEND_SECRET || b.secret !== env.SEND_SECRET) return json({ error: "unauthorized" }, 401);
  if (!env.localdiabetics) return json({ error: "no list bound" }, 500);

  // collect the whole list (paginated)
  const emails = [];
  let cursor;
  do {
    const r = await env.localdiabetics.list({ prefix: "sub:", cursor });
    for (const k of r.keys) emails.push(k.name.slice(4));
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);

  if (b.dryRun) return json({ ok: true, subscribers: emails.length, sample: emails.slice(0, 5) });

  if (!env.RESEND_API_KEY) return json({ error: "no resend key" }, 500);
  const subject = String(b.subject || "").slice(0, 200);
  const html = String(b.html || "");
  const text = String(b.text || "");
  if (!subject || (!html && !text)) return json({ error: "need subject + html or text" }, 400);

  const targets = b.max ? emails.slice(0, b.max) : emails;
  const auth = { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" };
  let sent = 0, failed = 0;
  for (const email of targets) {
    const payload = {
      from: "Donovan · The DailyLocal <build@localdiabetic.com>",
      to: [email], reply_to: "build@localdiabetic.com", subject,
      headers: {
        "List-Unsubscribe": `<${unsubUrl(email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
    if (html) payload.html = html + unsubHtml(email);
    if (text) payload.text = text + unsubText(email);
    try {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: auth, body: JSON.stringify(payload) });
      r.ok ? sent++ : failed++;
    } catch (_) { failed++; }
  }
  return json({ ok: true, subscribers: emails.length, attempted: targets.length, sent, failed });
}

export const onRequestGet = () => json({ ok: true, endpoint: "send", hint: "POST {secret, subject, html, text, dryRun:true}" });
