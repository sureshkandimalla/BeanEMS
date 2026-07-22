import React, { useState, useEffect, useMemo } from "react";
import { Tabs, Card, Collapse, Row, Col, Spin, Button, Form, message, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import ReactApexChart from "react-apexcharts";
import VisaDetailsList from "./VisaDetailsList";
import LcaFormModal from "./LcaFormModal";
import VisaFormModal from "./VisaFormModal";
import API_ENDPOINTS from "../config";
import "./VisaEmployees.css";

const { Panel } = Collapse;

const VisaEmployees = () => {
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [showNewHires, setShowNewHires] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lcaModalOpen,  setLcaModalOpen]  = useState(false);
  const [h1bModalOpen,  setH1bModalOpen]  = useState(false);
  const [lcaForm]  = Form.useForm();
  const [h1bForm]  = Form.useForm();
  const [lcaSaving, setLcaSaving] = useState(false);
  const [h1bSaving, setH1bSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Fetch employee dropdown — same service as Create New Project
  useEffect(() => {
    fetch(API_ENDPOINTS.getEmployees)
      .then((res) => res.json())
      .then((data) => {
        const opts = data.map((emp) => ({
          value: emp.employeeId,
          label: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        }));
        setEmployeeOptions(opts);
      })
      .catch(() => setEmployeeOptions([]));
  }, []);

  const fetchAllEmployees = () => {
    setIsLoading(true);
    axios
      .get(API_ENDPOINTS.getAllEmployeesImmigration)
      .then((res) => {
        const processed = Array.isArray(res.data) ? res.data.map((emp) => ({
          ...emp,
          employeeName: emp.employeeName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        })) : [];
        setRowData(processed);
      })
      .catch(() => setRowData([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const processedData = useMemo(() => {
    if (!Array.isArray(rowData)) return { all: [], h1b: [], gc: [], opt: [], l1: [], usCitizen: [], active: [], expiringSoon: [] };

    const today = new Date();
    const in90Days = new Date();
    in90Days.setDate(today.getDate() + 90);

    const visibleRows = showNewHires
      ? rowData
      : rowData.filter(({ status }) => status !== "NewHires");

    return {
      all: visibleRows,
      h1b: visibleRows.filter(({ visaCategory }) => (visaCategory || "").toUpperCase().includes("H1") || (visaCategory || "").toUpperCase().includes("H-1")),
      gc: visibleRows.filter(({ visaCategory }) => (visaCategory || "").toUpperCase().includes("GC") || (visaCategory || "").toUpperCase().includes("GREEN")),
      opt: visibleRows.filter(({ visaCategory }) => (visaCategory || "").toUpperCase().includes("OPT") || (visaCategory || "").toUpperCase().includes("CPT")),
      l1: visibleRows.filter(({ visaCategory }) => (visaCategory || "").toUpperCase().includes("L1") || (visaCategory || "").toUpperCase().includes("L-1")),
      usCitizen: visibleRows.filter(({ visaCategory }) => (visaCategory || "").toUpperCase().includes("CITIZEN")),
      active: visibleRows.filter(({ status }) => status === "Active"),
      expiringSoon: visibleRows.filter(({ endDate }) => {
        if (!endDate) return false;
        const end = new Date(endDate);
        return end >= today && end <= in90Days;
      }),
    };
  }, [rowData, showNewHires]);

  // --- Static chart data (replace with API later) ---
  const visaTypePieOptions = {
    chart: { type: "donut" },
    labels: ["H1-B", "L1", "Green Card", "OPT/CPT", "H4 EAD", "US Citizen", "Other"],
    colors: ["#63abfd", "#6bcbe2", "#f8aa4e", "#e697ff", "#78a0ed", "#6bcb77", "#f45b5b"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "12px" },
    title: { text: "Visa Type Breakdown", align: "center", style: { fontSize: "13px" } },
  };
  const visaTypeSeries = [42, 18, 25, 10, 8, 30, 5];

  const visaStatusPieOptions = {
    chart: { type: "donut" },
    labels: ["Active", "Expired", "Pending", "Expiring Soon"],
    colors: ["#6bcbe2", "#f45b5b", "#f8aa4e", "#e697ff"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "12px" },
    title: { text: "Visa Status", align: "center", style: { fontSize: "13px" } },
  };
  const visaStatusSeries = [78, 12, 20, 28];

  const expiryBarOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    colors: ["#63abfd"],
    xaxis: {
      categories: ["< 30 days", "30–90 days", "90–180 days", "> 180 days"],
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: { show: false },
    title: { text: "Expiry Timeline", align: "center", style: { fontSize: "13px" } },
  };
  const expirySeries = [{ name: "Employees", data: [8, 20, 35, 75] }];

  // KPI counts from real data
  const kpi = useMemo(() => ({
    total: processedData.all.length,
    active: processedData.active.length,
    expiringSoon: processedData.expiringSoon.length,
    h1b: processedData.h1b.length,
  }), [processedData]);

  const tabItems = [
    { key: "all",          label: "All",              children: <VisaDetailsList preloadedData={processedData.all} /> },
    { key: "h1b",          label: "H1-B",             children: <VisaDetailsList preloadedData={processedData.h1b} /> },
    { key: "gc",           label: "Green Card",       children: <VisaDetailsList preloadedData={processedData.gc} /> },
    { key: "opt",          label: "OPT / CPT",        children: <VisaDetailsList preloadedData={processedData.opt} /> },
    { key: "l1",           label: "L1",               children: <VisaDetailsList preloadedData={processedData.l1} /> },
    { key: "usCitizen",    label: "US Citizen",       children: <VisaDetailsList preloadedData={processedData.usCitizen} /> },
    { key: "active",       label: "Active",           children: <VisaDetailsList preloadedData={processedData.active} /> },
    { key: "expiringSoon", label: "Expiring (90 days)", children: <VisaDetailsList preloadedData={processedData.expiringSoon} /> },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>

      {/* KPI Cards */}
      <Row gutter={16} style={{ margin: "12px 12px 0" }}>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#63abfd,#3a7bd5)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#e8f4ff" }}>Total Visa Employees</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{kpi.total}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#6bcbe2,#1e90ff)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#e0f7fa" }}>Active</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{kpi.active}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#f8aa4e,#f97316)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#fff3e0" }}>Expiring in 90 days</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{kpi.expiringSoon}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#e697ff,#a855f7)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#f5e6ff" }}>H1-B Employees</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{kpi.h1b}</div>
          </Card>
        </Col>
      </Row>

      {/* Collapsible Charts */}
      <Collapse
        onChange={(keys) => setIsChartsOpen(keys.includes("charts"))}
        style={{ margin: "12px 12px 0", transition: "all 0.3s ease-in-out" }}
      >
        <Panel header="Visa Overview Charts" key="charts">
          <Row gutter={16}>
            <Col span={8}>
              <Card bodyStyle={{ padding: "12px" }}>
                <ReactApexChart options={visaTypePieOptions} series={visaTypeSeries} type="donut" height={280} />
              </Card>
            </Col>
            <Col span={8}>
              <Card bodyStyle={{ padding: "12px" }}>
                <ReactApexChart options={visaStatusPieOptions} series={visaStatusSeries} type="donut" height={280} />
              </Card>
            </Col>
            <Col span={8}>
              <Card bodyStyle={{ padding: "12px" }}>
                <ReactApexChart options={expiryBarOptions} series={expirySeries} type="bar" height={280} />
              </Card>
            </Col>
          </Row>
        </Panel>
      </Collapse>

      {/* Tabs + Grid */}
      <div style={{ flex: 1, margin: "12px", minHeight: 0 }}>
        <Card className="visaTableCard" style={{ height: "100%" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Tabs
              className="bean-home-tabs"
              defaultActiveKey="all"
              items={tabItems}
              tabBarExtraContent={
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
                  <Checkbox
                    checked={showNewHires}
                    onChange={(e) => setShowNewHires(e.target.checked)}
                  >
                    Show New Hires
                  </Checkbox>
                  <Button type="default" icon={<PlusOutlined />} onClick={() => setLcaModalOpen(true)}>
                    Add New LCA
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setH1bModalOpen(true)}>
                    Add H1-B
                  </Button>
                </div>
              }
            />
          )}
        </Card>
      </div>

      {/* Add LCA Modal */}
      <LcaFormModal
        open={lcaModalOpen}
        isNew={true}
        lcaData={null}
        form={lcaForm}
        saving={lcaSaving}
        showEmployeeSelect={true}
        employeeOptions={employeeOptions}
        onCancel={() => { setLcaModalOpen(false); lcaForm.resetFields(); }}
        onSave={(values) => {
          const payload = {
            ...values,
            lcaId: 0,
            employmentStartDate: values.employmentStartDate?.format("YYYY-MM-DD") || null,
            employmentEndDate:   values.employmentEndDate?.format("YYYY-MM-DD")   || null,
            lcaPostedFromDate:   values.lcaPostedFromDate?.format("YYYY-MM-DD")   || null,
            lcaPostedToDate:     values.lcaPostedToDate?.format("YYYY-MM-DD")     || null,
            certifiedDate:       values.certifiedDate?.format("YYYY-MM-DD")       || null,
          };
          setLcaSaving(true);
          axios.post(API_ENDPOINTS.saveLCA, payload)
            .then(() => {
              message.success("LCA created successfully");
              setLcaModalOpen(false);
              lcaForm.resetFields();
              fetchAllEmployees();
            })
            .catch(() => message.error("Failed to create LCA. Please try again."))
            .finally(() => setLcaSaving(false));
        }}
      />

      {/* Add H1-B Modal */}
      <VisaFormModal
        open={h1bModalOpen}
        isNew={true}
        visaData={null}
        lcaOptions={[]}
        form={h1bForm}
        saving={h1bSaving}
        showEmployeeSelect={true}
        employeeOptions={employeeOptions}
        onCancel={() => { setH1bModalOpen(false); h1bForm.resetFields(); }}
        onSave={(values) => {
          const payload = {
            ...values,
            visaCategory: values.visaCategory ?? "H1B",
            startDate: values.startDate?.format("YYYY-MM-DD") || null,
            endDate:   values.endDate?.format("YYYY-MM-DD")   || null,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
          setH1bSaving(true);
          axios.post(API_ENDPOINTS.createVisa, payload)
            .then(() => {
              message.success("H1-B visa created successfully");
              setH1bModalOpen(false);
              h1bForm.resetFields();
              fetchAllEmployees();
            })
            .catch(() => message.error("Failed to create H1-B. Please try again."))
            .finally(() => setH1bSaving(false));
        }}
        onLcaChange={() => {}}
      />

    </div>
  );
};

export default VisaEmployees;
