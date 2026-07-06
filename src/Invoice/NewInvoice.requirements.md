# NewInvoice.jsx — Requirements

Component: `src/Invoice/NewInvoice.jsx`
Purpose: "Add New Invoice" form used to create a single invoice record, linking an Employee, Vendor, and Project.

Each requirement below is numbered (`R1`, `R2`, ...) so test cases can reference them directly (e.g. `TC-R3-01`).

## 1. Data loading

- **R1.1** On mount, the form fetches Employees (`getEmployees`), Vendors (`getAllCustomers`), and Projects (`getProjects`) in parallel and shows a centered spinner until all three resolve.
- **R1.2** If any of the three fetches fail, an error modal ("Error fetching employees or vendors. Please try again later.") is shown and loading stops (form is *not* left stuck on the spinner).
- **R1.3** On mount, all form fields and selections are reset to blank/default (`handleAddNew`), even before data loads.

## 2. Employee selection

- **R2.1** Selecting an Employee sets `employeeId`/`employeeName` on the invoice.
- **R2.2** If the selected employee has **one or more** associated projects (`project.employeeId === employeeId`), the *latest* one (most recent `startDate`; if `startDate` is missing/tied, order is otherwise unspecified) is auto-filled — Project, Vendor, and Bill Rate all populate without further user action.
- **R2.3** When multiple projects match, the Project dropdown remains scoped to that same matching set (see R4.1), so the user can switch to any other project belonging to this employee — switching re-fills Vendor/Bill Rate from the newly picked project (see R4.2), it does not clear them.
- **R2.4** If the selected employee has **zero** associated projects, any previously selected Vendor, Project, and Bill Rate are cleared back to blank/0 (they are not left showing a stale, possibly-invalid combination).
- **R2.5** Changing the Employee always re-evaluates R2.2/R2.4 — i.e. switching from an employee with projects to a different employee re-runs the same auto-fill-latest-or-clear logic.

## 3. Vendor selection

- **R3.1** The Vendor dropdown only lists vendors associated with the currently selected employee's projects. If no employee is selected, all vendors are listed.
- **R3.2** Selecting a Vendor sets `vendorId`/`vendorName` on the invoice.
- **R3.3** If the selected Vendor, scoped to the currently selected Employee (if any), has **one or more** matching projects, the *latest* one (most recent `startDate`) is auto-filled — including its own Employee/Bill Rate. If an Employee was already selected, it is preserved/reconfirmed as part of this fill.
- **R3.4** When multiple projects match, the Project dropdown remains scoped to that same matching set, so the user can switch to any other matching project — switching re-fills Employee/Bill Rate from the newly picked project.
- **R3.5** If the Vendor has **zero** matching projects (given the current Employee scope, if any), no project is auto-selected and the current Project/Bill Rate are left as-is.

## 4. Project selection

