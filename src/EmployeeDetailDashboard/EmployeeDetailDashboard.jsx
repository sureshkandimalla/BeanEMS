// src/Dashboard/Dashboard.js
import React, { useContext, useState } from "react";
import { Tabs, Card, Row, Col, Button, Flex, Drawer, Space, Tag, Collapse } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Newemployee from "../Newemployee/Newemployee";
import NewCustomer from "../Customer/NewCustomer";
import InvoiceCard from "../InvoiceCard/InvoiceCard";
import CurrentEmployeeCard from "../CurrentEmployeeCard/CurrentEmployeeCard";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
import { GLOBAL_CHARTS } from "../Charts/globalChartRegistry";
import "./EmployeeDetailDashboard.css";
import WorkForceList from "../WorkForce/WorkForceList";
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
