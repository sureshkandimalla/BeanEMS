import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Button, Drawer, Flex, Collapse } from "antd";
import { PlusOutlined, UserOutlined, BlockOutlined, ShopOutlined, FileTextOutlined, DollarOutlined, ProjectOutlined, BoxPlotOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Newemployee from "../Newemployee/Newemployee";
import NewCustomer from "../Customer/NewCustomer";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { GLOBAL_CHARTS } from "../Charts/globalChartRegistry";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import "./Home.css";

const { Panel } = Collapse;

// QuickBooks calls these "categories" — here they're just shortcuts to the
// app's own existing nav sections, reusing the exact colored icon-chip
// classes already defined for the left nav (src/LeftTabs/LeftTabs.css), so
// a new color system doesn't need inventing.
const CATEGORY_CHIPS = [
  { label: "Team", to: "/workforce", icon: <UserOutlined />, iconClass: "icon-team" },
  { label: "Customer", to: "/customerdetails", icon: <BlockOutlined />, iconClass: "icon-customer" },
  { label: "Vendor", to: "/vendordetails", icon: <ShopOutlined />, iconClass: "icon-vendor" },
  { label: "Invoice", to: "/invoicedetails", icon: <FileTextOutlined />, iconClass: "icon-invoice" },
  { label: "Expenses", to: "/expensedetails", icon: <DollarOutlined />, iconClass: "icon-expenses" },
  { label: "Projects", to: "/projects", icon: <ProjectOutlined />, iconClass: "icon-projects" },
  { label: "Payroll", to: "/payrollsummary", icon: <BoxPlotOutlined />, iconClass: "icon-payroll" },
  { label: "Time", to: "/timesheets", icon: <ClockCircleOutlined />, iconClass: "icon-time" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getUserFirstName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const name = user?.name || user?.email || "";
    return name.split(" ")[0].split("@")[0];
  } catch {
    return "";
  }
};

// yyyy-MM of a stored invoiceMonth ("yyyy-MM-dd" or "yyyy-MM") without the
// UTC-parse off-by-one pitfall — string-slice only, no Date object involved.
const monthKey = (isoDateString) => (isoDateString || "").slice(0, 7);

const Home = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [feedFailed, setFeedFailed] = useState(false);

  useEffect(() => {
    Promise.all([axios.get(API_ENDPOINTS.getAllInvoices), axios.get(API_ENDPOINTS.getAllBills)])
      .then(([invoicesRes, billsRes]) => {
        setInvoices(invoicesRes.data || []);
        setBills(billsRes.data || []);
        setLoaded(true);
      })
      .catch(() => setFeedFailed(true));
  }, []);

  // All 4 feed cards are computed from fields the app already tracks
  // (status/total/invoicePaidAmount/billPaidAmount/invoiceMonth) — no
  // fabricated data, no new backend endpoints.
  const feed = useMemo(() => {
    const currentMonth = monthKey(new Date().toISOString());

    const unpaidInvoices = invoices.filter((inv) => inv.status !== "Paid");
    const unpaidBills = bills.filter((bill) => bill.status !== "Paid");
    const invoicedThisMonth = invoices.filter((inv) => monthKey(inv.invoiceMonth) === currentMonth);
    const paidThisMonth = invoices.filter((inv) => inv.status === "Paid" && monthKey(inv.invoiceMonth) === currentMonth);

    return {
      unpaidInvoicesCount: unpaidInvoices.length,
      unpaidInvoicesAmount: unpaidInvoices.reduce((sum, inv) => sum + ((inv.total || 0) - (inv.invoicePaidAmount || 0)), 0),
      unpaidBillsCount: unpaidBills.length,
      unpaidBillsAmount: unpaidBills.reduce((sum, bill) => sum + ((bill.total || 0) - (bill.billPaidAmount || 0)), 0),
      invoicedThisMonthAmount: invoicedThisMonth.reduce((sum, inv) => sum + (inv.total || 0), 0),
      paidThisMonthAmount: paidThisMonth.reduce((sum, inv) => sum + (inv.invoicePaidAmount || 0), 0),
    };
  }, [invoices, bills]);

  const { settingsContent, contentNode } = useChartOverview(GLOBAL_CHARTS, { storageKey: "home-charts" });

  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [customerDrawerVisible, setCustomerDrawerVisible] = useState(false);
  const [projectDrawerVisible, setProjectDrawerVisible] = useState(false);
  const closeDrawers = () => {
    setEmployeeDrawerVisible(false);
    setCustomerDrawerVisible(false);
    setProjectDrawerVisible(false);
  };

  return (
    <div className="home-page">
      <h1 className="home-greeting">
        {getGreeting()}{getUserFirstName() ? `, ${getUserFirstName()}` : ""}!
      </h1>

      <div className="home-chip-row">
        {CATEGORY_CHIPS.map((chip) => (
          <Link to={chip.to} key={chip.to} className="home-chip">
            <span className={`left-tab-icon ${chip.iconClass}`}>{chip.icon}</span>
            {chip.label}
          </Link>
        ))}
      </div>

      <h3 className="home-section-title">Business feed</h3>
      <Row gutter={16} className="home-feed-row">
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Unpaid invoices</div>
            <div className="home-feed-card-body">
              {feedFailed
                ? "Couldn't load — try refreshing"
                : loaded
                  ? `${formatCurrency(feed.unpaidInvoicesAmount)} across ${feed.unpaidInvoicesCount} invoice${feed.unpaidInvoicesCount === 1 ? "" : "s"} waiting to be paid`
                  : "Loading…"}
            </div>
            <Link to="/invoicedetails">Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Unpaid bills</div>
            <div className="home-feed-card-body">
              {feedFailed
                ? "Couldn't load — try refreshing"
                : loaded
                  ? `${formatCurrency(feed.unpaidBillsAmount)} across ${feed.unpaidBillsCount} bill${feed.unpaidBillsCount === 1 ? "" : "s"} still owed`
                  : "Loading…"}
            </div>
            <Link to="/invoicedetails">Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Invoiced this month</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? formatCurrency(feed.invoicedThisMonthAmount) : "Loading…"}
            </div>
            <Link to="/generateInvoice">Go to Generate Invoice</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Paid this month</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? formatCurrency(feed.paidThisMonthAmount) : "Loading…"}
            </div>
            <Link to="/invoicedetails">Go to Invoices</Link>
          </Card>
        </Col>
      </Row>

      <h3 className="home-section-title">Create actions</h3>
      <Flex gap="small" wrap="wrap" className="home-actions-row">
        <Button onClick={() => navigate("/generateInvoice")}>
          Generate Invoice
        </Button>
        <Button onClick={() => setCustomerDrawerVisible(true)}>
          <PlusOutlined /> Add New Customer
        </Button>
        <Button onClick={() => setEmployeeDrawerVisible(true)}>
          <PlusOutlined /> Add New Employee
        </Button>
        <Button onClick={() => setProjectDrawerVisible(true)}>
          <PlusOutlined /> Add New Project
        </Button>
      </Flex>

      <Drawer title="Employee Onboarding" placement="right" size="large" onClose={closeDrawers} open={employeeDrawerVisible}>
        <Newemployee onClose={closeDrawers} />
      </Drawer>
      <Drawer title="Customer Onboarding" placement="right" size="large" onClose={closeDrawers} open={customerDrawerVisible}>
        <NewCustomer />
      </Drawer>
      <Drawer title="Project Onboarding" placement="right" size="large" onClose={closeDrawers} open={projectDrawerVisible}>
        <ProjectOnBoardingForm />
      </Drawer>

      <Collapse defaultActiveKey={["1"]} style={{ marginTop: 16 }}>
        <Panel
          header="Business at a glance"
          key="1"
          extra={
            <div onClick={(e) => e.stopPropagation()}>
              <ChartSettingsIcon settingsContent={settingsContent} />
            </div>
          }
        >
          {contentNode}
        </Panel>
      </Collapse>
    </div>
  );
};

export default Home;
