import React, { useMemo, useState, useEffect } from "react";
import "@ag-grid-community/styles/ag-grid.css";
import { PlusOutlined, BellOutlined } from "@ant-design/icons";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import TrendLineChart from "../RevenueCharts/TrendLineChart";
import PieCharts, { getPieColors } from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { Col, Row, Card, Button, Tabs, Collapse, Drawer, Spin, Popover, Badge, List, Empty } from "antd";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
import "./ProjectDashboard.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import ProjectList from "./ProjectsList";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear } from "../Utils/dateFormat";

// Same UTC-parse pitfall noted throughout this codebase: never
// `new Date(isoString)` (parses as UTC midnight, off-by-one in timezones
// behind UTC) — always build from the Y/M/D components directly.
const parseLocalDate = (isoDateString) => {
  if (!isoDateString) return null;
  const [year, month, day] = isoDateString.split("-").map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, day || 1);
};

const { Panel } = Collapse;

const ProjectDashboard = () => {
  const [rowData, setRowData] = useState();
  const [activeKey, setActiveKey] = useState("0"); // State for active tab
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [isEmployeesLoading, setEmployeeLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addNewProject = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleCollapseChange = () => {
    setIsCollapsed((prev) => !prev);
  };
  const [open, setOpen] = useState(false);

  const processedData = useMemo(() => {
    if (!rowData) return {};
    return {
      all: rowData,
      active: rowData.filter(({ status }) => (status || "").toUpperCase() === "ACTIVE"),
    };
  }, [rowData]);

  // Total Bill Rate across active projects, split into where it goes:
  // Employee Pay, Bean Net Internal, External expense, and Internal expense.
  const billRateBreakdown = useMemo(() => {
    const activeRows = processedData.active || [];
    const totalBillRate = activeRows.reduce((sum, r) => sum + (r.billRate || 0), 0);
    const totalEmployeePay = activeRows.reduce((sum, r) => sum + (r.employeePay || 0), 0);
    const totalNetInternal = activeRows.reduce((sum, r) => sum + (r.net || 0), 0);
    const totalExternal = activeRows.reduce((sum, r) => sum + (r.expenseExternal || 0), 0);
    const totalInternal = activeRows.reduce((sum, r) => sum + (r.expenseInternal || 0), 0);
    return { totalBillRate, totalEmployeePay, totalNetInternal, totalExternal, totalInternal };
  }, [processedData]);

  // Same slice order/values feed both the donut (via PieCharts) and the
  // hand-built legend beside it — kept as one array so they can't drift.
  const billRateSlices = useMemo(() => {
    const colors = getPieColors(4);
    return [
      { label: "Employee Pay", value: billRateBreakdown.totalEmployeePay, color: colors[0] },
      { label: "Net", value: billRateBreakdown.totalNetInternal, color: colors[1] },
      { label: "External", value: billRateBreakdown.totalExternal, color: colors[2] },
      { label: "Taxes", value: billRateBreakdown.totalInternal, color: colors[3] },
    ];
  }, [billRateBreakdown]);

  // Not the stored `status` field — that column is only ever set
  // explicitly and goes stale in both directions: a project already past
  // its end date can still say "Active" (never flipped to Closed), and one
  // provisioned ahead of a future start date can already say "Active" too.
  // "Currently active or not yet ended" instead — a null end date (still
  // ongoing) or an end date that hasn't passed counts, regardless of
  // whether the start date is in the past or the future, so a project
  // scheduled to kick off next month still counts now.
  const activeProjectCount = useMemo(() => {
    const rows = rowData || [];
    const today = new Date();
    const activeIds = new Set();
    rows.forEach((r) => {
      const end = parseLocalDate(r.endDate);
      if (end && end < today) return;
      activeIds.add(r.projectId);
    });
    return activeIds.size;
  }, [rowData]);

  // How many distinct projects were active in each month — a project
  // counts as active for a month if that month falls anywhere between its
  // start and end date (a null end date means still ongoing, so it keeps
  // counting through the current month, or further if some other
  // project's real end/start date pushes the chart's range beyond today —
  // e.g. a project already scheduled to start next month still shows up,
  // with next month's bar reflecting it).
  const activeProjectsByMonthChart = useMemo(() => {
    const rows = rowData || [];
    const starts = rows.map((r) => parseLocalDate(r.startDate)).filter(Boolean);
    if (starts.length === 0) return { categories: [], counts: [] };

    const today = new Date();
    const ends = rows.map((r) => parseLocalDate(r.endDate)).filter(Boolean);
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
      const activeProjectIds = new Set();
      rows.forEach((r) => {
        const start = parseLocalDate(r.startDate);
        const end = parseLocalDate(r.endDate);
        if (!start || start > monthEnd) return;
        if (end && end < monthStart) return;
        activeProjectIds.add(r.projectId);
      });
      return activeProjectIds.size;
    });

    return {
      categories: months.map((m) => formatMonthYear(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`)),
      counts,
    };
  }, [rowData]);

  // Invoiced vs Billed totals per project — both Invoice and Bills now
  // carry their own projectId directly.
  const projectRevenueChart = useMemo(() => {
    const projectNameById = {};
    (rowData || []).forEach((r) => {
      if (r.projectId != null) projectNameById[r.projectId] = r.projectName;
    });

    const invoicedByProject = {};
    invoices.forEach((inv) => {
      if (inv.projectId == null) return;
      invoicedByProject[inv.projectId] = (invoicedByProject[inv.projectId] || 0) + (inv.total || 0);
    });

    const billedByProject = {};
    bills.forEach((bill) => {
      if (bill.projectId == null) return;
      billedByProject[bill.projectId] = (billedByProject[bill.projectId] || 0) + (bill.total || 0);
    });

    const projectIds = Array.from(new Set([...Object.keys(invoicedByProject), ...Object.keys(billedByProject)]))
      .map(Number)
      .sort((a, b) => (invoicedByProject[b] || 0) - (invoicedByProject[a] || 0));

    return {
      categories: projectIds.map((id) => projectNameById[id] || `Project ${id}`),
      invoiced: projectIds.map((id) => Math.round(invoicedByProject[id] || 0)),
      billed: projectIds.map((id) => Math.round(billedByProject[id] || 0)),
      totalInvoiced: Object.values(invoicedByProject).reduce((sum, v) => sum + v, 0),
      totalBilled: Object.values(billedByProject).reduce((sum, v) => sum + v, 0),
    };
  }, [rowData, invoices, bills]);

  // Chart definitions for the Projects Overview area — useChartOverview
  // handles show/hide, drag-to-reorder, drag-to-resize, and PNG download
  // generically from this list. The "Total Active Projects" stat card is
  // included too (just without a `filename`, so it gets no download
  // button) so it can be moved/resized right alongside the real charts —
  // leaving it fixed outside the flex-wrap area caused layout gaps once
  // the charts beside it got reordered or resized.
  const projectOverviewCharts = [
    {
      key: "revenue",
      label: "Invoices vs Bills by Project",
      title: `Total Invoiced: ${formatCurrency(projectRevenueChart.totalInvoiced)}  |  Total Billed: ${formatCurrency(projectRevenueChart.totalBilled)}`,
      filename: "invoices-vs-bills-by-project",
      defaultSize: { width: 700, height: 340 },
      render: (innerHeight, setChartRef) => (
        <RevenueCharts
          ref={setChartRef}
          thisMonthData={projectRevenueChart.invoiced}
          lastMonthData={projectRevenueChart.billed}
          categories={projectRevenueChart.categories}
          series1Name="Invoiced"
          series2Name="Billed"
          xaxisLabelRotate={0}
          maxLabelLength={12}
          height={innerHeight}
        />
      ),
    },
    {
      key: "billRate",
      label: "Bill Rate Breakdown",
      title: `Bill Rate: ${formatCurrency(billRateBreakdown.totalBillRate)}`,
      filename: "bill-rate-breakdown",
      defaultSize: { width: 600, height: 340 },
      render: (innerHeight, setChartRef) =>
        billRateBreakdown.totalBillRate > 0 ? (
          <Row align="middle">
            <Col span={14}>
              <div style={{ width: "100%", height: innerHeight }}>
                <PieCharts
                  ref={setChartRef}
                  chartData={billRateSlices.map((s) => Math.round(s.value))}
                  chartLabels={billRateSlices.map((s) => s.label)}
                  showLegend={false}
                />
              </div>
            </Col>
            <Col span={10} style={{ maxHeight: innerHeight, overflowY: "auto" }}>
              <PieLegend slices={billRateSlices} valueFormatter={formatCurrency} />
            </Col>
          </Row>
        ) : (
          <Empty description="No bill rate data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ),
    },
    {
      key: "activeByMonth",
      label: "Active Projects by Month",
      title: `Active Projects by Month (Current: ${activeProjectCount})`,
      filename: "active-projects-by-month",
      defaultSize: { width: 700, height: 340 },
      render: (innerHeight, setChartRef) => (
        <TrendLineChart
          ref={setChartRef}
          data={activeProjectsByMonthChart.counts}
          categories={activeProjectsByMonthChart.categories}
          seriesName="Active Projects"
          height={innerHeight}
        />
      ),
    },
  ];
  const { settingsContent, contentNode } = useChartOverview(projectOverviewCharts);

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
      return { ...dataObj };

      // return { ...dataObj,...dataObj.assignments[0],...dataObj.employee.firstName.value, ...dataObj.employee.employeeAssignments[0],...dataObj.customer,...dataObj.billRates[0] }
    });
    console.log(updatedData);
    return updatedData || [];
  };

  const fetchData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getProjects);
      const data = await response.json();
      const flattendData = getFlattenedData(data);
      setRowData(flattendData);
      setEmployeeLoading(false);
      console.log(flattendData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getAllEmployees);
      const data = await response.json();
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchInvoicesAndBills = async () => {
    try {
      const [invoicesResponse, billsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.getAllInvoices),
        fetch(API_ENDPOINTS.getAllBills),
      ]);
      setInvoices((await invoicesResponse.json()) || []);
      setBills((await billsResponse.json()) || []);
    } catch (error) {
      console.error("Error fetching invoices/bills:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmployees();
    fetchInvoicesAndBills();
  }, []);

  // Two data-quality checks against the full employee roster: an Active
  // employee with no active project row at all, or the reverse — someone
  // who still has an active project assigned despite no longer being
  // Active themselves. A Closed/Inactive project on an Inactive employee is
  // a perfectly consistent state, not an alert — only the project's own
  // status (not just its existence) counts as "has a project" here.
  const projectAlerts = useMemo(() => {
    if (!rowData || employees.length === 0) return [];
    const employeeIdsWithActiveProjects = new Set(
      rowData.filter((r) => (r.status || "").toUpperCase() === "ACTIVE").map((r) => r.employeeId).filter(Boolean),
    );

    const alerts = [];
    employees.forEach((emp) => {
      const isActive = (emp.status || "").toUpperCase() === "ACTIVE";
      const hasProject = employeeIdsWithActiveProjects.has(emp.employeeId);
      const employeeName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
      if (isActive && !hasProject) {
        alerts.push({
          employeeId: emp.employeeId,
          employeeName,
          reason: "Active employee with no active project assigned",
        });
      } else if (hasProject && !isActive) {
        alerts.push({
          employeeId: emp.employeeId,
          employeeName,
          reason: `Has an active project assigned but employee status is "${emp.status || "Unknown"}"`,
        });
      }
    });
    return alerts;
  }, [rowData, employees]);

  const alertContent = (
    <div style={{ maxHeight: 320, overflowY: "auto", minWidth: 320 }}>
      {projectAlerts.length === 0 ? (
        <Empty description="No alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={projectAlerts}
          renderItem={(item) => (
            <List.Item key={`${item.employeeId}-${item.reason}`}>
              <List.Item.Meta title={item.employeeName} description={item.reason} />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const items = [
    {
      key: "1",
      label: "Active",
      children: <ProjectList projectsList={processedData?.active} isCollapsed={isCollapsed} onRefresh={fetchData} />,
    },
    {
      key: "2",
      label: "All",
      children: <ProjectList projectsList={rowData} isCollapsed={isCollapsed} onRefresh={fetchData} />,
    },
  ];

  return (
    <>
      <div className="project-dashboard-outer">
        {/* Collapsible Section (Takes 30% Height) */}
        <Collapse
          onChange={handleCollapseChange}
          style={{
            flex: isCollapsed ? "0 0 22%" : "0 0 5%" /* Hide when collapsed */,
            marginBottom: "10px",
            transition: "flex 0.3s ease-in-out" /* Smooth transition */,
          }}
        >
          <Panel
            header="Projects Overview"
            key="1"
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 16 }} onClick={(e) => e.stopPropagation()}>
                <Popover content={alertContent} title="Project Alerts" trigger="click" placement="bottomRight">
                  <Badge count={projectAlerts.length} size="small">
                    <Button icon={<BellOutlined />} size="small" />
                  </Badge>
                </Popover>
                <ChartSettingsIcon settingsContent={settingsContent} />
              </div>
            }
          >
            {contentNode}
          </Panel>
        </Collapse>

        <Drawer
          title={`Create New Project`}
          placement="right"
          size="large"
          onClose={onClose}
          open={open}
        >
          <ProjectOnBoardingForm onClose={onClose} />
        </Drawer>
        <div
          className={`project-c ${isCollapsed ? "expanded" : "collapsed"}`}
        >
          <Card className="employeeTableCard" style={{ height: "100%" }}>
            <Tabs
              className="project-home-tabs"
              onChange={setActiveKey}
              items={items}
              defaultActiveKey="0"
              tabBarExtraContent={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Button
                    type="primary"
                    className="button-vendor"
                    onClick={addNewProject}
                  >
                    <PlusOutlined /> Add New Project
                  </Button>
                </div>
              }
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProjectDashboard;
