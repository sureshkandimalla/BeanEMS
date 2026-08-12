// src/Dashboard/Dashboard.js
import React, { useContext, useState } from "react";
import { Card, Row, Col, Button, Flex, Drawer, Space, Tag, Tabs, Collapse } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Newemployee from "../Newemployee/Newemployee";
import NewCustomer from "../Customer/NewCustomer";
import InvoiceDetails from "../Invoice/InvoiceDetails";
import CurrentEmployeeCard from "../CurrentEmployeeCard/CurrentEmployeeCard";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { GLOBAL_CHARTS } from "../Charts/globalChartRegistry";
import "./Dashboard.css";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
import AuthContext from "../Authentication/Context/AuthContext";
import { canAccessEntity } from "../Utils/roleAccess";

const { Panel } = Collapse;

// key -> entity it depends on, so chart visibility derives from the same
// role permissions used everywhere else instead of a hand-maintained copy.
const CHART_ENTITY = {
  totalActiveProjects: "project",
  revenueTrend: "invoice",
  invoiceStatus: "invoice",
  workforceStatus: "team",
};
const DASHBOARD_CHART_KEYS = ["totalActiveProjects", "revenueTrend", "invoiceStatus", "workforceStatus"];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  //addedchangesstart
  const visibleOverviewCharts = GLOBAL_CHARTS.filter(
    (c) => DASHBOARD_CHART_KEYS.includes(c.key) && canAccessEntity(user?.role, CHART_ENTITY[c.key]),
  );
  const { settingsContent, contentNode } = useChartOverview(visibleOverviewCharts);

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
              {canAccessEntity(user?.role, "project") && (
                <Button type="primary" onClick={showProjectDrawer}>
                  <PlusOutlined /> Add New Project
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
          {canAccessEntity(user?.role, "invoice") && (
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
          )}

          <Col span={canAccessEntity(user?.role, "invoice") ? 7 : 24}>
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
