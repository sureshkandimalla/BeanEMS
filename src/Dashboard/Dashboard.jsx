// src/Dashboard/Dashboard.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Flex, Drawer, Space, Tag, Tabs, Collapse } from "antd";
import { RiseOutlined, PlusOutlined } from "@ant-design/icons";
import Newemployee from "../Newemployee/Newemployee";
import NewCustomer from "../Customer/NewCustomer";
import PieCharts, { getPieColors } from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import InvoiceDetails from "../Invoice/InvoiceDetails";
import CurrentEmployeeCard from "../CurrentEmployeeCard/CurrentEmployeeCard";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import "./Dashboard.css";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
import API_ENDPOINTS from "../config";

const { Panel } = Collapse;

const Dashboard = () => {
  //addedchangesstart
  const [rowData, setRowData] = useState([]);
  const [workForceChartData, setWorkForceChartData] = useState([]);
  const [workForceChartLabels, setWorkForceChartLabels] = useState([]);
  const [invoicesChartData, setInvoicesChartData] = useState([]);
  const [invoicesChartLabels, setInvoicesChartLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await fetch(API_ENDPOINTS.employeesCountByStatus);
        const data1 = await response1.json();

        // Assuming the response from your API is an array of objects with 'label' and 'value' properties
        const labels = data1
          .filter((item) => item.status !== null)
          .map((item) => item.status);
        const chartData = data1
          .filter((item) => item.status !== null)
          .map((item) => item.count);
        setWorkForceChartLabels(labels);
        setWorkForceChartData(chartData);

        const response2 = await fetch(API_ENDPOINTS.invoicesCountByStatus);
        const data2 = await response2.json();
        const labels2 = data2.map((item) => item.status);
        const chartData2 = data2.map((item) => item.count);
        setInvoicesChartLabels(labels2);
        setInvoicesChartData(chartData2);

        const response3 = await fetch(API_ENDPOINTS.getProjects);
        const data3 = await response3.json();
        setRowData(data3);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalParamCount =
    (workForceChartData[0] || 0) +
    (workForceChartData[1] || 0) +
    (workForceChartData[2] || 0) +
    (workForceChartData[3] || 0);
  const projectsSize = rowData ? rowData.length : 0;

  // Same slice order/values feed both the donut (via PieCharts, legend
  // hidden) and the custom legend beside it, so colors always match.
  const invoicesSlices = invoicesChartLabels.map((label, i) => ({
    label,
    value: invoicesChartData[i] || 0,
    color: getPieColors(invoicesChartLabels.length)[i],
  }));
  const workForceSlices = workForceChartLabels.map((label, i) => ({
    label,
    value: workForceChartData[i] || 0,
    color: getPieColors(workForceChartLabels.length)[i],
  }));

  // Sample revenue data for this month and last month (you can replace it with your actual data)
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];

  // Chart definitions for the Dashboard Overview area — useChartOverview
  // handles show/hide, drag-to-reorder, drag-to-resize, and PNG download
  // generically from this list. The "Total Active Projects" stat card is
  // included too (just without a `filename`, so it gets no download
  // button) so it can be moved/resized right alongside the real charts —
  // leaving it fixed outside the flex-wrap area caused layout gaps once
  // the charts beside it got reordered or resized.
  const dashboardOverviewCharts = [
    {
      key: "totalProjects",
      label: "Total Active Projects",
      title: "Total Active Projects",
      defaultSize: { width: 320, height: 220 },
      render: () => (
        <Row justify="space-between" className="mrgtop145">
          <Col>
            <span className="totalProjectsCount">{projectsSize}</span>
          </Col>
        </Row>
      ),
    },
    {
      key: "revenue",
      label: "Total Revenue",
      title: "Total Revenue: $66,143.00",
      filename: "total-revenue",
      defaultSize: { width: 700, height: 340 },
      render: (innerHeight, setChartRef) => (
        <RevenueCharts ref={setChartRef} thisMonthData={thisMonthData} lastMonthData={lastMonthData} height={innerHeight} />
      ),
    },
    {
      key: "invoiceStatus",
      label: "Invoice Status",
      filename: "invoice-status",
      defaultSize: { width: 480, height: 300 },
      render: (innerHeight, setChartRef) => (
        <Row align="middle">
          <Col span={14}>
            <div style={{ width: "100%", height: innerHeight }}>
              <PieCharts ref={setChartRef} chartData={invoicesChartData} chartLabels={invoicesChartLabels} showLegend={false} />
            </div>
          </Col>
          <Col span={10}>
            <PieLegend slices={invoicesSlices} fontSize={13} rowGap={6} />
          </Col>
        </Row>
      ),
    },
    {
      key: "workforceStatus",
      label: "Workforce Status",
      filename: "workforce-status",
      defaultSize: { width: 560, height: 300 },
      render: (innerHeight, setChartRef) => (
        <Row align="middle">
          <Col span={10}>
            <div style={{ width: "100%", height: innerHeight }}>
              <PieCharts ref={setChartRef} chartData={workForceChartData} chartLabels={workForceChartLabels} showLegend={false} />
            </div>
          </Col>
          <Col span={8}>
            <PieLegend slices={workForceSlices} fontSize={13} rowGap={6} />
          </Col>
          <Col span={6}>
            <div className="totalWorkFrcDiv">
              <Row justify="space-between">
                <span className="totalWorkForceCount">{totalParamCount}</span>
                <span className="mrgTop15">
                  <RiseOutlined className="riseIcon" /> <span> 3.5%</span>
                </span>
              </Row>
            </div>
          </Col>
        </Row>
      ),
    },
  ];
  const { settingsContent, contentNode } = useChartOverview(dashboardOverviewCharts);

  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [customerDrawerVisible, setCustomerDrawerVisible] = useState(false);
  const [projectDrawerVisible, setProjectDrawerVisible] = useState(false);

  const showEmployeeDrawer = () => {
    setEmployeeDrawerVisible(true);
  };

  const showCustomerDrawer = () => {
    setCustomerDrawerVisible(true);
  };

  const showProjectDrawer = () => {
    setProjectDrawerVisible(true);
  };

  const onClose = () => {
    setEmployeeDrawerVisible(false);
    setCustomerDrawerVisible(false);
    setProjectDrawerVisible(false);
  };

  //added changes end

  // Sample data (you can replace it with your actual data) for Pie Charts

  //const invoicesChartData = [30,20,20];
  //const invoicesChartLabels = ['Upcoming', 'Pending','Over Dew'];
  //const totalWorkForceChartData = [46,9,15,11];
  //const totalWorkForceLabels = ['On Boarding', 'Bench','New Hires','Active'];
  //const totalParamCount = totalWorkForceChartData[0] + totalWorkForceChartData[1] + totalWorkForceChartData[2] + totalWorkForceChartData[3];

  const [open, setOpen] = useState(false);
  const addNewEmployee = () => {
    setOpen(true);
  };
  const onClose1 = () => {
    setOpen(false);
  };
  const addNewCustomer = () => {
    setOpen(true);
  };
  const addNewProject = () => {
    setOpen(true);
  };

  const invoiceStatusTabs = [
    { key: "all", label: "All", statusFilter: undefined },
    { key: "created", label: "Created", statusFilter: "Created" },
    { key: "paid", label: "Paid", statusFilter: "Paid" },
    { key: "partiallyPaid", label: "Partially Paid", statusFilter: "Partially Paid" },
  ];

  return (
    <>
      <Row justify={"end"}>
        <Col span={8} className="welCCol">
          <h1 className="mrgBtm10 WelcomeHeading" data-text="Welcome Back">
            Welcome Back
          </h1>
          <p>{JSON.parse(localStorage.getItem("user")).email}</p>
        </Col>
        <Col span={16} className="buttonsBar">
          <Flex gap="small" wrap={false} justify="end" align="center">
            <Flex gap="small" wrap="wrap">
              <Button>Generate Invoice</Button>
              <Button type="primary" onClick={showCustomerDrawer}>
                <PlusOutlined /> Add New Customer
              </Button>
              <Button type="primary" onClick={showEmployeeDrawer}>
                <PlusOutlined /> Add New Employee
              </Button>
              <Button type="primary" onClick={showProjectDrawer}>
                <PlusOutlined /> Add New Project
              </Button>
            </Flex>
          </Flex>
        </Col>
      </Row>
      <Drawer
        title={`Employee Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        open={employeeDrawerVisible}
      >
        <Newemployee onClose={onClose} />
      </Drawer>
      <Drawer
        title={`Customer Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        open={customerDrawerVisible}
      >
        {/* Use the NewCustomer component */}
        <NewCustomer />
      </Drawer>
      <Drawer
        title={`Project Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        open={projectDrawerVisible}
      >
        {/* Use the NewCustomer component */}
        <ProjectOnBoardingForm />
      </Drawer>
      <Collapse style={{ marginBottom: 10 }}>
        <Panel
          header="Dashboard Overview"
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
      <>
        <Row gutter={16}>
          <Col span={17}>
            <Card title="Invoice Status" className="invoiceCard">
              <Tabs
                defaultActiveKey="all"
                items={invoiceStatusTabs.map((tab) => ({
                  key: tab.key,
                  label: tab.label,
                  children: (
                    <div style={{ height: 650 }}>
                      <InvoiceDetails statusFilter={tab.statusFilter} />
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>

          <Col span={7}>
            <Card
              title="Current Employees"
              className="currentEmployeesCard"
              style={{ height: "100%" }}
            >
              <CurrentEmployeeCard />
            </Card>
          </Col>
        </Row>
      </>
    </>
  );
};

export default Dashboard;
