// Invoice Term is stored/transmitted as a numeric code (DB/backend contract);
// the UI always shows the text label. Keep every screen that displays or
// edits Invoice Term going through these helpers instead of hardcoding the
// mapping locally.
export const INVOICE_TERM_OPTIONS = [
  { value: 1, label: "Weekly" },
  { value: 2, label: "Biweekly" },
  { value: 3, label: "Monthly" },
  { value: 4, label: "Special" },
  { value: 5, label: "Semi-Monthly" },
  { value: 6, label: "Once in 4 Weeks" },
];

// Anchor day for Weekly/Biweekly/Once in 4 Weeks periods — a project-level
// setting (backend: com.bean.model.Project#weekStartDay, a
// java.time.DayOfWeek name string). Only meaningful for those three terms;
// Monthly/Semi-Monthly/Special ignore it entirely. Defaults to Monday
// everywhere a project hasn't explicitly configured it.
export const WEEK_START_DAY_OPTIONS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];
export const DEFAULT_WEEK_START_DAY = "MONDAY";

const DAY_NAME_TO_JS_DOW = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

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

const SEMI_MONTHLY_CODE = 5;
const FOUR_WEEKLY_CODE = 6;

const toISO = (utcDate) => utcDate.toISOString().split("T")[0];

// Snaps to the configured anchor day (default Monday) on or before the
// given UTC date.
const anchorDayOnOrBefore = (utcDate, weekStartDay) => {
  const targetDow = DAY_NAME_TO_JS_DOW[weekStartDay] ?? DAY_NAME_TO_JS_DOW[DEFAULT_WEEK_START_DAY];
  const dow = utcDate.getUTCDay(); // 0 = Sunday ... 6 = Saturday
  const diff = (dow - targetDow + 7) % 7; // days since the most recent anchor day
  const snapped = new Date(utcDate);
  snapped.setUTCDate(snapped.getUTCDate() - diff);
  return snapped;
};

const addDays = (utcDate, days) => {
  const shifted = new Date(utcDate);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
};

// Full invoice period (both Start and End Date) for a given picked Start
// Date + Invoice Term code — used wherever a mis-aligned picked date should
// snap back to the term's actual period boundary rather than just having an
// End Date computed from whatever was picked (see computeInvoiceEndDate,
// which never snaps Start Date and is kept as-is for existing callers):
//   Weekly / Biweekly / Once in 4 Weeks — snap to the project's configured
//     week-start day (weekStartDay, defaults to Monday) on or before the
//     picked date, then span 7 / 14 / 28 days from there.
//   Monthly — snap to the 1st of the picked date's month, end of that month.
//   Semi-Monthly — 1st-15th if picked on/before the 15th, else 16th-end.
//   Special (or unrecognized) — no snapping, no auto-calculated End Date.
export const computeInvoicePeriod = (startDateISO, code, weekStartDay = DEFAULT_WEEK_START_DAY) => {
  if (!startDateISO) return { startDate: null, endDate: null };
  const [year, month, day] = startDateISO.split("-").map(Number);
  const codeNum = Number(code);
  const picked = new Date(Date.UTC(year, month - 1, day));

  switch (codeNum) {
    case 1: { // Weekly
      const start = anchorDayOnOrBefore(picked, weekStartDay);
      return { startDate: toISO(start), endDate: toISO(addDays(start, 6)) };
    }
    case 2: { // Biweekly
      const start = anchorDayOnOrBefore(picked, weekStartDay);
      return { startDate: toISO(start), endDate: toISO(addDays(start, 13)) };
    }
    case MONTHLY_CODE: { // Monthly
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0));
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case SEMI_MONTHLY_CODE: { // Semi-Monthly: 1st-15th, 16th-end of month
      if (day <= 15) {
        const start = new Date(Date.UTC(year, month - 1, 1));
        const end = new Date(Date.UTC(year, month - 1, 15));
        return { startDate: toISO(start), endDate: toISO(end) };
      }
      const start = new Date(Date.UTC(year, month - 1, 16));
      const end = new Date(Date.UTC(year, month, 0));
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case FOUR_WEEKLY_CODE: { // Once in 4 Weeks
      const start = anchorDayOnOrBefore(picked, weekStartDay);
      return { startDate: toISO(start), endDate: toISO(addDays(start, 27)) };
    }
    default: // Special or unrecognized — no auto-calc
      return { startDate: startDateISO, endDate: null };
  }
};
