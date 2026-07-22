# BeanEMS — Requirements Index

Master index of per-component requirements docs, written so QA can derive test cases directly from numbered requirements (`R1.1`, `R2.2`, ...) instead of reverse-engineering behavior from the code.

Each linked doc covers one screen/component: what it loads, what user actions do, validation rules, and any known gaps worth testing explicitly.

## Invoicing

- [NewInvoice.jsx](src/Invoice/NewInvoice.requirements.md) — "Add New Invoice" form: Employee/Vendor/Project cross-filtering and auto-fill, bill rate fill, submit validation, Clear/Cancel. Automated tests: [NewInvoice.test.jsx](src/Invoice/NewInvoice.test.jsx) (20 cases, all passing — run with `npm test -- src/Invoice/NewInvoice.test.jsx --watchAll=false`).
- [invoiceTerm.js](src/Utils/invoiceTerm.requirements.md) — shared Invoice Term enum (Weekly/Biweekly/Monthly/Special/Semi-Monthly/Once in 4 Weeks): code↔label conversion, and the two period-computation helpers (`computeInvoicePeriod` snap-and-compute vs. legacy `computeInvoiceEndDate` flat-offset).
- [GenerateInvoiceDetails.jsx](src/Invoice/GenerateInvoiceDetails.requirements.md) — auto-generated per-period invoice rows, editable and saveable: inline embedding (no page nav) with Back/Cancel, Invoice Month column + row-grouping, Start Date snap-and-recompute End Date, Save gated on unsaved changes.
- [Bills & Invoices (backend)](../BeanEMSServices/docs/bills-and-invoices.md) *(in the BeanEMSServices repo)* — bill creation, the Created→Invoice Cleared→Paid status lifecycle, hours sync on invoice edit, per-term invoice period generation, and the rerunnable backfill/validation maintenance endpoints.

## Reports

- [CompanyFinalReportDetails.jsx](src/CompanyDashboard/CompanyFinalReportDetails.requirements.md) — company-wide flat financial summary grid (`/companyreport`): New Hires filtering, Bills-sourced Employee Pay, the Gross/Balance formulas.
- [FinalReportDetails.jsx](src/Reconciliation/FinalReportDetails.requirements.md) — per-employee FINAL REPORT tab: Bills-sourced Income/Income Paid per project, Payments/Adjustments/Expenses categories, pinned totals.

## Workforce

- [WorkForce.jsx](src/WorkForce/WorkForce.requirements.md) — employee roster tabs (`/workforce`): New Hires filtering convention, and a documented pre-existing pagination quirk on the default "Workforce" tab.

## Projects

- [ProjectFullDetails.jsx](src/Project/ProjectFullDetails.requirements.md) — single-project page: Project Overview Invoice/Bill totals table + revenue chart, the Bills tab, and the Assignments tab's Save/Cancel (including a backend partial-update data-loss fix).

<!-- Add new entries as more component requirement docs are written, grouped by area (Invoicing, Projects, Vendors, Workforce, Visa/LCA, etc.). -->
