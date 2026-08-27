import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Card, Tabs, Typography, Button, Collapse } from "antd";
import { ArrowLeftOutlined, MailOutlined, DollarCircleOutlined, LineChartOutlined, PlusOutlined } from "@ant-design/icons";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear } from "../Utils/dateFormat";
import ProjectsList from "../Project/ProjectsList";
import InvoiceDetails from "../Invoice/InvoiceDetails";
import WorkForceList from "../WorkForce/WorkForceList";
import CoiGrid from "../Coi/CoiGrid";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import "./CustomerFullDetailsComponent.css";

// First letter of the first word + first letter of the last word of the
// company name (e.g. "XGare Technologies LLC" -> "XL") — same initials
// convention the reference design uses for its avatar circle.
const getInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const { Panel } = Collapse;

const DetailRow = ({ label, value }) => (
  <div className="cfd-detail-row">
    <div className="row-label">{label}</div>
    <div className="row-value">{value ?? "-"}</div>
  </div>
);

const CustomerFullDetailsComponent = () => {
  const location = useLocation();
  const { rowData } = location.state || {};
  const [invoicesForSummary, setInvoicesForSummary] = useState([]);
  const [billsForSummary, setBillsForSummary] = useState([]);
  const [customerProjects, setCustomerProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Only for the header's "Financial summary" box and Revenue Trend chart
  // — the INVOICES tab below gets its own data directly from InvoiceDetails
  // (customerId-scoped server-side, see InvoiceController#getInvoicesForCustomer),
  // so this is a separate, minimal fetch just for the header.
  useEffect(() => {
    if (!rowData?.customerId) return;
    axios
      .get(API_ENDPOINTS.getInvoicesForCustomer(rowData.customerId))
      .then((res) => setInvoicesForSummary(res.data || []))
      .catch(() => setInvoicesForSummary([]));
    axios
      .get(API_ENDPOINTS.getBillsForCustomer(rowData.customerId))
      .then((res) => setBillsForSummary(res.data || []))
      .catch(() => setBillsForSummary([]));
  }, [rowData]);

  // Feeds both the PROJECTS tab (ProjectsList.jsx — the actual /projects
  // grid, same flattened-per-bill-rate shape as its own getProjects) and
  // the EMPLOYEES tab (every employeeId that shows up on one of this
  // customer's projects, cross-referenced against the full roster so
  // WorkForceList — the actual /workforce grid — gets real employee
  // records instead of project rows).
  const fetchCustomerProjects = () => {
    if (!rowData?.customerId) return;
    setLoaded(false);
    Promise.all([
      axios.get(API_ENDPOINTS.getProjectsByCustomer(rowData.customerId)),
      axios.get(API_ENDPOINTS.getAllEmployees),
    ])
      .then(([projectsRes, employeesRes]) => {
        setCustomerProjects(projectsRes.data || []);
        setAllEmployees(employeesRes.data || []);
      })
      .catch(() => {
        setCustomerProjects([]);
        setAllEmployees([]);
      })
      .finally(() => setLoaded(true));
  };

  useEffect(fetchCustomerProjects, [rowData]);

  const customerEmployees = useMemo(() => {
    const customerEmployeeIds = new Set(
      customerProjects.map((p) => Number(p.employeeId)).filter(Boolean),
    );
    return allEmployees.filter((e) => customerEmployeeIds.has(Number(e.employeeId)));
  }, [customerProjects, allEmployees]);

  const { openBalance, overduePayment } = useMemo(() => {
    const today = new Date();
    let open = 0;
    let overdue = 0;
    invoicesForSummary.forEach((inv) => {
      const outstanding = (inv.total || 0) - (inv.invoicePaidAmount || 0);
      if (outstanding <= 0) return;
      open += outstanding;
      const [y, m] = (inv.invoiceMonth || "").split("-").map(Number);
      if (y && m && new Date(y, m, 0) < today) overdue += outstanding;
    });
    return { openBalance: open, overduePayment: overdue };
  }, [invoicesForSummary]);

  // Invoice / Invoice Paid / Bills total, by month — "Invoice" and
  // "Invoice Paid" come from this customer's own invoices (inv.total /
  // inv.invoicePaidAmount); "Bills" is the separate Bills entity (internal
  // cost billed against this customer's projects, joined server-side via
  // Project.vendor_id — see BillsRepository#findByCustomer), grouped by
  // its own invoiceMonth the same way.
  const revenueTrend = useMemo(() => {
    const byMonth = {};
    invoicesForSummary.forEach((inv) => {
      if (!inv.invoiceMonth) return;
      const key = inv.invoiceMonth.substring(0, 7);
      if (!byMonth[key]) byMonth[key] = { invoice: 0, invoicePaid: 0, bills: 0 };
      byMonth[key].invoice += inv.total || 0;
      byMonth[key].invoicePaid += inv.invoicePaidAmount || 0;
    });
    billsForSummary.forEach((bill) => {
      if (!bill.invoiceMonth) return;
      const key = bill.invoiceMonth.substring(0, 7);
      if (!byMonth[key]) byMonth[key] = { invoice: 0, invoicePaid: 0, bills: 0 };
      byMonth[key].bills += bill.total || 0;
    });
    // Full history — RevenueCharts shows 4 months at a time (scrollable,
    // defaulted to the most recent end) rather than truncating the data.
    const sortedKeys = Object.keys(byMonth).sort();
    return {
      categories: sortedKeys.map((k) => formatMonthYear(`${k}-01`)),
      invoice: sortedKeys.map((k) => Math.round(byMonth[k].invoice)),
      invoicePaid: sortedKeys.map((k) => Math.round(byMonth[k].invoicePaid)),
      bills: sortedKeys.map((k) => Math.round(byMonth[k].bills)),
    };
  }, [invoicesForSummary, billsForSummary]);

  if (!rowData) {
    return <Typography.Text type="danger">No customer selected.</Typography.Text>;
  }

  const tabItems = [
    {
      key: "details",
      label: "CUSTOMER DETAILS",
      children: (
        <div className="cfd-detail-cols">
          <div className="cfd-detail-col">
            <div className="cfd-detail-col-title">Contact info</div>
            <DetailRow label="Customer" value={rowData.customerCompanyName} />
            <DetailRow label="Contact Name" value={rowData.customerName} />
            <DetailRow label="Email" value={rowData.customerEmail} />
            <DetailRow label="Billing Contact" value={rowData.billingContact} />
            <DetailRow label="Accounts Payable Contact" value={rowData.apContact} />
            <DetailRow label="Phone" value={rowData.customerPhone} />
            <DetailRow label="Website" value={rowData.website} />
            <DetailRow label="Notes" value={rowData.notes} />
          </div>
          <div className="cfd-detail-col">
            <div className="cfd-detail-col-title">Additional info</div>
            <DetailRow label="Address" value={rowData.customerAddress} />
            <DetailRow label="Parent Company" value={rowData.parentCompany} />
            <DetailRow label="EIN" value={rowData.ein} />
            <DetailRow label="Status" value={rowData.customerStatus} />
            <DetailRow label="Customer Type" value={rowData.customerType} />
            <DetailRow label="MSA Status" value={rowData.msaStatus} />
            <DetailRow label="Standard Currency" value={rowData.standardCurrency} />
            <DetailRow label="Default Billing Method" value={rowData.defaultBillingMethod} />
            <DetailRow label="Payment Terms" value={rowData.paymentTerms} />
            <DetailRow label="Credit Limit" value={rowData.creditLimit != null ? formatCurrency(rowData.creditLimit) : null} />
            <DetailRow label="Start Date" value={rowData.customerStartDate} />
            <DetailRow label="End Date" value={rowData.customerEndDate} />
          </div>
        </div>
      ),
    },
    {
      key: "projects",
      label: "PROJECTS",
      children: (
        <div style={{ height: 560 }}>
          <ProjectsList
            projectsList={loaded ? customerProjects : []}
            isCollapsed={true}
            onRefresh={fetchCustomerProjects}
          />
        </div>
      ),
    },
    {
      key: "invoices",
      label: "INVOICES",
      children: (
        <div style={{ height: 560 }}>
          <InvoiceDetails customerId={rowData.customerId} isCollapsed={true} />
        </div>
      ),
    },
    {
      key: "employees",
      label: "EMPLOYEES",
      children: (
        <div style={{ height: 560 }}>
          <WorkForceList
            employees={loaded ? customerEmployees : []}
            isCollapsed={true}
            onRefresh={fetchCustomerProjects}
          />
        </div>
      ),
    },
    {
      key: "coi",
      label: "COI",
      children: (
        <div style={{ height: 560 }}>
          <CoiGrid customerId={rowData.customerId} isCollapsed={true} />
        </div>
      ),
    },
  ];

  return (
    <div className="cfd-page">
      <div className="cfd-topbar">
        <Link to="/customerdetails" className="cfd-back-link">
          <ArrowLeftOutlined /> Customers
        </Link>
        <div className="cfd-topbar-actions">
          <Link to="/invoicedetails?new=1">
            <Button type="primary" icon={<PlusOutlined />}>
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <Collapse defaultActiveKey={["1"]} className="cfd-header-collapse">
        <Panel header="Customer Overview" key="1">
        <div className="cfd-header-row">
          <div className="cfd-header-left">
            <div className="cfd-header-left-top">
              <div className="cfd-avatar-block">
                <div className="cfd-avatar">{getInitials(rowData.customerCompanyName)}</div>
                <div className="cfd-avatar-name">{rowData.customerCompanyName}</div>
                {rowData.customerName && <div className="cfd-avatar-sub">{rowData.customerName}</div>}
                {rowData.customerEmail && (
                  <div className="cfd-avatar-actions">
                    <a href={`mailto:${rowData.customerEmail}`} title="Email customer">
                      <MailOutlined />
                    </a>
                  </div>
                )}
              </div>

              <div className="cfd-info-cols">
                <div className="cfd-info-col">
                  <div className="cfd-info-block">
                    <div className="cfd-info-label">Email</div>
                    <div className="cfd-info-value">{rowData.customerEmail || "-"}</div>
                  </div>
                  <div className="cfd-info-block">
                    <div className="cfd-info-label">Billing address</div>
                    <div className="cfd-info-value">{rowData.customerAddress || "-"}</div>
                  </div>
                  <div className="cfd-info-block">
                    <div className="cfd-info-label">Notes</div>
                    <div className="cfd-info-value">{rowData.notes || "-"}</div>
                  </div>
                </div>
                <div className="cfd-info-col">
                  <div className="cfd-info-block">
                    <div className="cfd-info-label">Phone</div>
                    <div className="cfd-info-value">{rowData.customerPhone || "-"}</div>
                  </div>
                  <div className="cfd-info-block">
                    <div className="cfd-info-label">MSA Status</div>
                    <div className="cfd-info-value">{rowData.msaStatus || "-"}</div>
                  </div>
                  <div className="cfd-info-block">
                    <div className="cfd-info-label">Status</div>
                    <div className="cfd-info-value">{rowData.customerStatus || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cfd-fin-summary">
              <div className="cfd-fin-title">
                <DollarCircleOutlined /> Financial summary
              </div>
              <div className="cfd-fin-summary-row">
                <div className="cfd-fin-item">
                  <div className="cfd-fin-label">
                    <span className="cfd-fin-dot open" /> Open balance
                  </div>
                  <div className="cfd-fin-value">{formatCurrency(openBalance)}</div>
                </div>
                <div className="cfd-fin-item">
                  <div className="cfd-fin-label">
                    <span className="cfd-fin-dot overdue" /> Overdue payment
                  </div>
                  <div className="cfd-fin-value">{formatCurrency(overduePayment)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cfd-header-right">
            <div className="cfd-revenue-trend">
              <div className="cfd-fin-title">
                <LineChartOutlined /> Revenue Trend
              </div>
              {revenueTrend.categories.length === 0 ? (
                <Typography.Text type="secondary">No invoice history yet.</Typography.Text>
              ) : (
                <RevenueCharts
                  thisMonthData={revenueTrend.bills}
                  lastMonthData={revenueTrend.invoice}
                  thirdSeriesData={revenueTrend.invoicePaid}
                  categories={revenueTrend.categories}
                  series1Name="Bills"
                  series2Name="Invoice"
                  series3Name="Invoice Paid"
                  colors={["#6bcbe2", "#63abfd", "#e697ff"]}
                  showLegend={false}
                  visibleCategories={4}
                  pxPerCategory={150}
                  height={220}
                />
              )}
            </div>
          </div>
        </div>
        </Panel>
      </Collapse>

      <Card className="cfd-tabs-card">
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default CustomerFullDetailsComponent;
