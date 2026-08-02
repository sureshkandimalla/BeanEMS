import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Empty, Spin, Select } from "antd";
import axios from "axios";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import TrendLineChart from "../RevenueCharts/TrendLineChart";
import PieCharts from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear, parseLocalDateSafe } from "../Utils/dateFormat";
import { TIME_RANGE_OPTIONS, DEFAULT_TIME_RANGE, getRangeBounds, isDateInRange } from "./timeRange";

// Global, reusable chart widgets — each fetches its own data independently,
// so it can be dropped into any page's useChartOverview(...) list regardless
// of what that page already fetches for itself. Every widget is a
// React.forwardRef wrapping one of the existing generic chart components
// (RevenueCharts/TrendLineChart/PieCharts), forwarding the ref straight
// through so useChartOverview's PNG-download button keeps working exactly
// like it does on every page-local chart today. Each also gets its own
// QuickBooks-style time-range dropdown (top-right) — data is fetched once,
// unfiltered, and re-aggregated client-side whenever the range changes, so
// switching ranges is instant with no extra network round-trip.

const CenteredSpin = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
    <Spin />
  </div>
);

// A failed fetch (backend down/restarting, network blip) must never throw an
// unhandled promise rejection — that crashes the whole page with React's red
// error overlay instead of just this one widget failing gracefully.
const ErrorState = () => <Empty description="Couldn't load this chart" image={Empty.PRESENTED_IMAGE_SIMPLE} />;

// Same light blue/pink-violet family RevenueCharts uses by default
// (["#63abfd", "#e697ff"]) — extended so the donuts (which can have more
// than 2 slices) stay in that same family instead of the default rainbow
// PIE_PALETTE, cycling for anything beyond 6 slices.
const PIE_COLORS_LIKE_REVENUE_TREND = ["#63abfd", "#e697ff", "#3d8bfd", "#f2b8ff", "#8ec5fd", "#d17aff"];
const revenueTrendPieColors = (count) =>
  Array.from({ length: count || 0 }, (_, i) => PIE_COLORS_LIKE_REVENUE_TREND[i % PIE_COLORS_LIKE_REVENUE_TREND.length]);

const RangeHeader = ({ range, onChange }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
    <Select
      size="small"
      value={range}
      onChange={onChange}
      options={TIME_RANGE_OPTIONS}
      style={{ width: 150 }}
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

// ── Invoice Status ──────────────────────────────────────────────────────────
// Time-filtered by invoiceMonth (the billing period each invoice belongs to).
const InvoiceStatusWidget = React.forwardRef((props, ref) => {
  const [invoices, setInvoices] = useState(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState(DEFAULT_TIME_RANGE);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getAllInvoices)
      .then(({ data }) => setInvoices(data || []))
      .catch(() => setFailed(true));
  }, []);

  const slices = useMemo(() => {
    if (!invoices) return null;
    const bounds = getRangeBounds(range);
    const byStatus = {};
    invoices
      .filter((inv) => isDateInRange(inv.invoiceMonth, bounds))
      .forEach((inv) => {
        const status = inv.status || "Unknown";
        byStatus[status] = (byStatus[status] || 0) + (inv.total || 0);
      });
    const labels = Object.keys(byStatus);
    const colors = revenueTrendPieColors(labels.length);
    return labels.map((label, i) => ({ label, value: byStatus[label], color: colors[i] }));
  }, [invoices, range]);

  if (failed) return <ErrorState />;
  if (!slices) return <CenteredSpin />;

  return (
    <div style={{ height: "100%" }}>
      <RangeHeader range={range} onChange={setRange} />
      {slices.length === 0 ? (
        <Empty description="No invoices in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Row align="middle">
          <Col span={14}>
            <div style={{ width: "100%", height: props.height }}>
              <PieCharts
                ref={ref}
                chartData={slices.map((s) => Math.round(s.value))}
                chartLabels={slices.map((s) => s.label)}
                colors={slices.map((s) => s.color)}
                showLegend={false}
              />
            </div>
          </Col>
          <Col span={10}>
            <PieLegend slices={slices} valueFormatter={formatCurrency} fontSize={13} rowGap={6} />
          </Col>
        </Row>
      )}
    </div>
  );
});

