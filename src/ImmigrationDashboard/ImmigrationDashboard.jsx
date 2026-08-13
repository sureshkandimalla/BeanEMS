import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Collapse } from "antd";
import { FileTextOutlined, IdcardOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { GLOBAL_CHARTS } from "../Charts/globalChartRegistry";
import API_ENDPOINTS from "../config";
import "../Home/Home.css";

const { Panel } = Collapse;

// Same "chip row" shortcut pattern as Home.jsx's CATEGORY_CHIPS, trimmed to
// the three Immigration entity pages instead of the full app.
const CATEGORY_CHIPS = [
  { label: "LCA", to: "/lcaDetails", icon: <FileTextOutlined />, iconClass: "icon-lca" },
  { label: "Visa", to: "/visaDetails", icon: <IdcardOutlined />, iconClass: "icon-visadetails" },
  { label: "Visa Employees", to: "/visaEmployees", icon: <UsergroupAddOutlined />, iconClass: "icon-visa" },
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

// This page is Immigration-only (see ROUTE_ROLES in roleAccess.js), so
// unlike Home.jsx's chart list there's no per-chart role filtering needed —
// every chart here is already something Immigration should see.
const IMMIGRATION_CHART_KEYS = [
  "workforceStatus",
  "employeeVisaType",
  "activeEmployeesByMonth",
  "visaType",
  "visaStatus",
  "visaExpiryTimeline",
];

const DAY_MS = 24 * 60 * 60 * 1000;

const ImmigrationDashboard = () => {
  const [visas, setVisas] = useState([]);
  const [lcas, setLcas] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [feedFailed, setFeedFailed] = useState(false);

  useEffect(() => {
    Promise.all([axios.get(API_ENDPOINTS.getAllVisas), axios.get(API_ENDPOINTS.getAllLCAs)])
      .then(([visasRes, lcasRes]) => {
        setVisas(visasRes.data || []);
        setLcas(lcasRes.data || []);
        setLoaded(true);
      })
      .catch(() => setFeedFailed(true));
  }, []);

  // 4 feed cards computed from fields the app already tracks on Visa
  // (status/endDate) and LCA (status) — no fabricated data.
  const feed = useMemo(() => {
    const today = new Date();
    const in90Days = new Date(today.getTime() + 90 * DAY_MS);

    const approvedVisas = visas.filter((v) => v.status === "Approved");
    const pendingVisas = visas.filter((v) => ["Submitted", "RFE", "In Progress"].includes(v.status));
    const expiringSoon = visas.filter((v) => {
      if (!v.endDate) return false;
      const [y, m, d] = v.endDate.split("-").map(Number);
      if (!y || !m) return false;
      const end = new Date(y, m - 1, d || 1);
      return end >= today && end <= in90Days;
    });
    const activeLcas = lcas.filter((l) => (l.status || "").toLowerCase() === "certified");

    return {
      totalVisas: visas.length,
      approvedCount: approvedVisas.length,
      pendingCount: pendingVisas.length,
      expiringSoonCount: expiringSoon.length,
      activeLcasCount: activeLcas.length,
      totalLcas: lcas.length,
    };
  }, [visas, lcas]);

  const visibleCharts = useMemo(
    () => GLOBAL_CHARTS.filter((c) => IMMIGRATION_CHART_KEYS.includes(c.key)),
    [],
  );
  const { settingsContent, contentNode } = useChartOverview(visibleCharts, { storageKey: "immigration-dashboard-charts" });

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

      <h3 className="home-section-title">Immigration feed</h3>
      <Row gutter={16} className="home-feed-row">
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Total Visas</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.totalVisas} visa record${feed.totalVisas === 1 ? "" : "s"}` : "Loading…"}
            </div>
            <Link to="/visaDetails">Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Approved</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.approvedCount} approved visa${feed.approvedCount === 1 ? "" : "s"}` : "Loading…"}
            </div>
            <Link to="/visaDetails">Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Pending / RFE</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.pendingCount} awaiting action` : "Loading…"}
            </div>
            <Link to="/visaDetails">Review all</Link>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="home-feed-card">
            <div className="home-feed-card-title">Expiring in 90 Days</div>
            <div className="home-feed-card-body">
              {feedFailed ? "Couldn't load — try refreshing" : loaded ? `${feed.expiringSoonCount} visa${feed.expiringSoonCount === 1 ? "" : "s"} need attention` : "Loading…"}
            </div>
            <Link to="/visaDetails">Review all</Link>
          </Card>
        </Col>
      </Row>

      <Collapse defaultActiveKey={["1"]} style={{ marginTop: 16 }}>
        <Panel
          header="Immigration at a glance"
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

export default ImmigrationDashboard;
