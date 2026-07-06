// Invoice Term is stored/transmitted as a numeric code (DB/backend contract);
// the UI always shows the text label. Keep every screen that displays or
// edits Invoice Term going through these helpers instead of hardcoding the
// mapping locally.
export const INVOICE_TERM_OPTIONS = [
  { value: 1, label: "Weekly" },
  { value: 2, label: "Biweekly" },
  { value: 3, label: "Monthly" },
  { value: 4, label: "Special" },
];

// Fixed day-equivalents for terms with a flat cadence — used only to
// auto-calculate an End Date from a Start Date. Monthly is handled specially
// (see computeInvoiceEndDate: it always lands on the end of the month, not a
// flat +30 days). "Special" has no fixed length at all, so it's intentionally
// omitted (callers should treat a missing entry as "don't auto-calculate").
export const INVOICE_TERM_DAYS = { 1: 7, 2: 14 };

const MONTHLY_CODE = 3;

const CODE_TO_LABEL = Object.fromEntries(
  INVOICE_TERM_OPTIONS.map((o) => [String(o.value), o.label]),
);
const LABEL_TO_CODE = Object.fromEntries(
  INVOICE_TERM_OPTIONS.map((o) => [o.label, o.value]),
);

export const invoiceTermLabel = (code) => {
  if (code === null || code === undefined || code === "") return "";
  return CODE_TO_LABEL[String(code)] ?? String(code);
};

export const invoiceTermCode = (label) => LABEL_TO_CODE[label] ?? null;

export const invoiceTermDays = (code) => {
  if (code === null || code === undefined || code === "") return null;
  return INVOICE_TERM_DAYS[String(code)] ?? null;
};

// End Date for a given Start Date + Invoice Term code. Weekly/Biweekly are a
// flat day offset; Monthly always lands on the last calendar day of the
// Start Date's month (28-31, whatever that month actually has) rather than a
// flat +30 days; Special (and any unrecognized code) yields no auto-calc.
// Computed entirely in UTC to avoid local-timezone day-shift bugs — see
// NewInvoice.requirements.md Known gaps.
export const computeInvoiceEndDate = (startDateISO, code) => {
  if (!startDateISO) return null;
  const [year, month, day] = startDateISO.split("-").map(Number);

  if (Number(code) === MONTHLY_CODE) {
    // Date.UTC(year, month, 0) — month here is already 1-based (e.g. 7 for
    // July), so as the 0-based monthIndex it points at August; day 0 rolls
    // back to the last day of July.
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0));
    return lastDayOfMonth.toISOString().split("T")[0];
  }

  const days = invoiceTermDays(code);
  if (!days) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
};