- **R4.1** The Project dropdown only lists projects associated with the currently selected employee. If no employee is selected, all projects are listed.
- **R4.2** Selecting a Project auto-fills **all** of: Employee, Vendor, Project name, and Bill Rate — since a project record already carries its own `employeeId`/`employeeName`/`vendorId`/`vendorName`/`billRate`. This is true regardless of what was previously selected for Employee/Vendor (the project's own linkage wins).
- **R4.3** Bill Rate is taken directly from `project.billRate`; if the project has no bill rate, it defaults to `0`.
- **R4.4** Invoice Term is taken from `project.invoiceTerm` (see R9.0 for the code/label distinction); if the project has no invoice term, it defaults to unset (dropdown shows its placeholder).

## 5. Cross-field consistency

- **R5.1** At all times, after any of Employee/Vendor/Project changes, the three fields should represent a *mutually consistent* combination — i.e. it should never be possible to submit an invoice where the selected Vendor or Project doesn't actually belong to the selected Employee, when that data is known.
- **R5.2** When a selection (Employee or Vendor) has multiple matching projects, the system auto-picks the latest by `startDate` (R2.2, R3.3) rather than leaving fields blank — ambiguity is resolved with a sensible default, not by forcing the user to pick first. The user remains free to switch to any other matching project via the Project dropdown (R2.3, R3.4).

## 9. Invoice Term / End Date auto-calculation

- **R9.0** Invoice Term is a **coded enum**, not a day count: the backend/DB stores a numeric code — `1`=Weekly, `2`=Biweekly, `3`=Monthly, `4`=Special (confirmed live against `/api/v1/getProjects`, which only ever returns `"1"`/`"2"`/`"3"`/`"4"` for this field). The UI always shows/selects the text label via `Utils/invoiceTerm.js` (`INVOICE_TERM_OPTIONS`/`invoiceTermLabel`/`invoiceTermCode`); the code is what's stored in state and submitted to the backend. Invoice Term is rendered as a `<Select>` dropdown (not free text).
- **R9.1** Invoice Term is populated from the selected Project's own `invoiceTerm` field whenever Employee/Vendor/Project selection resolves a project (R2.2, R3.3, R4.2 — via `applyProjectSelection`), normalized from the backend's string code to a `Number` so it matches the dropdown's option values. It is also directly editable (re-selectable) by the user afterward.
- **R9.2** When Start Date is set, End Date is automatically populated per the Invoice Term (via `computeInvoiceEndDate`), and the user does not need to also set End Date manually:
  - **Weekly** (1) / **Biweekly** (2): flat `Start Date + 7 / 14 days` (`INVOICE_TERM_DAYS`).
  - **Monthly** (3): the **last calendar day of Start Date's month** (28–31, whatever that month actually has) — *not* a flat +30 days. E.g. Start Date `2026-02-15` → End Date `2026-02-28`.
- **R9.3** If the user changes Invoice Term *after* a Start Date is already set, End Date is recalculated from the current Start Date using the new term's rule above.
- **R9.4** If Invoice Term is unset when Start Date is set, End Date is left untouched (no calculation is attempted).
- **R9.5** Invoice Term = **Special** (code `4`) has no fixed day-equivalent by design — selecting it never auto-calculates End Date, regardless of Start Date. The user must set End Date manually for Special-term invoices.
- **R9.6** End Date remains directly editable/overridable by the user at any time regardless of the auto-calculation (no rule currently re-locks it after a manual edit).
- **R9.7** Setting Start Date also updates Invoice Month to that date's month/year (stored as the 1st of that month), keeping the two in sync.
- **R9.8** Setting Invoice Month also sets Start Date to the 1st of that month (subject to the R10.7/R10.8 range check below), then recomputes End Date per R9.2 (using whatever Invoice Term is currently set). A previously manually-set Start Date within a *different* month is overwritten; the last of Invoice Month/Start Date to be touched wins.

## 10. Start/End Date must stay within the selected project's date range

- **R10.1** Start Date cannot be set before the selected project's own `startDate`. Attempting to do so shows a warning modal ("Start Date cannot be before the project's start date (...)") and the change is rejected (not committed to state).
- **R10.2** Start Date cannot be set after the selected project's own `endDate` (if the project has one), for the same reason as R10.1.
- **R10.3** End Date cannot be set after the selected project's own `endDate`; rejected with a warning modal, same pattern as R10.1.
- **R10.4** End Date cannot be set before the selected project's own `startDate`; rejected with a warning modal, same pattern.
- **R10.5** The *auto-calculated* End Date (R9.2/R9.8) is **clamped** down to the project's `endDate` rather than rejected outright, if the calculation would otherwise land past it — e.g. a Weekly term started 3 days before the project ends would naturally compute 4 days past the project's end date; it's silently capped at the project's own end date instead of overshooting or throwing a warning (this is an automatic system action, not a direct user edit, so a rejection dialog isn't appropriate here).
- **R10.6** If no project is selected yet (or the selected project has no `startDate`/`endDate` on record), there is no range restriction on that side — Start/End Date can be set freely.
- **R10.7** Invoice Month is also subject to this check: the Start Date it *derives* (the 1st of the chosen month, R9.8) must fall within the project's range, exactly like picking Start Date directly (R10.1/R10.2) — rejected with a warning modal naming the actual boundary if not, and Invoice Month/Start Date/End Date are all left unchanged. **(Fixed — previously this case was silently clamped with no warning shown at all, which read as "the error isn't popping up"; see Known gaps.)**
  - **Exception**: if the project's own `startDate` falls partway through the *same* month being picked (e.g. project starts `2026-06-15` and the user picks June), the month is still allowed — Start Date clamps up to the project's actual start date (`2026-06-15`) instead of defaulting to the 1st and getting rejected for landing "before" it. A genuinely earlier month (e.g. May, for the same project) is still rejected.
- **R10.8** Once an Invoice Month is accepted (R10.7), End Date auto-calculates and is clamped per R10.5 exactly as it would be for a directly-set Start Date.
- **R10.9 (Fixed, high severity — "allowing to create invoice after project end").** Start/End Date already picked for one project were never revalidated when the user then switched Employee/Vendor/Project to a *different* project — R10.1–R10.8 only ever fire on direct edits to those fields, not on `applyProjectSelection` (the function behind R2.2/R3.3/R4.2 auto-fill). This meant a user could: set valid dates for Project X, then switch to Project Y (ending earlier), and submit with Project Y's ID but Project X's now-invalid dates — the actual reported bug. Fixed two ways:
  - `applyProjectSelection` now clamps any already-set Start/End Date into the *newly selected* project's own range (same clamp-not-reject treatment as R10.5, since switching projects is a broader context change, not a direct date edit).
  - `handleSubmit` now also re-validates Start/End Date against the project actually being submitted with, as a final defense-in-depth backstop, blocking submission with an error modal if they're somehow still out of range. This branch is intentionally not reachable through normal UI interaction now that the clamp above exists — it exists to catch any other path that might set dates without going through `applyProjectSelection`.
- Known limitation: after a rejection (R10.1–R10.4), react-datepicker's own internal display-text tracking on the input may still visually show the rejected value momentarily (it isn't a fully round-tripped controlled component) even though the underlying `generalDetails` state correctly was never updated. Don't write a test asserting the raw input `.value` immediately after a rejection — assert against a state-derived signal instead (e.g. that End Date's auto-calc never fired, or the actual submitted payload).

