# GenerateInvoiceDetails.jsx — Requirements

Component: `src/Invoice/GenerateInvoiceDetails.jsx`
Purpose: grid of auto-generated, per-period invoice-candidate rows for a project or employee (one row per invoice period — month/week/etc., see `invoiceTerm.requirements.md`), editable and saveable back as real Invoice records via `POST /addInvoices`.

## 1. Entry points / embedding

- **R1.1** Reachable two ways: (a) as the standalone route `/generateInvoice`, reading `{ url, month }` from React Router `location.state` (legacy path, still used when nothing else provides props); (b) embedded inline inside `Invoice/InvoiceDetails.jsx` (e.g. the employeeFullDetails "INVOICES" tab), which passes `url`/`month`/`onBack` directly as **props**. Props take precedence over `location.state` when both are present (`propUrl ?? stateUrl`).
- **R1.2** When embedded via props (`onBack` provided), the toolbar shows **Back** and **Cancel** buttons, both wired to the same `onBack` callback — clicking either returns to the caller's view without navigating the browser URL (confirmed: URL stays on the host page, e.g. `/employeeFullDetails`, throughout the whole generate-invoice flow).
- **R1.3** `InvoiceDetails.jsx`'s "Generate Invoice" button, when it has an `employeeId` (i.e. embedded contexts), sets local state to render `GenerateInvoiceDetails` in place of the invoice list grid instead of calling `navigate("/generateInvoice", ...)`. The non-`employeeId` path (a generic/bulk, month-driven Invoice Date picker flow) is unchanged and still navigates.
- **R1.4** `onBack` also triggers `fetchData()` on the caller's invoice list (`InvoiceDetails.jsx`), so returning from Generate Invoice shows any newly-saved invoices immediately without a manual refresh.
- **R1.5** When `onBack` is not provided (the standalone route), no Back/Cancel buttons render — matches the original single-page behavior.
- **R1.6** `InvoiceDetails.jsx`'s `generateInvoice()`, for the embedded (`employeeId`) path, pre-checks `activeProjectsForInvoiceByEmployee(employeeId)` itself **before** swapping to this component: if every returned row already has an `invoiceId`, it shows an antd `message.success` toast — *"Invoices for &lt;employeeName&gt; is up to date"* — and returns without setting `isGeneratingInvoice`, so the caller never navigates away from the Invoices tab at all. Only swaps to this component when there's at least one row still needing an invoice. On a failed pre-check (network error), it fails open and swaps anyway, letting this component's own R2.5 fallback surface the state.

## 2. Row generation source (backend)

