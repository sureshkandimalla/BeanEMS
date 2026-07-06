# BeanEMS — Requirements Index

Master index of per-component requirements docs, written so QA can derive test cases directly from numbered requirements (`R1.1`, `R2.2`, ...) instead of reverse-engineering behavior from the code.

Each linked doc covers one screen/component: what it loads, what user actions do, validation rules, and any known gaps worth testing explicitly.

## Invoicing

- [NewInvoice.jsx](src/Invoice/NewInvoice.requirements.md) — "Add New Invoice" form: Employee/Vendor/Project cross-filtering and auto-fill, bill rate fill, submit validation, Clear/Cancel. Automated tests: [NewInvoice.test.jsx](src/Invoice/NewInvoice.test.jsx) (20 cases, all passing — run with `npm test -- src/Invoice/NewInvoice.test.jsx --watchAll=false`).

<!-- Add new entries as more component requirement docs are written, grouped by area (Invoicing, Projects, Vendors, Workforce, Visa/LCA, etc.). -->