// ── Workforce Status ────────────────────────────────────────────────────────
// Time-filtered by employee startDate — narrowing the range shows new hires
// added in that window rather than the full current headcount (the only
// real date this app tracks per employee for this purpose). Defaults to "All
// time" so the default view is still the full current snapshot.
const WorkforceStatusWidget = React.forwardRef((props, ref) => {
  const [employees, setEmployees] = useState(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState("allTime");

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getAllEmployees)
      .then(({ data }) => setEmployees(data || []))
      .catch(() => setFailed(true));
  }, []);

  const slices = useMemo(() => {
    if (!employees) return null;
    const bounds = getRangeBounds(range);
    const filtered =
      range === "allTime" ? employees : employees.filter((e) => isDateInRange(e.startDate, bounds));
    const byStatus = {};
    filtered.forEach((e) => {
      if (!e.status) return;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    });
    const labels = Object.keys(byStatus);
    const colors = revenueTrendPieColors(labels.length);
    return labels.map((label, i) => ({ label, value: byStatus[label], color: colors[i] }));
  }, [employees, range]);

  if (failed) return <ErrorState />;
  if (!slices) return <CenteredSpin />;

  const total = slices.reduce((sum, s) => sum + (s.value || 0), 0);

  return (
    <div style={{ height: "100%" }}>
      <RangeHeader range={range} onChange={setRange} />
      {slices.length === 0 ? (
        <Empty description="No employees in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Row align="middle">
          <Col span={10}>
            <div style={{ width: "100%", height: props.height }}>
              <PieCharts ref={ref} chartData={slices.map((s) => s.value)} chartLabels={slices.map((s) => s.label)} colors={slices.map((s) => s.color)} showLegend={false} />
            </div>
          </Col>
          <Col span={8}>
            <PieLegend slices={slices} fontSize={13} rowGap={6} />
          </Col>
          <Col span={6} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{total}</div>
            <div style={{ color: "#888" }}>Total</div>
          </Col>
        </Row>
      )}
    </div>
  );
});

// ── Revenue Trend (invoiced vs billed by month) ────────────────────────────
const RevenueTrendWidget = React.forwardRef((props, ref) => {
  const [raw, setRaw] = useState(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState(DEFAULT_TIME_RANGE);

  useEffect(() => {
    Promise.all([axios.get(API_ENDPOINTS.getAllInvoices), axios.get(API_ENDPOINTS.getAllBills)])
      .then(([invoicesRes, billsRes]) => setRaw({ invoices: invoicesRes.data || [], bills: billsRes.data || [] }))
      .catch(() => setFailed(true));
  }, []);

  const chartData = useMemo(() => {
    if (!raw) return null;
    const bounds = getRangeBounds(range);
    const invoiced = {};
    raw.invoices
      .filter((inv) => isDateInRange(inv.invoiceMonth, bounds))
      .forEach((inv) => {
        const month = (inv.invoiceMonth || "").slice(0, 7);
        if (!month) return;
        invoiced[month] = (invoiced[month] || 0) + (inv.total || 0);
      });
    const billed = {};
    raw.bills
      .filter((bill) => isDateInRange(bill.invoiceMonth, bounds))
      .forEach((bill) => {
        const month = (bill.invoiceMonth || "").slice(0, 7);
        if (!month) return;
        billed[month] = (billed[month] || 0) + (bill.total || 0);
      });
    const months = Array.from(new Set([...Object.keys(invoiced), ...Object.keys(billed)])).sort();
    return {
      categories: months.map((m) => formatMonthYear(`${m}-01`)),
      invoiced: months.map((m) => Math.round(invoiced[m] || 0)),
      billed: months.map((m) => Math.round(billed[m] || 0)),
    };
  }, [raw, range]);

  if (failed) return <ErrorState />;
  if (!chartData) return <CenteredSpin />;

  return (
    <div style={{ height: "100%" }}>
      <RangeHeader range={range} onChange={setRange} />
      {chartData.categories.length === 0 ? (
        <Empty description="No revenue data in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <RevenueCharts
          ref={ref}
          thisMonthData={chartData.invoiced}
          lastMonthData={chartData.billed}
          categories={chartData.categories}
          series1Name="Invoiced"
          series2Name="Billed"
          height={props.height - 40}
        />
      )}
    </div>
  );
});

// ── Expenses by Type ────────────────────────────────────────────────────────
const ExpensesByTypeWidget = React.forwardRef((props, ref) => {
  const [expenses, setExpenses] = useState(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState(DEFAULT_TIME_RANGE);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getAllExpenses)
      .then(({ data }) => setExpenses(data || []))
      .catch(() => setFailed(true));
  }, []);

  const slices = useMemo(() => {
    if (!expenses) return null;
    const bounds = getRangeBounds(range);
    const byType = {};
    expenses
      // "date paid" — the Expense model has no separate paid-date field, only
      // expenseDate, so that's what this filters on. (Originally also
      // restricted to status === "Reimbursed", but real data never reaches
      // that status — every expense here is "Approved" or "Pending" — so
      // that filter just hid everything; dropped it.)
      .filter((exp) => isDateInRange(exp.expenseDate, bounds))
      .forEach((exp) => {
        const type = exp.expenseType || "Other";
        byType[type] = (byType[type] || 0) + (exp.amount || 0);
      });
    const labels = Object.keys(byType);
    const colors = revenueTrendPieColors(labels.length);
    return labels.map((label, i) => ({ label, value: byType[label], color: colors[i] }));
  }, [expenses, range]);

  if (failed) return <ErrorState />;
  if (!slices) return <CenteredSpin />;

  return (
    <div style={{ height: "100%" }}>
      <RangeHeader range={range} onChange={setRange} />
      {slices.length === 0 ? (
        <Empty description="No expenses in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Row align="middle">
          <Col span={14}>
            <div style={{ width: "100%", height: props.height }}>
              <PieCharts
                ref={ref}
                chartData={slices.map((s) => Math.round(s.value))}
                chartLabels={slices.map((s) => s.label)}
                colors={slices.map((s) => s.color)}
                showLegend={false}
              />
            </div>
          </Col>
          <Col span={10}>
            <PieLegend slices={slices} valueFormatter={formatCurrency} fontSize={13} rowGap={6} />
          </Col>
        </Row>
      )}
    </div>
  );
});

