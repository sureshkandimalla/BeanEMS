# CompanyFinalReportDetails.jsx — Requirements

Component: `src/CompanyDashboard/CompanyFinalReportDetails.jsx`
Route: `/companyreport`
Purpose: flat, one-row-per-employee, company-wide financial summary grid (not grouped/collapsible, unlike the per-employee `Reconciliation/FinalReportDetails.jsx` — deliberately a separate, self-contained component so the two never disturb each other).

## 1. Row scope — New Hires filtering

- **R1.1** By default, employees with `status === "NewHires"` are excluded from the grid entirely (filtered out of `rowData` before it's used anywhere, including the pinned Company Total row).
- **R1.2** A "Show New Hires" checkbox in the toolbar (next to Export to Excel) toggles this — when checked, New Hires employees are included.
- **R1.3** Same filtering convention as `WorkForce.jsx` and `VisaDetails/VisaEmployees.jsx` (see `WorkForce.requirements.md`) — all three independently implement the same default-hide/opt-in-show rule for this status.

## 2. Per-employee metrics

For each employee, computed by `fetchEmployeeSummary`:

- **R2.1 Invoice Amount / Invoice Hours / Invoice Cleared / Invoice Cleared Hours**: derived from the employee's own **Invoices** (via each of their projects' `getInvoicesForProject`) — `totalInvoiceAmount`/`totalHours` sum every invoice; `invoicesPaid`/`paidHours` sum only invoices with `status === "Paid"`. These four columns are genuinely invoice-scoped and intentionally **not** derived from the Bills table (contrast with R2.2).
- **R2.2 Employee Pay / Employee Pay Paid**: derived from the **Bills** table (`getBillsForEmployee`), not from invoice-hours × wage — matches `Reconciliation/FinalReportDetails.jsx`'s Income/Income Paid (see that doc R1). Employee Pay = Σ `total` across every bill for the employee; Employee Pay Paid = Σ `total` across only *cleared* bills (`status !== "Created"`, i.e. `"Invoice Cleared"` or `"Paid"` — see backend `bills-and-invoices.md` §Bill status lifecycle).
- **R2.3 Total Payment**: `payrollTotal + adjustmentsPaid + expenses` (reimbursable only) — money actually paid out to the employee to date via payroll, adjustments, and reimbursed expenses.
- **R2.4 Adjustments Paid / Adjustments Received**: from the employee's adjustment records — Paid = employee is the recipient (`toId`); Received = employee is the source (`fromId`, they fronted money and are owed it back).
- **R2.5 Company Expenses / Expenses**: Company Expenses = all expense records regardless of reimbursable flag; Expenses = only the reimbursable subset.
- **R2.6 Employer Tax**: Σ `employerLiability` across the employee's payroll records.

## 3. Derived totals

- **R3.1 Income (internal)** = Employee Pay (R2.2) + Adjustments Received (R2.4) — folds in money the employee fronted, matching `Reconciliation/FinalReportDetails.jsx`'s "Income" definition exactly (see that doc R2). This combined value is what's actually shown in the **Employee Pay** column (the raw bills-only figure is not separately displayed).
- **R3.2 Income Paid (internal)** = Employee Pay Paid (R2.2) + Adjustments Received — same fold, shown as **Employee Pay Paid**.
- **R3.3 Balance to Employee** = Income (R3.1) − Total Payment (R2.3). Shown in red parentheses when negative.
- **R3.4 Balance (Invoices Received)** = Income Paid (R3.2) − Total Payment (R2.3). Shown in parentheses (not red) when negative.
- **R3.5 Gross** = `(Invoice Amount + Adjustments Received + Reimbursable Expenses) − (Employee Pay [raw bills total, R2.2] + Employer Tax + Non-Reimbursable Expenses [Company Expenses − Expenses])`.
  - Deliberately uses the **raw** Employee Pay (bills total only, not folded with Adjustments Received per R3.1) as the subtracted term — Adjustments Received is only added once, on the positive side.
  - Adjustments Paid is **not** part of this formula (removed after an early iteration included it and produced a large, confusing negative Gross for an employee with big "Misc" adjustment payouts — see Known Gaps).
  - Shown in red parentheses when negative.

## 4. Display formatting

- **R4.1** All currency columns use `formatSignedCurrency` (renders negatives as `(1,234.56)` rather than `-1,234.56`); Gross and Balance to Employee additionally render in red when negative (`negativeRedCellStyle`); other columns use parentheses only, no red.
- **R4.2** A pinned "Company Total" row sums every visible (post-filter, post-search) row's numeric columns, including all of §2/§3 above.
- **R4.3** Employee Name is a link to `/employeeFullDetails` (passing the full employee record + `activeTab: "13"`, the FINAL REPORT tab) — clicking it is the intended way to cross-check a company-report row against the same employee's detailed per-project breakdown.
- **R4.4** Search and Export to Excel behave the same as other grids in the app (`InvoiceDetails.jsx`-style toolbar).

## Known gaps

- **Gross formula history**: this formula changed several times in the same session (added Adjustments Received, added/removed Adjustments Paid, added non-reimbursable expenses) as the underlying intent was clarified against real data (an employee with $67,400 in "Misc" adjustments producing a wildly negative, hard-to-explain Gross was the trigger for removing Adjustments Paid from the formula). If Gross needs to change again, verify against a real employee's numbers by hand first (see the worked example for "Santosh Kandimalla" in the session that produced R3.5) — this area has proven easy to get subtly wrong.
- The 14 "Misc"-type adjustment records referenced above (large amounts, vague `notes` like "India", spread across several `fromId`s) were flagged as worth a manual data-integrity check with product/finance — not fixed here, just surfaced.
- Employee Pay/Employee Pay Paid (R2.2) require the Bills table to actually be in sync with Invoices for the numbers to be meaningful — see backend `bills-and-invoices.md` §Backfill/validation for the rerunnable endpoints that keep them aligned. If bills are ever created outside the normal `addInvoices` flow, re-run `POST /invoice/backfillBills` and `POST /invoice/validateBillStatus` before trusting this report.
