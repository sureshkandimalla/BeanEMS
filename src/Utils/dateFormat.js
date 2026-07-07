// Renders a stored "yyyy-MM-dd" (or "yyyy-MM") invoice month as a full
// month name + year, e.g. "July 2026". Parses via local Y/M components
// rather than `new Date(isoString)` — the latter parses as UTC midnight,
// which renders as the *previous* month in any timezone behind UTC.
export const formatMonthYear = (isoDateString) => {
  if (!isoDateString) return "";
  const [year, month] = isoDateString.split("-").map(Number);
  if (!year || !month) return "";
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// Same UTC-parse pitfall as formatMonthYear, but for a full "yyyy-MM-dd"
// date — renders as e.g. "Apr 15, 2025". Parses via local Y/M/D components
// instead of `new Date(isoString)`.
export const formatDate = (isoDateString) => {
  const date = parseLocalDateSafe(isoDateString);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Parses a "yyyy-MM-dd"-prefixed string into a local-midnight Date (not a
// UTC one, unlike `new Date(isoString)`), for callers that need the actual
// Date object rather than just a formatted string (e.g. day-count math,
// custom formatting). Returns null for anything that isn't a valid date.
export const parseLocalDateSafe = (isoDateString) => {
  if (!isoDateString) return null;
  const [year, month, day] = String(isoDateString).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return isNaN(date) ? null : date;
};