// ── Active Projects by Month ────────────────────────────────────────────────
// The full month-by-month trend is computed once from all projects (a
// project's "active" status in any given month depends on the full
// timeline), then the range just crops which months are displayed.
const ActiveProjectsByMonthWidget = React.forwardRef((props, ref) => {
  const [fullChartData, setFullChartData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState(DEFAULT_TIME_RANGE);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getProjects)
      .then(({ data }) => {
        const rows = data || [];
        const starts = rows.map((r) => parseLocalDateSafe(r.startDate)).filter(Boolean);
        if (starts.length === 0) {
          setFullChartData({ months: [], counts: [] });
          return;
        }

        const today = new Date();
        const ends = rows.map((r) => parseLocalDateSafe(r.endDate)).filter(Boolean);
        const minStart = new Date(Math.min(...starts));
        const maxEnd = new Date(Math.max(today, ...ends, ...starts));

        const months = [];
        let cursor = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
        const last = new Date(maxEnd.getFullYear(), maxEnd.getMonth(), 1);
        while (cursor <= last) {
          months.push(new Date(cursor));
          cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }

        const counts = months.map((monthStart) => {
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
          const activeIds = new Set();
          rows.forEach((r) => {
            const start = parseLocalDateSafe(r.startDate);
            const end = parseLocalDateSafe(r.endDate);
            if (!start || start > monthEnd) return;
            if (end && end < monthStart) return;
            activeIds.add(r.projectId);
          });
          return activeIds.size;
        });

        setFullChartData({ months, counts });
      })
      .catch(() => setFailed(true));
  }, []);

  const chartData = useMemo(() => {
    if (!fullChartData) return null;
    const bounds = getRangeBounds(range);
    const keep = fullChartData.months
      .map((m, i) => ({ m, count: fullChartData.counts[i] }))
      .filter(({ m }) => (!bounds.start || m >= new Date(bounds.start.getFullYear(), bounds.start.getMonth(), 1)) && (!bounds.end || m <= bounds.end));
    return {
      categories: keep.map(({ m }) => formatMonthYear(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`)),
      counts: keep.map(({ count }) => count),
    };
  }, [fullChartData, range]);

  if (failed) return <ErrorState />;
  if (!chartData) return <CenteredSpin />;

  return (
    <div style={{ height: "100%" }}>
      <RangeHeader range={range} onChange={setRange} />
      {chartData.categories.length === 0 ? (
        <Empty description="No project data in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <TrendLineChart ref={ref} data={chartData.counts} categories={chartData.categories} seriesName="Active Projects" height={props.height - 40} />
      )}
    </div>
  );
});

// ── Active Employees by Month ───────────────────────────────────────────────
// Same month-by-month trend approach as Active Projects by Month: an
// employee counts as active in a given month if their startDate falls on or
// before that month's end and (when set) their endDate falls on or after
// that month's start.
const ActiveEmployeesByMonthWidget = React.forwardRef((props, ref) => {
  const [fullChartData, setFullChartData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState(DEFAULT_TIME_RANGE);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getAllEmployees)
      .then(({ data }) => {
        const rows = data || [];
        const starts = rows.map((r) => parseLocalDateSafe(r.startDate)).filter(Boolean);
        if (starts.length === 0) {
          setFullChartData({ months: [], counts: [] });
          return;
        }

        const today = new Date();
        const ends = rows.map((r) => parseLocalDateSafe(r.endDate)).filter(Boolean);
        const minStart = new Date(Math.min(...starts));
        const maxEnd = new Date(Math.max(today, ...ends, ...starts));

        const months = [];
        let cursor = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
        const last = new Date(maxEnd.getFullYear(), maxEnd.getMonth(), 1);
        while (cursor <= last) {
          months.push(new Date(cursor));
          cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }

        const counts = months.map((monthStart) => {
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
          const activeIds = new Set();
          rows.forEach((r) => {
            const start = parseLocalDateSafe(r.startDate);
            const end = parseLocalDateSafe(r.endDate);
            if (!start || start > monthEnd) return;
            if (end && end < monthStart) return;
            activeIds.add(r.employeeId);
          });
          return activeIds.size;
        });

        setFullChartData({ months, counts });
      })
      .catch(() => setFailed(true));
  }, []);

  const chartData = useMemo(() => {
    if (!fullChartData) return null;
    const bounds = getRangeBounds(range);
    const keep = fullChartData.months
      .map((m, i) => ({ m, count: fullChartData.counts[i] }))
      .filter(({ m }) => (!bounds.start || m >= new Date(bounds.start.getFullYear(), bounds.start.getMonth(), 1)) && (!bounds.end || m <= bounds.end));
    return {
      categories: keep.map(({ m }) => formatMonthYear(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`)),
      counts: keep.map(({ count }) => count),
    };
  }, [fullChartData, range]);

  if (failed) return <ErrorState />;
  if (!chartData) return <CenteredSpin />;

  return (
    <div style={{ height: "100%" }}>
      <RangeHeader range={range} onChange={setRange} />
      {chartData.categories.length === 0 ? (
        <Empty description="No employee data in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <TrendLineChart ref={ref} data={chartData.counts} categories={chartData.categories} seriesName="Active Employees" height={props.height - 40} />
      )}
    </div>
  );
});

