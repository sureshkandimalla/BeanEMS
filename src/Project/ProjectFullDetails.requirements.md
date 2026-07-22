# ProjectFullDetails.jsx — Requirements

Component: `src/Project/ProjectFullDetails.jsx`
Purpose: single-project detail page — Project Overview summary card + tabbed sub-views (Project Summary, Assignments, WorkOrders, Invoices, Bills).

## 1. Project Overview card

- **R1.1** A summary table (not the earlier plain flex rows) shows Total/Paid/Balance for both Invoice and Bill, fetched via `getInvoicesForProject`/`getBillsForProject` for the project:
  - Invoice row: Total = Σ invoice `total`; Paid = Σ `invoicePaidAmount`; Balance = Total − Paid.
  - Bill row: Total = Σ bill `total`; Paid = Σ `billPaidAmount`; Balance = Total − Paid.
- **R1.2** "Total Revenue" (Σ Invoice Amount) and "Total Expense" (Σ Bill Amount) are shown side by side above the chart, sourced from the same fetch as R1.1.
- **R1.3** The revenue/expense bar chart (`RevenueCharts`, shared component — see §2) plots **Invoice** vs **Bill** totals **per month** for the project, replacing the component's original hardcoded "Company 1–5" dummy data on this page specifically. Month buckets are derived by truncating each invoice/bill's `invoiceMonth` to `yyyy-MM`.
- **R1.4** Section headers within the "Project Summary" tab's Project File card (Project Details / Billing Information / Current Home Address) use the app's navy (`#042c54`), matching the "Project File" title itself — a leftover neon green (`rgb(22, 226, 22)`) was fixed. **Note**: `EmployeeFullDetailsComponent.css` has the identical neon-green rule for its own Personnel File tab, not yet aligned — see Known Gaps.

## 2. RevenueCharts.jsx (shared component)

Component: `src/RevenueCharts/RevenueCharts.jsx`, also used by `Dashboard.jsx`, `Project/ProjectDashboard.jsx`, `EmployeeDetailsComponent/EmployeeFullDetailsComponent.jsx`, `EmployeeDetailDashboard/EmployeeDetailDashboard.jsx` (all four still pass their original hardcoded 5-category dummy data — only `ProjectFullDetails.jsx` passes real data, R1.3).

- **R2.1** Accepts optional `categories`/`series1Name`/`series2Name` props (default to the original `["Company 1".."Company 5"]` / `"This Month"` / `"Last Month"`) so existing callers are unaffected by extending the component for real-data use.
- **R2.2** Each bar shows its own value as an on-bar data label, rotated vertically to fit the narrow columns, formatted as **whole-dollar** currency (no cents — `formatWholeCurrency`, local to this component, distinct from the shared `formatCurrency` which always shows cents).
- **R2.3** No y-axis is shown (`yaxis.show = false`) — an earlier attempt to show a formatted dollar y-axis was reverted in favor of the on-bar labels (R2.2), per explicit direction.
- **R2.4** Chart height is `250` (raised from an original `150`, which was too short once real month labels — more of them, and longer than "Company 1" etc. — pushed the bars down to near-invisible slivers).
- **R2.5** No horizontal scroll / category cap: an earlier iteration capped the visible chart to 12 categories with a horizontal-scrolling wrapper; this was explicitly reverted — the chart now always renders all categories, compressed to fit the card width if there are many.

## 3. Bills tab

- **R3.1** Renders `Billings/BillingDetails.jsx` pointed at `getBillsForProject(projectId)` — was previously labeled "BillingDetails" (no space); renamed to **"Bills"** to sit consistently next to "Invoices" in the tab bar.
- **R3.2** Has an Export to Excel button (added — previously only had Refresh + Search, unlike the Invoices tab's toolbar).
- **R3.3** Same component (`BillingDetails.jsx`) also renders the employeeFullDetails "Bills" tab, scoped instead to `getBillsForEmployee(employeeId)` — see Known Gaps for a bug that was found and fixed there.

## 4. Assignments tab — Save/Cancel

Component: `src/Project/AssignmentDetails.jsx`; backend: `com.bean.controller.AssignmentController#updateAssignment` (`PUT /assignments/{id}`).

- **R4.1** The grid's editable columns (Wage, Status, Start Date, End Date) previously had no way to persist changes — no Save/Cancel buttons existed at all. Added the same pattern used by `Project/ProjectsList.jsx`: `onCellValueChanged` tracks modified rows keyed by `assignmentId`; Save/Cancel buttons appear in the toolbar only once at least one row has a pending edit.
- **R4.2 Save**: `PUT`s each modified row to `assignmentsById(assignmentId)`. **Cancel**: discards pending edits and re-fetches from the server (does not attempt to revert in-memory).
- **R4.3 (Backend, data-loss fix)**: the pre-existing `PUT /assignments/{id}` blindly overwrote **every** field on the `Assignment` entity from the request body — but the grid's row data (a flattened `com.bean.domain.Assignment` projection) never included `projectId`, `employeeId`, or `assignmentTaxType`. Wiring Save to that endpoint as-is would have silently **nulled out** those three fields on every single edit. Fixed by making the endpoint a proper partial update: each field is only overwritten when actually present/non-zero in the request body (`Long`/`String` fields via null-check; `employeeId`/`wage`, which are primitive `long`/`float` and so always deserialize to `0` rather than `null` when absent, via a `!= 0` check instead — safe because neither field has a legitimate real-world value of exactly `0`).
- **R4.4 (Backend)**: an explicit `status` in the request body now always wins over the endpoint's old behavior of recomputing status from `endDate` — matches the same fix already applied to `Project`'s own status handling (`ProjectController#updateProject`).
- **R4.5** Verified via direct `curl` round-trips (not just UI testing) that `projectId`/`employeeId`/`assignmentTaxType` survive a partial-update Save unchanged, and that a real wage edit persists correctly — see backend commit history / session log for the exact before/after values used.

## Known gaps

- **`EmployeeFullDetailsComponent.css`'s Personnel File tab** has the identical neon-green section-header bug as R1.4 (same `header-title-green` rule, same `rgb(22, 226, 22)` value, in a separate CSS file) — explicitly **not** fixed, since the request that prompted R1.4 was scoped to the Project Summary screen only. Fix the same way (`color: #042c54`) if/when asked to align that page too.
- **`getBillsForEmployee` was completely broken** before this session's fixes: `API_ENDPOINTS.getBillsForEmployee` was referenced in `EmployeeFullDetailsComponent.jsx`'s Bills tab but never defined in `config.js` — the constructed URL was literally the string `"undefined?employeeId=<id>"`. Every employee's Bills tab silently showed "No Rows To Show" with no console error. Fixed by adding the missing `config.js` entry and correcting the call site to invoke it as a function (it had been used as if it were a plain string constant with a query string manually appended). Confirmed fixed live: 17 real bill rows now load for a known-good employee.
- No Project Name / Invoice reference column exists on the employeeFullDetails Bills tab (R3.3) — if an employee has bills across multiple projects, there's currently no way to tell which project a given bill row belongs to from that grid alone (only Invoice Month is shown). Would need a backend join (Bills → Invoice → Project) to add; flagged but not implemented.
