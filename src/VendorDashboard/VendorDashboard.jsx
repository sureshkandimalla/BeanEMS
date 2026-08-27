import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Collapse } from "antd";
import { ShopOutlined, DollarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { GLOBAL_CHARTS } from "../Charts/globalChartRegistry";
import API_ENDPOINTS from "../config";
import "../Home/Home.css";

const { Panel } = Collapse;

// Same "chip row" shortcut pattern as Home.jsx's CATEGORY_CHIPS, trimmed to
// the Vendor-adjacent entity pages instead of the full app.
const CATEGORY_CHIPS = [
  { label: "Vendor", to: "/vendordetails", icon: <ShopOutlined />, iconClass: "icon-vendor" },
  { label: "Expenses", to: "/expensedetails", icon: <DollarOutlined />, iconClass: "icon-expenses" },
];

// Same greeting/name helpers Home.jsx uses — kept local rather than shared
// since they're one-liners and this is the only other page that needs them.
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

// This page is Accounting-only (see ROUTE_ROLES in roleAccess.js), so
// unlike Home.jsx's chart list there's no per-chart role filtering needed.
const VENDOR_CHART_KEYS = ["vendorStatus", "vendorType"];

const DAY_MS = 24 * 60 * 60 * 1000;

const VendorDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [feedFailed, setFeedFailed] = useState(false);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getAllVendors)
      .then((res) => {
        setVendors(res.data || []);
        setLoaded(true);
      })
      .catch(() => setFeedFailed(true));
  }, []);

  // 4 feed cards computed from fields the app already tracks on Vendor
  // (vendorStatus/vendorEndDate) — no fabricated data.
  const feed = useMemo(() => {
    const today = new Date();
    const in90Days = new Date(today.getTime() + 90 * DAY_MS);

    const activeVendors = vendors.filter((v) => v.vendorStatus === "Active");
    const pendingVendors = vendors.filter((v) => v.vendorStatus === "Pending");
    const expiringSoon = vendors.filter((v) => {
      if (!v.vendorEndDate) return false;
      const [y, m, d] = v.vendorEndDate.split("-").map(Number);
      if (!y || !m) return false;
      const end = new Date(y, m - 1, d || 1);
      return end >= today && end <= in90Days;
    });

    return {
      totalVendors: vendors.length,
      activeCount: activeVendors.length,
      pendingCount: pendingVendors.length,
      expiringSoonCount: expiringSoon.length,
    };
  }, [vendors]);

  const visibleCharts = useMemo(
    () => GLOBAL_CHARTS.filter((c) => VENDOR_CHART_KEYS.includes(c.key)),
    [],
  );
  const { settingsContent, contentNode } = useChartOverview(visibleCharts, { storageKey: "vendor-dashboard-charts" });

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

      <h3 className="home-section-title">Vendor feed</h3>
      <Row gutter={16} className="home-feed-row">
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Total Vendors</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.totalVendors} vendor${feed.totalVendors === 1 ? "" : "s"}` : "Loading…"}
            </div>
            <Link to="/vendordetails">Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Active</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.activeCount} active vendor${feed.activeCount === 1 ? "" : "s"}` : "Loading…"}
            </div>
            <Link to="/vendordetails" state={{ dashboardFilter: "active" }}>Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Pending</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.pendingCount} awaiting approval` : "Loading…"}
            </div>
            <Link to="/vendordetails" state={{ dashboardFilter: "pending" }}>Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Expiring in 90 Days</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.expiringSoonCount} vendor${feed.expiringSoonCount === 1 ? "" : "s"} need attention` : "Loading…"}
            </div>
            <Link to="/vendordetails" state={{ dashboardFilter: "expiring" }}>Review all</Link>
          </Card>
        </Col>
      </Row>

      <Collapse defaultActiveKey={["1"]} style={{ marginTop: 16 }}>
        <Panel
          header="Vendors at a glance"
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

export default VendorDashboard;