// charts: [{ key, label, title, filename, defaultSize, render(innerHeight, setChartRef) }]
// Shape matches useChartOverview's expectations exactly (see
// src/Utils/ChartOverviewPanel.jsx) — any page can filter this list down to
// the keys it wants and pass the result straight into useChartOverview.
export const GLOBAL_CHARTS = [
  {
    key: "invoiceStatus",
    label: "Invoice Status",
    filename: "invoice-status",
    defaultSize: { width: 480, height: 340 },
    render: (innerHeight, setChartRef) => <InvoiceStatusWidget ref={setChartRef} height={innerHeight - 40} />,
  },
  {
    key: "workforceStatus",
    label: "Workforce Status",
    filename: "workforce-status",
    defaultSize: { width: 560, height: 340 },
    render: (innerHeight, setChartRef) => <WorkforceStatusWidget ref={setChartRef} height={innerHeight - 40} />,
  },
  {
    key: "revenueTrend",
    label: "Revenue Trend",
    filename: "revenue-trend",
    defaultSize: { width: 700, height: 380 },
    render: (innerHeight, setChartRef) => <RevenueTrendWidget ref={setChartRef} height={innerHeight} />,
  },
  {
    key: "expensesByType",
    label: "Expenses by Type",
    filename: "expenses-by-type",
    defaultSize: { width: 480, height: 340 },
    render: (innerHeight, setChartRef) => <ExpensesByTypeWidget ref={setChartRef} height={innerHeight - 40} />,
  },
  {
    key: "activeProjectsByMonth",
    label: "Active Projects by Month",
    filename: "active-projects-by-month",
    defaultSize: { width: 700, height: 380 },
    render: (innerHeight, setChartRef) => <ActiveProjectsByMonthWidget ref={setChartRef} height={innerHeight} />,
  },
  {
    key: "activeEmployeesByMonth",
    label: "Active Employees by Month",
    filename: "active-employees-by-month",
    defaultSize: { width: 700, height: 380 },
    render: (innerHeight, setChartRef) => <ActiveEmployeesByMonthWidget ref={setChartRef} height={innerHeight} />,
  },
];
