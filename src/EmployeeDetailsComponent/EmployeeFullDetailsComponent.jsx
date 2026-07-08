import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../config";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./EmployeeFullDetailsComponent.css";
import ProjectGrid from "../Project/ProjectGrid";
import { useLocation } from "react-router-dom";
import EmployeePersonnelFilePage from "../EmployeeDetailsComponent/EmployeePersonnelFilePage";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import InvoiceDetails from "../Invoice/InvoiceDetails";
import PayrollDetails from "../Payroll/PayrollDetails";
import AdjustementDetails from "../Adjustments/AdjustmentDetails";
import ReconciliationDetails from "../Reconciliation/ReconciliationDetails";
import FinalReportDetails from "../Reconciliation/FinalReportDetails";
import BillingDetails from "../Billings/BillingDetails";
import PassportController from "../Passport/PassportController";
import { UpOutlined, DownOutlined,CalendarOutlined, DollarOutlined,MailOutlined,PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Tabs, Card,Typography,Collapse, Row, Col, Button, Drawer, Spin, message } from "antd";

const { Panel } = Collapse;

const EmployeeFullDetails = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);  
  const divStyle = {
    border: "1px solid #ccc",
    padding: "20px",
    background: "#ffffff",
  };
  const handleClick = () => {
    console.log("Button clicked!");
  };
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];
  const location = useLocation();
  const { rowData } = location.state || {};
  console.log(location.state);
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    console.log("rowData:", rowData);
    setResponseData(rowData);
  }, [rowData]);

  const { TabPane } = Tabs;
  //const history = useHistory();
  const gridHeight = isCollapsed ? "calc(100vh - 560px)" : "calc(100vh - 320px)";
  const items = [
    {
      key: 1,
      label: "PERSONNEL FILE",
      title: "EmployeePersonnelFilePage /",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <EmployeePersonnelFilePage />
        </div>
      ),
    },
    {
      key: 2,
      label: "PROJECTS",
      title: "Emplyee Projects",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <ProjectGrid employeeId={rowData.employeeId} isCollapsed={isCollapsed} />
        </div>
      ),
    },
    {
      key: 3,
      label: "INVOICES",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <InvoiceDetails
            employeeId={rowData.employeeId}
            isCollapsed={isCollapsed}
            gridHeight={gridHeight}
          />
        </div>
      ),
    },
    {
      key: 4,
      label: "PAYROLLS",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <PayrollDetails
            employeeId={rowData.employeeId}
            isCollapsed={isCollapsed}
            gridHeight={gridHeight}
          />
        </div>
      ),
    },
    {
      key: 5,
      label: "ADJUSTMENTS",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <AdjustementDetails employeeId={rowData.employeeId} isCollapsed={isCollapsed} />
        </div>
      ),
    },
    {
      key: 6,
      label: "RECONCILIATION",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <ReconciliationDetails employeeId={rowData.employeeId} isCollapsed={isCollapsed} />
        </div>
      ),
    },
    {
      key: 7,
      label: "Bills",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <BillingDetails
            url={`${API_ENDPOINTS.getBillsForEmployee}?employeeId=${rowData.employeeId}`}
            isCollapsed={isCollapsed}
          />
        </div>
      ),
    },
    {
      key: 8,
      label: "WA",
      title: "WORK AUTHORIZATION",
    },
    {
      key: 9,
      label: "FORMS",
    },
    {
      key: 10,
      label: "TASKS",
    },
    {
      key: 11,
      label: "EVALUATION",
    },
    {
      key: 12,
      label: "LEAVE REPORT",
    },
    {
      key: 13,
      label: "FINAL REPORT",
      children: (
        <div className="employee-List-grid" style={{ height: "100%" }}>
          <FinalReportDetails employeeId={rowData.employeeId} />
        </div>
      ),
    },
  ];

  const toggleTabs = (e) => {
    //TODO
  };

  const handleCollapseChange = () => {
    setIsCollapsed(!isCollapsed);
  };

  function toggleContent() {
    alert("toogle");
  }
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Collapsible Left Section */}
      <Collapse
        activeKey={isCollapsed ? "1" : null}
        onChange={handleCollapseChange}
        style={{
          flex: isCollapsed ? "0 0 25%" : "0 0 5%", // Shrinks when collapsed
          marginBottom: "10px",
          transition: "flex 0.3s ease-in-out",
        }}
      >
        <Panel
          header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold" }}>Employee Overview</span>
              <Button
                type="text"
                icon={isCollapsed ? <UpOutlined /> : <DownOutlined />}
                onClick={handleCollapseChange}
              />
            </div>
          }
          key="1"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              {responseData && (
                <Card className="responsive-card" style={{ width: "100%" }}>
                  <Typography.Text className="name-span" style={{ color: "blue", fontSize: "20px" }}>
                    <UserOutlined style={{ marginRight: 5, color: "#1890ff" }} />
                    {responseData.firstName} {responseData.lastName}
                  </Typography.Text>
                  <br />
                  <Typography.Text className="designation-style">
                    {responseData.designation}
                  </Typography.Text>
                  <Typography.Text
                    style={{ float: "right", color: "black", fontSize: "10px" }}
                  >
                    {responseData.employmentType}
                  </Typography.Text>
                  <div style={{ marginTop: "10px" }}>
                    <Typography.Text>
                      <MailOutlined style={{ marginRight: 5 }} />
                      {responseData.emailId}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text>
                      <PhoneOutlined style={{ marginRight: 5 }} />
                      {responseData.phone}
                    </Typography.Text>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <PassportController
                      showTrigger
                      triggerLabel="Add Passport"
                      employeeData={responseData}
                    />
                  </div>
                </Card>
              )}

            {/* // <Col xs={24} sm={8}> */}
              {/* <Card> */}
                <div className="details-row">
                  <Typography.Text>
                    <DollarOutlined style={{ marginRight: 5, color: "#13c2c2" }} />
                    <b>Bill Rate:</b> {responseData?.wage}
                  </Typography.Text>
                </div>
                <div className="details-row">
                  <Typography.Text>
                    <CalendarOutlined style={{ marginRight: 5, color: "#722ed1" }} />
                    <b>Start Date:</b> {responseData?.startDate}
                  </Typography.Text>
                </div>
                <div className="details-row">
                  <Typography.Text>
                    <CalendarOutlined style={{ marginRight: 5, color: "#eb2f96" }} />
                    <b>End Date:</b> {responseData?.endDate}
                  </Typography.Text>
                </div> 
              </Col>             

            {/* Total Revenue & Chart */}
            <Col xs={24} sm={16}>
              <Card className="totalRevenceCard">
                <span className="totalRevenueLabel">Total Revenue</span>
                <span className="totalRevenueCount">$66,143.00</span>
                <RevenueCharts thisMonthData={thisMonthData} lastMonthData={lastMonthData} />
              </Card>
            </Col>
          </Row>
        </Panel>
      </Collapse>

      {/* Right Section (Tabs) */}
      <div style={{ flex: "1", overflow: "hidden" }}>
        <Card className="employeeTableCard" style={{ height: "100%" }}>
          <Tabs className="bean-home-tabs" defaultActiveKey="2" items={items} />
        </Card>
      </div>
    </div>
  );
};

export default EmployeeFullDetails;
