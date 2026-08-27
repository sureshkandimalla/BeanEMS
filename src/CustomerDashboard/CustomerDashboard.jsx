import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col } from "antd";
import {
  RightOutlined,
  CheckOutlined,
  UserAddOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined,
  BlockOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear } from "../Utils/dateFormat";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { GLOBAL_CHARTS } from "../Charts/globalChartRegistry";
import "../Home/Home.css";
import "./CustomerDashboard.css";

const DAY_MS = 24 * 60 * 60 * 1000;
const CUSTOMER_CHART_KEYS = ["customerStatus", "customerMsaStatus", "customerRevenueTrend"];

// Same pill-chip shortcut pattern/colors as Home.jsx and VendorDashboard.jsx
// (reusing the icon-chip classes from Home.css) — top-right of the header,
// matching the reference layout.
const CATEGORY_CHIPS = [
  { label: "Customer", to: "/customerdetails", icon: <BlockOutlined />, iconClass: "icon-customer" },
  { label: "Invoice", to: "/invoicedetails", icon: <FileTextOutlined />, iconClass: "icon-invoice" },
  { label: "Projects", to: "/projects", icon: <ProjectOutlined />, iconClass: "icon-projects" },
];

const SHORTCUTS = [
  { label: "New Customer", to: "/customerdetails?new=1", icon: <UserAddOutlined /> },
  { label: "Create Invoice", to: "/invoicedetails?new=1", icon: <FileTextOutlined /> },
  { label: "New Project", to: "/projects?new=1", icon: <ProjectOutlined /> },
  { label: "View Customers", to: "/customerdetails", icon: <TeamOutlined /> },
];

const CustomerDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(API_ENDPOINTS.getAllCustomers),
      axios.get(API_ENDPOINTS.getAllInvoices),
      axios.get(API_ENDPOINTS.getProjects),
    ])
      .then(([customersRes, invoicesRes, projectsRes]) => {
        setCustomers(customersRes.data || []);
        setInvoices(invoicesRes.data || []);
        setProjects(projectsRes.data || []);
        setLoaded(true);
      })
      .catch(() => setFailed(true));
  }, []);

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.projectId, p])), [projects]);

  // Every invoice carries a customerId indirectly, via the project it
  // belongs to (see CustomerFullDetailsComponent.jsx's InvoicesTab for the
  // same join) — resolved once here so every card below can reuse it.
  const invoicesWithCustomer = useMemo(
    () =>
      invoices.map((inv) => ({
        ...inv,
        customerId: projectsById[inv.projectId]?.customerId ?? null,
        customerName: projectsById[inv.projectId]?.customerName || "",
      })),
    [invoices, projectsById],
  );

  const unpaidInvoices = useMemo(
    () => invoicesWithCustomer.filter((inv) => inv.status !== "Paid"),
    [invoicesWithCustomer],
  );

  const overdueInvoices = useMemo(
    () =>
      [...unpaidInvoices].sort((a, b) => (a.invoiceMonth || "").localeCompare(b.invoiceMonth || "")).slice(0, 4),
    [unpaidInvoices],
  );

  const overdueTotal = useMemo(
    () => unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    [unpaidInvoices],
  );

  const activeProjectsCount = useMemo(
    () => projects.filter((p) => p.status === "Active").length,
    [projects],
  );

  const msaPendingCustomers = useMemo(
    () => customers.filter((c) => c.msaStatus === "Pending"),
    [customers],
  );

  const expiringSoonCustomers = useMemo(() => {
    const today = new Date();
    const in90Days = new Date(today.getTime() + 90 * DAY_MS);
    return customers.filter((c) => {
      if (!c.customerEndDate) return false;
      const [y, m, d] = c.customerEndDate.split("-").map(Number);
      if (!y || !m) return false;
      const end = new Date(y, m - 1, d || 1);
      return end >= today && end <= in90Days;
    });
  }, [customers]);

  const activeCustomersCount = customers.filter((c) => c.customerStatus === "Active").length;
  const msaSignedCount = customers.filter((c) => c.msaStatus === "Signed").length;

  const visibleCharts = useMemo(() => GLOBAL_CHARTS.filter((c) => CUSTOMER_CHART_KEYS.includes(c.key)), []);
  const { settingsContent, contentNode } = useChartOverview(visibleCharts, { storageKey: "customer-dashboard-charts" });

  // Each step's top-accent gradient is pulled from the app's own existing
  // palette (the same colors LeftTabs' icon chips use in Home.css), so the
  // funnel reads as "our" colors rather than a single repeated blue.
  const funnelSteps = [
    { key: "total", label: "Total Customers", value: loaded ? customers.length : "--", gradient: "linear-gradient(90deg, #fa8c16, #ffc069)" },
    { key: "active", label: "Active Customers", value: loaded ? activeCustomersCount : "--", highlight: activeCustomersCount > 0, gradient: "linear-gradient(90deg, #52c41a, #95de64)" },
    { key: "msaSigned", label: "MSA Signed", value: loaded ? msaSignedCount : "--", highlight: msaSignedCount > 0, gradient: "linear-gradient(90deg, #2f54eb, #85a5ff)" },
    { key: "activeProjects", label: "In Progress Projects", value: loaded ? activeProjectsCount : "--", highlight: activeProjectsCount > 0, gradient: "linear-gradient(90deg, #13c2c2, #5cdbd3)" },
    {
      key: "unpaid",
      label: "Unpaid Invoices",
      value: loaded ? unpaidInvoices.length : "--",
      highlight: unpaidInvoices.length > 0,
      tag: unpaidInvoices.length > 0 ? `${formatCurrency(overdueTotal)} due` : null,
      link: { to: "/invoicedetails", text: "View unpaid invoices" },
      gradient: "linear-gradient(90deg, #f5222d, #ff7875)",
    },
    { key: "expiring", label: "Expiring Soon", value: loaded ? expiringSoonCustomers.length : "--", gradient: "linear-gradient(90deg, #eb2f96, #ff85c0)" },
  ];

  return (
    <div className="cust-hub-page">
      <div className="cust-hub-header">
        <div className="cust-hub-chip-row">
          {CATEGORY_CHIPS.map((chip) => (
            <Link to={chip.to} key={chip.to} className="home-chip">
              <span className={`left-tab-icon ${chip.iconClass}`}>{chip.icon}</span>
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      <Card className="cust-hub-funnel-card">
        <div className="cust-hub-funnel-heading">
          <span className="label">Customers Funnel</span>
          <span className="range">All time</span>
        </div>
        <div className="cust-hub-funnel-row">
          {funnelSteps.map((step, i) => (
            <React.Fragment key={step.key}>
              <div
                className={`cust-hub-funnel-step ${step.highlight ? "highlight" : ""}`}
                style={{ "--step-gradient": step.gradient }}
              >
                <div className="step-label">{step.label}</div>
                <div className="step-value">{step.value}</div>
                {step.tag && (
                  <div className="step-sub">
                    <span className="step-tag">{step.tag}</span>
                  </div>
                )}
                {step.link && (
                  <Link className="step-link" to={step.link.to}>
                    {step.link.text}
                  </Link>
                )}
              </div>
              {i < funnelSteps.length - 1 && (
                <div className="cust-hub-funnel-connector">
                  <RightOutlined />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card className="cust-hub-panel">
            <div className="cust-hub-panel-heading">
              <span className="label">Overdue Invoices</span>
              <span className="as-of">As of today</span>
            </div>
            {failed ? (
              <div className="cust-hub-empty">Couldn't load — try refreshing</div>
            ) : overdueInvoices.length === 0 ? (
              <div className="cust-hub-empty">
                <div className="check-badge">
                  <CheckOutlined />
                </div>
                <div className="headline">No overdue invoices</div>
                <div className="subline">Every invoice is paid up.</div>
              </div>
            ) : (
              <>
                <div className="cust-hub-total-label">Total of unpaid invoices</div>
                <div className="cust-hub-total-value">{formatCurrency(overdueTotal)}</div>
                <table className="cust-hub-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Date</th>
                      <th className="amount">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.customerName || "—"}</td>
                        <td>{formatMonthYear(inv.invoiceMonth)}</td>
                        <td className="amount">{formatCurrency(inv.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <div className="cust-hub-panel-footer">
              <Link to="/invoicedetails">View invoices</Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="cust-hub-panel">
            <div className="cust-hub-panel-heading">
              <span className="label">MSA Pending</span>
            </div>
            {failed ? (
              <div className="cust-hub-empty">Couldn't load — try refreshing</div>
            ) : msaPendingCustomers.length === 0 ? (
              <div className="cust-hub-empty">
                <div className="check-badge">
                  <CheckOutlined />
                </div>
                <div className="headline">No MSAs pending</div>
                <div className="subline">Every customer's MSA is signed or not required.</div>
              </div>
            ) : (
              <table className="cust-hub-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {msaPendingCustomers.slice(0, 5).map((c) => (
                    <tr key={c.customerId}>
                      <td>{c.customerCompanyName}</td>
                      <td>{c.customerStartDate || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="cust-hub-panel-footer">
              <Link to="/customerdetails" state={{ dashboardFilter: "msaPending" }}>
                Review MSAs
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="cust-hub-panel">
            <div className="cust-hub-panel-heading">
              <span className="label">Needs Attention</span>
            </div>
            {failed ? (
              <div className="cust-hub-empty">Couldn't load — try refreshing</div>
            ) : expiringSoonCustomers.length === 0 ? (
              <div className="cust-hub-empty">
                <div className="check-badge">
                  <CheckOutlined />
                </div>
                <div className="headline">You're caught up!</div>
                <div className="subline">No customer contracts expiring in the next 90 days.</div>
              </div>
            ) : (
              <table className="cust-hub-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoonCustomers.slice(0, 5).map((c) => (
                    <tr key={c.customerId}>
                      <td>{c.customerCompanyName}</td>
                      <td>{c.customerEndDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="cust-hub-panel-footer">
              <Link to="/customerdetails" state={{ dashboardFilter: "expiring" }}>
                Show all
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card className="cust-hub-panel">
            <div className="cust-hub-panel-heading">
              <span className="label">Shortcuts</span>
            </div>
            <div className="cust-hub-shortcuts-row compact">
              {SHORTCUTS.map((s) => (
                <Link className="cust-hub-shortcut" to={s.to} key={s.to}>
                  <span className="icon-circle">{s.icon}</span>
                  {s.label}
                </Link>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card className="cust-hub-panel">
            <div className="cust-hub-panel-heading">
              <span className="label">Customers at a glance</span>
              <ChartSettingsIcon settingsContent={settingsContent} />
            </div>
            {contentNode}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;
