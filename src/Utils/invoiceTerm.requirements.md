# invoiceTerm.js — Requirements

Module: `src/Utils/invoiceTerm.js`
Purpose: single source of truth for the Invoice Term coded enum — the dropdown options, code↔label conversion, and the date math that derives an invoice period's Start/End Date from the term. Consumed by `NewInvoice.jsx`, `Invoice/GenerateInvoiceDetails.jsx`, `OnBoardingComponent/ProjectOnBoarding.jsx`, `Project/ProjectsList.jsx`, `Project/ProjectGrid.jsx`.

Backend contract: `invoiceTerm` is stored as a **String** (`com.bean.model.Project#invoiceTerm`, `com.bean.domain.Project#invoiceTerm`) holding one of the numeric codes below. Every screen that displays or edits it must go through this module rather than hardcoding the mapping.

## 1. Term codes

- **R1.1** `INVOICE_TERM_OPTIONS` is the canonical list:
  | Code | Label |
  |---|---|
  | `1` | Weekly |
  | `2` | Biweekly |
  | `3` | Monthly |
  | `4` | Special |
  | `5` | Semi-Monthly |
  | `6` | Once in 4 Weeks |
- **R1.2** `invoiceTermLabel(code)` / `invoiceTermCode(label)` convert between the stored code and the displayed label; an unrecognized code round-trips as its own string rather than throwing.

## 2. computeInvoicePeriod — snap-and-compute (current, used by Generate Invoice + should be used by any new date-driven Invoice Term UI)

`computeInvoicePeriod(startDateISO, code) -> { startDate, endDate }` — given a **picked** Start Date, returns the period's *actual* Start and End Date for the given term, snapping the picked date to the correct period boundary first. All computed in UTC (`Date.UTC(...)`) to avoid local-timezone day-shift bugs, same rationale as `NewInvoice.jsx`'s `toLocalISODate` (see that doc's Known Gaps).

- **R2.1 Weekly (`1`)**: snaps to the Monday on/before the picked date; End Date = that Monday + 6 days (Sunday). A period is always exactly Monday→Sunday regardless of which day of the week was picked.
- **R2.2 Biweekly (`2`)**: same Monday-snap as R2.1; End Date = Monday + 13 days (Sunday of the *following* week). Anchored to Monday, not to any prior invoice's period — picking any date in either of the two weeks produces the same 14-day span starting that Monday.
- **R2.3 Monthly (`3`)**: snaps to the 1st of the picked date's month; End Date = the last calendar day of that month (28–31, not a flat +30 days).
- **R2.4 Semi-Monthly (`5`)**: if the picked day-of-month is ≤ 15, the period is the 1st–15th; if ≥ 16, the period is the 16th–end-of-month. (E.g. picking the 20th snaps Start Date back to the 16th, not forward.)
- **R2.5 Once in 4 Weeks (`6`)**: same Monday-snap as R2.1; End Date = Monday + 27 days (Sunday, 4 weeks later).
- **R2.6 Special (`4`) / unrecognized code**: no snapping and no End Date calculation — `{ startDate: startDateISO, endDate: null }` (Start Date passes through unchanged).
- **R2.7** `computeInvoicePeriod(null | "", code)` returns `{ startDate: null, endDate: null }` for any code (no picked date to compute from).

## 3. computeInvoiceEndDate — legacy, flat-offset variant (kept for `NewInvoice.jsx` backward compatibility)

`computeInvoiceEndDate(startDateISO, code) -> endDateISO | null` — the original helper, predating R2. Deliberately **does not snap** Start Date; it computes End Date from the *exact* date given.

- **R3.1 Monthly (`3`)**: last calendar day of the given Start Date's month (same rule as R2.3, since Monthly has no meaningful "wrong day" to snap from — the 1st isn't required by this function).
- **R3.2 Weekly (`1`) / Biweekly (`2`)**: flat `Start Date + 7 / 14 days` via `INVOICE_TERM_DAYS` — *not* Monday-Sunday aligned. A Weekly period started on a Wednesday ends the *following* Wednesday, not the preceding Sunday.
- **R3.3 Special (`4`), Semi-Monthly (`5`), Once in 4 Weeks (`6`), or unrecognized**: `INVOICE_TERM_DAYS` has no entry for these, so `invoiceTermDays(code)` returns `null` and the function returns `null` (no auto-calc) — same externally-observable behavior as "Special" always had. `5`/`6` are intentionally *not* wired into this legacy function; only `computeInvoicePeriod` (R2) supports them.
- **R3.4** This function is the one `NewInvoice.jsx` calls (see `NewInvoice.requirements.md` R9.2) — that screen's Weekly/Biweekly auto-calc is a flat day-offset, not calendar-week-aligned, and is unaffected by the R2 snapping rules above.

## Known gaps

- `computeInvoiceEndDate` and `computeInvoicePeriod` intentionally disagree on Weekly/Biweekly semantics (flat offset vs. Monday-Sunday snap) — this is a deliberate compatibility split, not an oversight, made when `computeInvoicePeriod` was introduced so `NewInvoice.jsx`'s existing behavior wouldn't silently change. If `NewInvoice.jsx` is ever revisited to also want calendar-aligned weeks, switch it to `computeInvoicePeriod` and update `NewInvoice.requirements.md` R9.2 accordingly — don't add a third variant.
- Neither function currently re-validates the *snapped* Start Date against a project's own date-range bounds (that clamping happens one layer up, in the caller — see `GenerateInvoiceDetails.requirements.md` R-Start-Date). A term whose snap pulls Start Date to *before* the project's actual start (e.g. a project starting mid-week, Weekly term) is accepted as-is by this module; only the *End Date* gets clamped by callers today.
