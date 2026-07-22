# WorkForce.jsx — Requirements

Component: `src/WorkForce/WorkForce.jsx` (renders `WorkForceList.jsx` per tab)
Route: `/workforce`
Purpose: tabbed employee roster (USA / India / Billable / Workforce / Active / Onboarding / Fulltime / Corp to Corp / Terminated / Reconcile), each tab a filtered view over the same fetched employee list.

## 1. New Hires filtering

- **R1.1** By default, employees with `status === "NewHires"` are excluded from **every** tab's dataset — the filter is applied once, before the per-tab `usa`/`india`/`active`/etc. splits are derived, so it's consistent across all of them without each tab needing its own filter.
- **R1.2** A "Show New Hires" checkbox next to the "Add New Employee" button (in the tab bar's extra content) toggles this for the whole page — checking it re-includes New Hires employees in every tab simultaneously.
- **R1.3** "Active Employees" and "Onboarding" tabs already naturally excluded `NewHires` (their filters are `status === "Active"` / `status === "Onboarding"`, an exact-match that already can't include a `NewHires` row) — R1.1 mainly changes the previously-unfiltered tabs: USA, India, Billable, Workforce, Fulltime, Corp to Corp, Terminated (the latter three defined as `status !== "Active"`, which *did* previously let `NewHires` employees leak in).
- **R1.4** Same default-hide/opt-in-show convention as `CompanyDashboard/CompanyFinalReportDetails.jsx` and `VisaDetails/VisaEmployees.jsx` — all three grids independently implement this rule; there is no shared hook/util (each maintains its own `showNewHires` state and filter). If a fourth employee-roster grid is added, follow the same pattern rather than introducing a new convention.

## 2. Known pre-existing quirk (not touched, documented for awareness)

- **R2.1** The "Workforce" tab (`key="4"`, the default active tab) does **not** show its full filtered dataset — it slices to a fixed `pageSize = 10` client-side (`paginatedData`, unrelated to the AG Grid's own pagination controls) before ever reaching the grid. This predates the New Hires filtering work and was not changed. In practice this means: if the first 10 employees (by whatever order the API returns them) don't happen to include any `NewHires` employees, toggling "Show New Hires" produces no visible change on the *Workforce* tab specifically, even though it correctly changes row counts on every other tab (USA/India/etc., which use the unsliced per-tab datasets). Confirmed during testing: the "Workforce" tab's row count didn't move when NewHires employees (`workCountry: "IN"`, IDs 615+) were toggled, while the "India" tab correctly went from 12 → 28 rows.
- **R2.2** "Fulltime" and "Corp to Corp" tabs both render `processedData.terminated` (i.e. they show the *terminated* employee list, not employment-type-filtered data) — also a pre-existing quirk, not touched by this work.
