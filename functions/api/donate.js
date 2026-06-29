// POST /api/donate — create a Stripe Checkout Session for a "pay it forward" donation.
// Body: { cents: <int> }  (preset 1500/3500/7500 or custom 500..500000)
// No Printful fulfillment — metadata.kind=donation; the webhook just records a grateful receipt.
// Needs env.STRIPE_SECRET_KEY. Returns { url } -> client redirects to Stripe.
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "donations not configured" }, 500);
  let b;
  try { b = await request.json(); } catch { return json({ error: "bad request" }, 400); }

  // server-side amount validation — never trust the client blindly
  let cents = parseInt(b.cents, 10) || 0;
  if (!Number.isFinite(cents)) return json({ error: "bad amount" }, 400);
  cents = Math.round(cents);
  if (cents < 500) cents = 500;          // $5 minimum
  if (cents > 500000) cents = 500000;    // $5,000 cap per gift

  const origin = new URL(request.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("submit_type", "donate");
  form.set("success_url", origin + "/give?thanks=1&session_id={CHECKOUT_SESSION_ID}");
  form.set("cancel_url", origin + "/give?canceled=1");
  form.set("billing_address_collection", "auto");
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(cents));
  form.set("line_items[0][price_data][product_data][name]", "LocalDiabetic — Pay it forward");
  form.set("line_items[0][price_data][product_data][description]",
           "Ships free daily-life devices to LocalDiabetic members. Thank you. 🐝");
  form.set("metadata[kind]", "donation");
  form.set("metadata[cents]", String(cents));

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data.error?.message || "stripe error" }, 502);
  return json({ url: data.url });
}
