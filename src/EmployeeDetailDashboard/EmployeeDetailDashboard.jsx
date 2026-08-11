// src/Dashboard/Dashboard.js
import React, { useContext, useState, useEffect } from "react";
import { Tabs, Card, Row, Col, Button, Flex, Drawer, Space, Tag, Collapse } from "antd";
import { RiseOutlined, PlusOutlined } from "@ant-design/icons";
import Newemployee from "../Newemployee/Newemployee";
import NewCustomer from "../Customer/NewCustomer";
import PieCharts, { getPieColors } from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import InvoiceCard from "../InvoiceCard/InvoiceCard";
import CurrentEmployeeCard from "../CurrentEmployeeCard/CurrentEmployeeCard";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import "./EmployeeDetailDashboard.css";
import WorkForceList from "../WorkForce/WorkForceList";
import AuthContext from "../Authentication/Context/AuthContext";
import { canAccessEntity } from "../Utils/roleAccess";
import API_ENDPOINTS from "../config";

const { Panel } = Collapse;

// key -> entity it depends on, so chart visibility derives from the same
// role permissions used everywhere else instead of a hand-maintained copy.
const CHART_ENTITY = {
  totalProjects: "project",
  revenue: "invoice",
  invoiceStatus: "invoice",
  workforceStatus: "team",
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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
        const labels = data1.map((item) => item.status);
        const chartData = data1.map((item) => item.count);
        setWorkForceChartLabels(labels);
        setWorkForceChartData(chartData);

        const response2 = await fetch(API_ENDPOINTS.invoicesCountByStatus);
        const data2 = await response2.json();
        const labels2 = data2.map((item) => item.status);
        const chartData2 = data2.map((item) => item.count);
        console.log(labels2);
        console.log(chartData2);
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
    workForceChartData[0] +
    workForceChartData[1] +
    workForceChartData[2] +
    workForceChartData[3];
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
      title: "Total Work Force",
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
  const visibleOverviewCharts = dashboardOverviewCharts.filter((c) =>
    canAccessEntity(user?.role, CHART_ENTITY[c.key]),
  );
  const { settingsContent, contentNode } = useChartOverview(visibleOverviewCharts);

  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [customerDrawerVisible, setCustomerDrawerVisible] = useState(false);

  const showEmployeeDrawer = () => {
    setEmployeeDrawerVisible(true);
  };

  const showCustomerDrawer = () => {
    setCustomerDrawerVisible(true);
  };

  const onClose = () => {
    setEmployeeDrawerVisible(false);
    setCustomerDrawerVisible(false);
  };

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

  const employeeData = [
    {
      id: 1,
      name: "John Doe",
      position: "Software Engineer",
      department: "Engineering",
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Product Manager",
      department: "Product",
    },
    {
      id: 3,
      name: "Alice Johnson",
      position: "UX Designer",
      department: "Design",
    },
    {
      id: 4,
      name: "Bob Brown",
      position: "Data Scientist",
      department: "Data Science",
    },
    {
      id: 5,
      name: "Ella Davis",
      position: "Marketing Specialist",
      department: "Marketing",
    },
    // Add more sample data as needed
  ];

  const items = [
    {
      key: 1,
      label: "Invoices",
      children: <InvoiceCard employeeData={employeeData} />,
    },
    {
      key: 2,
      label: "Employee List",
      children: <WorkForceList />,
    },
  ].filter((item) => item.label !== "Invoices" || canAccessEntity(user?.role, "invoice"));
  const toggleTabs = (e) => {};

  return (
    <>
      <Row justify={"end"}>
        <Col span={12} className="welCCol">
          <h1 className="mrgBtm10 WelcomeHeading" data-text="Welcome Back">
            Welcome Back
          </h1>
          <p>Suresh.K(suresh@beeninfosystems.com)</p>
        </Col>
        <Col span={12} className="buttonsBar">
          <Flex gap="small" vertical align="end">
            <Flex gap="small" wrap="wrap">
              {canAccessEntity(user?.role, "invoice") && <Button>Generate Invoice</Button>}
              {canAccessEntity(user?.role, "customer") && (
                <Button type="primary" onClick={showCustomerDrawer}>
                  <PlusOutlined /> Add New Customer
                </Button>
              )}
              {canAccessEntity(user?.role, "team") && (
                <Button type="primary" onClick={showEmployeeDrawer}>
                  <PlusOutlined /> Add New Employee
                </Button>
              )}
            </Flex>
          </Flex>
        </Col>
      </Row>
      <Drawer
        title={`Employee Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        visible={employeeDrawerVisible}
      >
        <Newemployee />
      </Drawer>
      <Drawer
        title={`Customer Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        visible={customerDrawerVisible}
      >
        {/* Use the NewCustomer component */}
        <NewCustomer />
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
        <Card>
          <Tabs
            className="bean-home-tabs"
            defaultActiveKey="1"
            onChange={toggleTabs}
            items={items}
            tabBarExtraContent={
              canAccessEntity(user?.role, "invoice") && (
                <Flex gap="small" wrap="wrap">
                  <Button> Add Invoice </Button>
                  <Button type="primary" onClick={showCustomerDrawer}>
                    <PlusOutlined /> Add Expense
                  </Button>
                  <Button type="primary" onClick={showEmployeeDrawer}>
                    <PlusOutlined /> Add Payment
                  </Button>
                </Flex>
              )
            }
          ></Tabs>
        </Card>
      </>
    </>
  );
};

export default Dashboard;
