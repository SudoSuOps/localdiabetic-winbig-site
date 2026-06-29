// POST /api/checkout — create a Stripe Checkout Session for a chosen Printful variant.
// Body: { vid: <printful sync_variant_id>, qty?: 1 }
// Price + name are looked up server-side from /assets/shop-data.json (no client price trust).
// Needs env.STRIPE_SECRET_KEY. Returns { url } -> client redirects to Stripe.
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

const SHIP_COUNTRIES = ["US","CA","GB","AU","IE","NZ","DE","FR","ES","IT","NL","SE","NO","DK","FI","PT","BE","AT","CH","PL"];

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "checkout not configured" }, 500);
  let b;
  try { b = await request.json(); } catch { return json({ error: "bad request" }, 400); }
  const vid = String(b.vid || "");
  const qty = Math.min(Math.max(parseInt(b.qty || 1, 10) || 1, 1), 10);
  if (!vid) return json({ error: "missing vid" }, 400);

  // authoritative price/name from the deployed shop data
  let data;
  try {
    const r = await fetch(new URL("/assets/shop-data.json", request.url).toString(), { cf: { cacheTtl: 60 } });
    data = await r.json();
  } catch { return json({ error: "catalog unavailable" }, 502); }
  let item, variant;
  for (const it of data.items || []) {
    const v = (it.variants || []).find(x => String(x.vid) === vid);
    if (v) { item = it; variant = v; break; }
  }
  if (!variant) return json({ error: "variant not found" }, 404);

  const origin = new URL(request.url).origin;
  const name = item.name.replace("LocalDiabetic ", "").split(" — ")[0] + " · " + variant.label;
  const img = item.img ? origin + "/" + item.img : "";

  // Stripe REST (form-encoded) — no SDK needed in Pages Functions
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", origin + "/shop?ok=1&session_id={CHECKOUT_SESSION_ID}");
  form.set("cancel_url", origin + "/shop?canceled=1");
  form.set("submit_type", "pay");
  form.set("phone_number_collection[enabled]", "true");
  form.set("billing_address_collection", "auto");
  SHIP_COUNTRIES.forEach((c, i) => form.set(`shipping_address_collection[allowed_countries][${i}]`, c));
  form.set("line_items[0][quantity]", String(qty));
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(variant.cents));
  form.set("line_items[0][price_data][product_data][name]", name);
  if (img) form.set("line_items[0][price_data][product_data][images][0]", img);
  // carried to the webhook for fulfillment
  form.set("metadata[pf_variant]", vid);
  form.set("metadata[qty]", String(qty));
  form.set("metadata[product]", item.name.slice(0, 120));

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const session = await res.json();
  if (!res.ok) return json({ error: session.error?.message || "stripe error" }, 502);
  return json({ url: session.url });
}