- **R2.1** Row data comes from whatever `url` is passed in — typically `activeProjectsForInvoiceByEmployee(employeeId)`, which returns one row per invoice **period** (not one row per project) for every active project/assignment the employee has, per the project's own `invoiceTerm` (see backend `bills-and-invoices.md` §Period generation for the period-boundary rules per term).
- **R2.2** Each row carries `invoiceTerm` (the project's own code, string) alongside the period's `startDate`/`endDate` — this is what drives the Start Date snap-and-recompute behavior (R-Start-Date below).
- **R2.3** `getFlattenedData` additionally stamps `projectStartDate`/`projectEndDate` (frozen snapshot of the row's original `startDate`/`endDate` before any edits) and `invoiceMonth` (= original `startDate`, used for the Invoice Month column, R3) onto each row on fetch.
- **R2.4** `getFlattenedData` also **drops any row that already has an invoice** (`invoiceId` truthy, i.e. `> 0`) before it ever reaches `rowData` — Generate Invoice is for creating new invoices, so a period that already matched an existing one has nothing left to generate and isn't shown. This filtering happens on every fetch (initial load and Refresh), not just once.
- **R2.5** If every row for the employee/project gets filtered out by R2.4 (nothing left to generate), the grid and Save button are replaced by a green success `Alert`: *"Invoices for &lt;employeeName&gt; is up to date"* — `employeeName` is captured from the raw (pre-filter) API response so it's still available even though `rowData` ends up empty. Back/Cancel/Refresh remain visible so the user isn't stuck. Guarded by a `hasFetched` flag so the message can't flash on screen during the initial load, before the first fetch has actually resolved (the component doesn't set a `loading` state during that window). This is a **fallback** for the standalone route (R1.1a) and error cases (see R1.6) — the primary embedded path (R1.6) prevents ever reaching this component in the up-to-date case.

## 3. Invoice Month column & grouping

- **R3.1** An "Invoice Month" column is shown (before Client/Vendor), sourced from `invoiceMonth` (the row's original period-start date), formatted via `formatMonthYear` (e.g. "March 2025").
- **R3.2** The column has `enableRowGroup: true`, and the grid's row-group drop panel is always visible (`rowGroupPanelShow="always"`) — a "Drag here to set row groups" bar sits above the header row. Dragging the Invoice Month column there groups all rows by month; this is opt-in (not grouped by default).
- **R3.3** The Columns side-panel also exposes row-group toggling (`suppressRowGroups: false`) as an alternate way to group, in addition to drag-and-drop.

## 4. Editing — Hours / Invoice ID / Start Date / End Date

- **R4.1 Hours**: editable; on change, `Total` is recomputed as `hours * billRate` and the Total cell is refreshed. Marks `hasUnsavedChanges = true` only when the new hours value is `> 0`.
- **R4.2 Invoice ID**: editable; marks `hasUnsavedChanges = true` only when the new value is `> 0`.
- **R4.3 Start Date** (see also `invoiceTerm.requirements.md` §2): editable. On edit:
  1. Rejected (alert, change not committed) if the new value falls outside `projectStartDate`/`projectEndDate` (the row's own frozen bounds, R2.3) — same pattern as `NewInvoice.jsx` R10.1/R10.2.
  2. Otherwise, `computeInvoicePeriod(newValue, data.invoiceTerm)` snaps the date to the row's term's correct period boundary and recomputes End Date from it.
  3. The snapped Start Date is written to `data.startDate` (falls back to the raw typed value if the term yields no snap, e.g. Special).
  4. If a new End Date was computed, it's written to `data.endDate`, clamped down to `projectEndDate` if it would otherwise overshoot (mirrors `NewInvoice.jsx` R10.5's clamp-not-reject treatment for auto-calculated values).
  5. `onCellValueChanged` then explicitly refreshes the End Date cell (`api.refreshCells({ columns: ["endDate"] })`) — AG Grid does not auto-refresh a *different* column than the one just edited, so without this the End Date cell would show a stale value despite the underlying data being correct.
  6. Marks `hasUnsavedChanges = true` unconditionally (any Start Date edit counts as a change, unlike Hours/Invoice ID which only count on a "meaningful" value).
- **R4.4 End Date**: editable directly too; rejected (alert) if it falls outside `projectStartDate`/`projectEndDate`. Editing End Date directly does **not** recompute Start Date (one-directional: Start Date drives End Date, not the reverse).

## 5. Save

- **R5.1** The **Save** button is disabled whenever `hasUnsavedChanges` is `false` — i.e. immediately after load/refresh, and again immediately after a successful save (which resets the flag). It only enables once a qualifying edit (R4.1/R4.2/R4.3) has been made.
- **R5.2** Save posts every row currently in `rowData` (not just edited ones) to `POST /addInvoices`, each stamped with `formatSelectedDate: item.startDate`. On success, re-fetches data (so saved rows reflect their persisted `invoiceId`/state) and resets `hasUnsavedChanges`.
- **R5.3** Backend behavior on save (per row): creates a new Invoice if none exists yet for that `(invoiceId, invoiceMonth)` combination, or updates the existing one's hours/total if it does — and syncs every Bill billed against that invoice's hours/total to match (see backend `bills-and-invoices.md` §Hours sync). Saving is what actually persists a period row as a real, billable Invoice.

## Known gaps

- Start Date's snap-then-clamp (R4.3) validates the **raw picked date** against the project's bounds *before* snapping — if snapping would pull the result outside those bounds (e.g. a project starting mid-week under a Weekly term, snapping back past the project's actual start), that's not re-checked. Matches the corresponding note in `invoiceTerm.requirements.md` Known Gaps; not yet reported as a real-world issue, but worth a test case if this area gets revisited.
- `handleSaveModal` (the "Edit" action / `EditHoursInvoiceModal`) posts a single row without going through the Start Date snap-and-recompute path at all — it saves whatever `hours`/`startDate`/etc. were in the modal as-is. If that modal ever exposes Start Date editing, it should route through the same `computeInvoicePeriod` logic as R4.3 for consistency.
