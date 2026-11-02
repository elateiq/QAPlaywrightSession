const STEPS = ["Placed", "Packed", "Shipped", "Out for delivery", "Delivered"];
const $ = id => document.getElementById(id);

async function show(id) {
  $("message").textContent = "";
  const r = await fetch(`/api/orders/${encodeURIComponent(id.trim().toUpperCase())}`);
  if (!r.ok) { $("result").hidden = true; $("message").textContent = "We could not find that order. Check the number and try again."; $("message").className = "error"; return; }
  const o = await r.json();
  $("result").hidden = false;
  $("order-title").textContent = `Order ${o.id}`;
  $("status").textContent = o.status;
  $("late").hidden = !o.late;
  const at = STEPS.indexOf(o.status);
  $("steps").innerHTML = STEPS.map((s, i) => `<li class="${i <= at ? "done" : ""}">${s}</li>`).join("");
  $("promised").textContent = o.status === "Delivered" ? `Delivered on ${o.delivered}` : `Promised by ${o.promised}`;
  if (o.courier && ["Shipped", "Out for delivery"].includes(o.status)) {
    $("courier").hidden = false;
    $("courier").innerHTML = `Courier: ${o.courier}, tracking number <a href="#" id="tracking">${o.tracking}</a>`;
  } else { $("courier").hidden = true; }
  $("cancel").hidden = ["Shipped", "Out for delivery", "Delivered", "Cancelled"].includes(o.status);
  $("cancel").dataset.id = o.id;
}

$("track").addEventListener("submit", e => { e.preventDefault(); show($("order-id").value); });
$("cancel").addEventListener("click", async () => {
  const r = await fetch(`/api/orders/${$("cancel").dataset.id}/cancel`, { method: "POST" });
  const b = await r.json();
  if (r.ok) await show(b.id);
  $("message").className = r.ok ? "" : "error";
  $("message").textContent = r.ok ? "Your order is cancelled." : b.error;
});
