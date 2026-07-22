# FinalReportDetails.jsx — Requirements

Component: `src/Reconciliation/FinalReportDetails.jsx`
Embedded in: `employeeFullDetails` page, "FINAL REPORT" tab (key `13`), scoped to one employee (`employeeId` prop).
Purpose: single grid, grouped by Category (Projects / Payments / Adjustments / Expenses), showing one employee's full financial picture with master-detail drill-down into the underlying records per category. Deliberately kept separate from `CompanyDashboard/CompanyFinalReportDetails.jsx` (the company-wide flat version) so neither disturbs the other.

## 1. Projects category — Income / Income Paid from Bills

- **R1.1** Each row under "Projects" is one of the employee's own projects. **Income** and **Income Paid** are computed from that project's **Bills** (`getBillsForProject`, filtered to `bill.employeeId === employeeId` — a project can have bills for more than one employee via multiple assignments), **not** from `invoice hours × assignment wage` as originally implemented.
  - **Income** = Σ `total` across every one of the employee's bills on that project.
  - **Income Paid** = Σ `total` across only *cleared* bills (`status !== "Created"`) — see backend `bills-and-invoices.md` §Bill status lifecycle for what moves a bill from `Created` to `Invoice Cleared`/`Paid`.
- **R1.2 Total Hours / Paid Hours**: also switched to Bills-sourced (Σ `hours` across all / cleared bills respectively) — previously summed from Invoices directly.
- **R1.3 Billing**: still the project's own `EMP_PAY` assignment wage (unchanged) — shown for reference; it no longer feeds the Income calculation directly (R1.1 sums each bill's own `total`, which already has the wage baked in at bill-creation time).
- **R1.4 Drill-down**: expanding a project row shows that project's **Bill** records (Bill Id, Invoice Month, Hours, Total, Status) — previously showed Invoice records (Invoice Id, Invoice Month, Hours, Status). Column set updated to match the new source of truth.

## 2. Payments category

- **R2.1** One row per **year** (aggregated client-side from the employee's payroll records), showing `totalPayment` = Σ `totalPaid` for that year. Unchanged by the Bills migration (R1) — Payments has always been payroll-sourced, not invoice/bill-sourced.
- **R2.2** Drill-down shows every individual payroll record for that year.

## 3. Adjustments category

- **R3.1** One combined row, expandable to every individual adjustment record. Per the employee's role on each record:
  - Recipient (`toId === employeeId`): counts toward **Total Payment** only.
  - Source (`fromId === employeeId`, they fronted the money): counts toward **both Income and Income Paid** (adjustments have no paid/unpaid split of their own — the full amount is immediately "income" once fronted).
- **R3.2** This is the same Income-folding rule used by `CompanyFinalReportDetails.jsx` (see that doc R3.1/R3.2) — kept consistent across both reports.

## 4. Expenses category

- **R4.1** One combined row; top-level `totalPayment` sums only **reimbursable** expenses. Non-reimbursable expenses still appear in the drill-down for visibility but don't count toward the total (money the company spent, not money owed back to the employee).

## 5. Cutoff filters (Payroll Cutoff / Invoice Cutoff)

- **R5.1** Two dropdowns in the toolbar, "Payroll Cutoff" and "Invoice Cutoff", both default to unset ("All" — no filtering). Options are drawn from the employee's own actual dates rather than a free-form date picker: Payroll Cutoff lists every distinct payroll `checkDate`; Invoice Cutoff lists every distinct bill `endDate` (which mirrors its invoice's `endDate` — see `bills-and-invoices.md`).
- **R5.2** Setting Invoice Cutoff re-derives each Projects row's `hours`/`paidHours`/`income`/`incomePaid` from only the bills whose `endDate` is on or before the cutoff (string comparison on ISO `yyyy-MM-dd`, safe since lexicographic order matches chronological order). Setting Payroll Cutoff does the same for each Payments (year) row's `totalPayment`, from only the payroll records whose `checkDate` is on or before the cutoff — and drops a year row entirely if every one of its records gets filtered out.
- **R5.3** Adjustments and Expenses are not payroll- or invoice-dated, so both cutoffs leave them untouched.
- **R5.4** The two cutoffs are independent — either, both, or neither can be set. The pinned Total row and the drill-down (master/detail) grids both reflect the filtered data, not the unfiltered fetch.

## 6. Pinned Total row

- **R6.1** Sums every category row's `hours`/`paidHours`/`income`/`incomePaid`/`totalPayment` across the whole grid (Projects + Payments + Adjustments + Expenses combined), post-cutoff-filtering (R5a).
- **R6.2 Balance** = Income (summed) − Total Payment (summed).
- **R6.3 Balance-Paid** = Income Paid (summed) − Total Payment (summed).
- **R6.4** These pinned totals are the authoritative per-employee numbers that `CompanyFinalReportDetails.jsx`'s company-wide grid should reconcile against exactly, for the same employee, **when no cutoffs are set** (both were independently verified to match to the cent when the Bills migration, R1, was applied to both — `CompanyFinalReportDetails.jsx` has no equivalent cutoff filters).

## Known gaps

- R1.1's per-employee filter on a project's bills (`bill.employeeId === employeeId`) assumes every bill correctly carries the employee it was billed for — this is set at bill-creation time from the assignment (`mapAssignmentsToBills`, backend) and is not independently re-validated here. If a bill's `employeeId` were ever wrong, this report would silently mis-attribute it.
- No automated test suite exists for this component yet (contrast with `NewInvoice.test.jsx`) — the Bills migration (R1) was verified manually against live data (cross-checking the pinned Total row's Income/Income Paid against an independent recomputation from `getBillsForEmployee`, and against `CompanyFinalReportDetails.jsx`'s Employee Pay column for the same employee) rather than via a written test. Worth adding one if this area sees further changes.
