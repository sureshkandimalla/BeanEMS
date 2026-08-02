// Shared time-range filter for the global chart widgets (src/Charts/globalChartRegistry.jsx)
// — mirrors QuickBooks' per-card range dropdown. Kept to ranges this app can compute
// honestly from a calendar (no configured fiscal-year-start anywhere in the app), rather
// than faking a "fiscal quarter" concept that doesn't actually exist here.

export const TIME_RANGE_OPTIONS = [
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisQuarter", label: "This quarter" },
  { value: "last8months", label: "Last 8 months" },
  { value: "thisYear", label: "This year" },
  { value: "allTime", label: "All time" },
];

// Default view for every global chart widget — a rolling 8-month window —
// until the user explicitly picks a different option from its RangeHeader
// dropdown (src/Charts/globalChartRegistry.jsx).
export const DEFAULT_TIME_RANGE = "last8months";

// Returns { start: Date|null, end: Date|null } — null on either side means
// unbounded (allTime is {start:null, end:null}).
export const getRangeBounds = (value) => {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (value) {
    case "last30": {
      const start = startOfDay(now);
      start.setDate(start.getDate() - 30);
      return { start, end: endOfToday };
    }
    case "thisMonth":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfToday };
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "thisQuarter": {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      return { start: new Date(now.getFullYear(), quarterStartMonth, 1), end: endOfToday };
    }
    case "last8months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 7, 1);
      return { start, end: endOfToday };
    }
    case "thisYear":
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday };
    case "allTime":
    default:
      return { start: null, end: null };
  }
};

// isoDateString: "yyyy-MM-dd" or "yyyy-MM" (month-only values are treated as
// the 1st of that month — fine for range membership checks). Parsed via
// local Y/M/D components, same UTC-off-by-one avoidance used throughout the
// app (see src/Utils/dateFormat.js).
export const isDateInRange = (isoDateString, { start, end }) => {
  if (!isoDateString) return false;
  const [year, month, day] = isoDateString.split("-").map(Number);
  if (!year || !month) return false;
  const date = new Date(year, month - 1, day || 1);
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};
