import React, { useMemo, useState, useEffect } from "react";
import "@ag-grid-community/styles/ag-grid.css";
import { DesktopOutlined, RiseOutlined, PlusOutlined, BellOutlined } from "@ant-design/icons";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import PieCharts, { getPieColors } from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import { Col, Row, Card, Button, Tabs, Collapse, Drawer, Spin, Popover, Badge, List, Empty } from "antd";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
import "./ProjectDashboard.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import ProjectList from "./ProjectsList";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";

const { Panel } = Collapse;

const ProjectDashboard = () => {
  const [rowData, setRowData] = useState();
  const [activeKey, setActiveKey] = useState("0"); // State for active tab
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];
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

  // rowData has one row per bill-rate/wage period, so a project with
  // several wage periods would otherwise be counted more than once —
  // count distinct project IDs among the active rows instead.
  const activeProjectCount = useMemo(
    () => new Set((processedData.active || []).map((r) => r.projectId)).size,
    [processedData],
  );

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

  useEffect(() => {
    fetchData();
    fetchEmployees();
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
          <Panel header="Projects Overview" key="1">
            <Row gutter={[16, 16]} justify="center">            
              <Col xs={24} sm={7}>
                <Card className="totalProjectsCard">
                  <Row className="mrgTop15">
                    <Col>
                      <DesktopOutlined />{" "}
                      <span className="totalProjectLabel">
                        Total Active Projects
                      </span>
                    </Col>
                  </Row>
                  <Row justify="space-between" className="mrgtop145">
                    <Col>
                      <span className="totalProjectsCount">{activeProjectCount}</span>
                    </Col>                    
                    <Col className="projectStatcol">
                      <RiseOutlined className="riseIcon" />{" "}
                      <span> vs Last Month</span>
                    </Col>
                  </Row>
                </Card>
              </Col>
             
              <Col xs={24} sm={10}>
                <Card className="totalRevenceCard">
                  <>
                    <span className="totalRevenueLabel">Total Revenue</span>
                    <span className="totalRevenueCount">$66,143.00</span>
                  </>
                  <RevenueCharts
                    thisMonthData={thisMonthData}
                    lastMonthData={lastMonthData}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={7}>
                <Card className="totalRevenceCard">
                  <span className="totalRevenueLabel">
                    Bill Rate: {formatCurrency(billRateBreakdown.totalBillRate)}
                  </span>
                  {billRateBreakdown.totalBillRate > 0 ? (
                    <Row align="middle">
                      <Col span={14}>
                        <div style={{ width: "100%", height: 320 }}>
                          <PieCharts
                            chartData={billRateSlices.map((s) => Math.round(s.value))}
                            chartLabels={billRateSlices.map((s) => s.label)}
                            showLegend={false}
                          />
                        </div>
                      </Col>
                      <Col span={10}>
                        <PieLegend slices={billRateSlices} valueFormatter={formatCurrency} />
                      </Col>
                    </Row>
                  ) : (
                    <Empty description="No bill rate data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              </Col>
            </Row>
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
                  <Popover
                    content={alertContent}
                    title="Project Alerts"
                    trigger="click"
                    placement="bottomRight"
                  >
                    <Badge count={projectAlerts.length} size="small">
                      <Button icon={<BellOutlined />} />
                    </Badge>
                  </Popover>
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
