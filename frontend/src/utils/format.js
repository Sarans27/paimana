// src/utils/format.js
// Display formatters — one implementation per value so the map,
// cards, modal, and detail pages render identical text.

/** Budget in ₹ Cr, collapsing to ₹ Bn above 10,000 Cr. */
export function formatBudgetCr(crores) {
  const n = Number(crores);
  if (!Number.isFinite(n)) return "—";
  if (n >= 10000) {
    return `₹${(n / 100).toFixed(0)} Bn (₹${n.toLocaleString("en-IN")} Cr)`;
  }
  return `₹${n.toLocaleString("en-IN")} Cr`;
}

/** ISO date → Indian display date ("15 Mar 2023"); passes through garbage. */
export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
