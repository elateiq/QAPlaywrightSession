// Orion Shop: the app under test for the course. Plain Node.js, no packages needed.
// Run:  node shop-app/server.js      then open port 3000.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const TODAY = process.env.SHOP_TODAY || "2026-10-29";          // fixed "today" so tests are repeatable
const BUGS = new Set((process.env.SHOP_BUGS || "min-cart,lowercase,late-badge").split(",").map(s => s.trim()));
const orders = JSON.parse(fs.readFileSync(path.join(__dirname, "orders.json"), "utf8"));

const RULES = { code: "SAVE10", rate: 0.10, cap: 200, minCart: 500, expires: "2026-12-31T23:59:00+05:30" };

function discount(cart, code, now) {
  const given = String(code || "").trim();
  const matches = BUGS.has("lowercase") ? given === RULES.code : given.toUpperCase() === RULES.code;
  if (!matches) return { ok: false, message: "This code is not valid." };
  if (new Date(now || Date.parse(TODAY + "T12:00:00+05:30")) > new Date(RULES.expires)) return { ok: false, message: "This code has expired." };
  const below = BUGS.has("min-cart") ? cart <= RULES.minCart : cart < RULES.minCart;
  if (below) return { ok: false, message: `Add items worth Rs ${RULES.minCart} or more to use this code.` };
  const cap = BUGS.has("cap") ? 250 : RULES.cap;
  const amount = Math.min(Math.round(cart * RULES.rate * 100) / 100, cap);
  return { ok: true, discount: amount, total: Math.round((cart - amount) * 100) / 100, message: `Code applied: Rs ${amount} off.` };
}

function isLate(o) {
  if (BUGS.has("late-badge")) return TODAY > o.promised;                       // forgets delivered orders
  if (o.status === "Delivered") return o.delivered > o.promised;
  return TODAY > o.promised;
}

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise(resolve => { let d = ""; req.on("data", c => (d += c)); req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } }); });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const m = url.pathname.match(/^\/api\/orders\/(ORD-\d+)(\/cancel)?$/);
  if (req.method === "GET" && url.pathname === "/api/orders") return send(res, 200, orders.map(o => ({ ...o, late: isLate(o) })));
  if (m && req.method === "GET" && !m[2]) {
    const o = orders.find(x => x.id === m[1]);
    return o ? send(res, 200, { ...o, late: isLate(o) }) : send(res, 404, { error: "Order not found" });
  }
  if (m && req.method === "POST" && m[2]) {
    const o = orders.find(x => x.id === m[1]);
    if (!o) return send(res, 404, { error: "Order not found" });
    if (["Shipped", "Out for delivery", "Delivered"].includes(o.status)) return send(res, 409, { error: "This order can no longer be cancelled." });
    o.status = "Cancelled";
    return send(res, 200, { ...o, late: false });
  }
  if (req.method === "POST" && url.pathname === "/api/discount") {
    const b = await readBody(req);
    return send(res, 200, discount(Number(b.cart), b.code));
  }
  if (req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { ok: true, bugs: [...BUGS] });
  const file = url.pathname === "/" ? "index.html" : url.pathname === "/cart" ? "cart.html" : url.pathname.slice(1);
  const full = path.join(__dirname, "public", path.normalize(file).replace(/^(\.\.[\/\\])+/, ""));
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    const type = full.endsWith(".html") ? "text/html" : full.endsWith(".css") ? "text/css" : "application/javascript";
    return send(res, 200, fs.readFileSync(full), type);
  }
  send(res, 404, { error: "Not found" });
});

if (require.main === module) server.listen(PORT, () => console.log(`Orion Shop on http://localhost:${PORT}  (bugs: ${[...BUGS].join(", ")})`));
module.exports = { server, discount, isLate };