## 6. Required fields / submission

- **R6.1** Submit is blocked (error modal: "Please fill in all mandatory fields before submitting.") if any of the following are missing: Vendor, Invoice Id, Bill Rate, Invoice Month, Hours. (Note: Employee and Project are *not* checked here even though their `<Form.Item>`s are marked `required` — see Known Gaps.)
- **R6.2** On successful submit (`POST /addInvoices` returns HTTP 201), a success modal is shown, and on dismissal the form closes (`onClose`) and resets (`handleClear`).
- **R6.3** On submit failure (non-201 response or network error), an error modal is shown and the form data is preserved (not cleared).
- **R6.4** `total` is computed as `hours * billRate` immediately before submission.

## 7. Clear / Cancel

- **R7.1** Clicking **Clear** resets every field to its initial blank state: Employee, Vendor, Project (both the underlying data in `generalDetails` and the visible dropdown selections), Bill Rate, Hours, Invoice Id, Invoice Month, Start/End Date, and Total.
- **R7.2** Clicking **Cancel** shows a confirmation modal ("Are you sure you want to cancel?"); confirming closes the form (`onClose`) and clears it (same as R7.1); dismissing leaves the form untouched.

## 8. Field-level behavior

- **R8.1** Employee, Vendor, and Project dropdowns support type-to-search filtering on their visible label text (case-insensitive substring match).
- **R8.2** Invoice Month uses a month/year picker (`MM/yyyy` display) and stores an ISO date string.
- **R8.3** Start Date / End Date use a day picker (`yyyy-MM-dd` display) and are optional (no `required` rule).
- **R8.4** Bill Rate can also be edited manually via its input field after being auto-filled, and manual edits are not overwritten unless Employee/Vendor/Project selection changes again.

## 11. Date pickers display exactly what was selected

- **R11.1** Invoice Month, Start Date, and End Date each display exactly the value the user picked (or that was auto-derived/synced from another field) — no off-by-one day or month.

## Known gaps (flag, don't silently fix)

