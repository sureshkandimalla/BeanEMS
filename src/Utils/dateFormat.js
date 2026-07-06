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