- **(Fixed, high severity — "select invoice month from date picker, showing previous month in box").** `react-datepicker`'s `selected` prop was fed the raw `"yyyy-MM-dd"` string stored in `generalDetails` directly. react-datepicker calls `new Date(selected)` internally for anything that isn't already a `Date` instance — parsing a bare date string as **UTC midnight**, then rendering it in **local** time. In any timezone behind UTC (confirmed against `America/Chicago`: `new Date("2026-07-01")` → `Jun 30 2026 19:00 local`), this silently displays the previous day for Start/End Date, or the previous **month** for the month/year picker (since day 30 of the prior month rolls the displayed month back). Fixed by adding a `parseLocalDate(iso)` helper (constructs the `Date` from local Y/M/D components, mirroring `toLocalISODate`'s reverse) and using it for all three `selected={...}` props **and** every `form.setFieldsValue({ startDate/endDate/invoiceMonth: ... })` call that syncs one date field from another — the latter turned out to matter just as much as the former, since `Form.Item`'s internal field store (once explicitly set) overrides the `selected` prop with whatever raw value it was given, bypassing `parseLocalDate` entirely if that call site still passed a bare string. Covered by R11.1–R11.4 in `NewInvoice.test.jsx`, including the specific "synced from a different field, not typed directly" path that originally surfaced the bug.
- **(Fixed)** Invoice Month's `onChange` derived a Start Date (1st of the chosen month) and silently **clamped** it to the project's `startDate` if too early — but never checked the *high* end against the project's `endDate` at all, and never showed any warning either way. Reported as "when invoice month selected error is not popping up." Fixed to reject (with the same warning-modal pattern as Start Date/End Date, R10.1–R10.4) rather than silently clamp — see R10.7/R10.8.
- **Vendor lockout for zero-project employees (found while writing tests, high severity).** `vendorsForEmployee` is derived strictly from `projectsForEmployee` (R3.1): `vendors.filter(v => projectsForEmployee.some(p => p.vendorId === v.customerId))`. When the selected employee has **zero** projects, `projectsForEmployee` is `[]`, so `vendorsForEmployee` is *also* `[]` — the Vendor dropdown renders "No data" with nothing selectable, for **any** vendor, not just ones tied to other employees. Since Vendor is a required field (R6.1) and there is no `allowClear`/free-text escape hatch, **an invoice can never be submitted for an employee with zero projects** — Submit will always fail the required-field check. Covered by the "finding" tests in `NewInvoice.test.jsx` (R3 and Known gaps sections). Confirm with product whether employees are expected to always have at least one project, or whether the Vendor dropdown should fall back to the full vendor list when the employee-scoped list is empty.
- Employee and Project `<Form.Item>` are marked `required`, but `handleSubmit`'s manual validation (R6.1) does not check `employeeId` or `projectId` — an invoice can currently be submitted with no Employee/Project selected as long as Vendor/Invoice Id/Bill Rate/Invoice Month/Hours are filled. Confirm whether this is intentional before writing a test that asserts submission is blocked without an Employee/Project.
- `handleEmployeeChange` reads `selectedEmployee?.Name` (capitalized) from the `employees` list, while the Employee dropdown itself renders `employee.name` (lowercase); confirmed live that the `/employees/getEmployees` API only returns lowercase `name`, so this line always sets `employeeName` to `undefined`. In practice this is **effectively unobservable today**: for any employee with 1+ projects it's immediately overwritten by `applyProjectSelection` (R2.2, which uses the project's own correctly-cased `employeeName`); for an employee with 0 projects, the Vendor lockout above blocks submission entirely before the bad value could ever reach the backend. Still worth fixing for correctness/future-proofing (e.g. if the Vendor lockout above gets fixed, this bug becomes live again), but no current UI path can prove it via an end-to-end/black-box test — it would need a unit-level test of `handleEmployeeChange` in isolation, or a code-level assertion.
- Every numeric field (`Invoice Id`, `Bill Rate`, `Hours`) is initialized to `0` in `generalDetails`/`initialGeneralDetails`, but because the `<Input>`s are wrapped in `<Form.Item name="...">` with no `initialValue` set on the Form, AntD's Form field store (which is unset) takes precedence over the manually-passed `value={generalDetails.x}` prop on first render — so these inputs display **empty**, not `"0"`, both on initial mount and after Clear/`form.resetFields()`. Not a functional bug (the underlying `generalDetails` state genuinely is `0`, and it submits correctly once the user types over it), but worth knowing so tests assert `""`/`null` rather than `"0"`/`0` for the visually-rendered value.
- **(Fixed, keep an eye out for regressions)** All three date pickers (Invoice Month, Start Date, End Date) originally extracted their ISO date string via `date.toISOString().split("T")[0]`. `react-datepicker` hands back Date objects representing a *local* calendar day, and `toISOString()` converts to UTC first — any local timezone behind UTC (e.g. `America/Chicago`, confirmed via testing) can silently shift the stored date by a day depending on the exact time-of-day baked into that Date object (which isn't always midnight — observed varying by up to an hour between calls for what was visually the same calendar day, likely internal keyboard-navigation/preSelection noise in the library). Fixed by reading local `getFullYear()/getMonth()/getDate()` instead (`toLocalISODate` helper) rather than converting through UTC. If any new date-picker field is added to this form, use `toLocalISODate`, not `toISOString()`.
- **(Fixed)** All three date pickers' `onChange` handlers called `toLocalISODate(date)`/`toISOString()` unconditionally, but `react-datepicker` fires `onChange(null)` when its input is fully cleared (e.g. user selects-all-and-deletes the text) — this threw `TypeError: Cannot read properties of null (reading 'getFullYear')` uncaught. Fixed by short-circuiting each handler to clear that field's state directly when `date` is falsy, before calling `toLocalISODate`.
- **Test-writing note:** driving `react-datepicker` inputs via `userEvent.type` char-by-char is unreliable for exact-date assertions — both a preceding `userEvent.clear()` (fires a real `onChange(null)`) and the intermediate partial-date parses while typing can produce spurious `onChange` calls, and `{enter}` specifically was observed to confirm the calendar's keyboard-focused day rather than strictly the just-typed text (off by a day). Prefer a single `fireEvent.change(input, { target: { value: text } })` + `fireEvent.blur(input)` to set the full value in one shot instead. Additionally, react-datepicker's own internal display-text tracking on the input isn't a fully reliable read of the underlying committed state after a *rejected* change (see R10 above) — assert against a state-derived signal (End Date's auto-calc, or the actual submitted payload) rather than the raw input `.value` in that case.
