import React, { useState, useEffect, useRef } from "react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ProjectFullDetails.css";
import { useLocation } from "react-router-dom";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import ProjectPersonalFile from "./ProjectPersonalFile";
import AssignmentDetails from "./AssignmentDetails";
import WorkOrderDetails from "./WorkOrderDetails";
import InvoiceById from "../Invoice/InvoiceById";
import BillingDetails from "../Billings/BillingDetails";
import { UpOutlined, DownOutlined,CalendarOutlined, DollarOutlined, ProjectOutlined, BankOutlined, UserOutlined } from "@ant-design/icons";
import { Tabs, Card,Typography,Collapse, Row, Col, Button, Drawer, Spin, message } from "antd";
//const style: React.CSSProperties = { background: '#A9A9A9', padding: '8px 0' ,paddingLeft: '8px 0'};

const { Panel } = Collapse;


const ProjectFullDetails = () => {
  const isInitialRender = useRef(true);
  const [isCollapsed, setIsCollapsed] = useState(false);


  const divStyle = {
    //     height: '95%', // Set the desired height in pixels or any other valid CSS unit
    border: "1px solid #ccc",
    padding: "20px",
    background: "#ffffff",
    //border: '0px solid #ccc',
  };
  const handleClick = () => {
    // Your logic or actions when the button is clicked
    console.log("Button clicked!");
  };
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];
  const location = useLocation();
  const { rowData } = location.state;
  console.log(rowData);
  console.log(rowData.projectId);
  localStorage.setItem("projectName", rowData.projectName);
  localStorage.setItem("projectId", rowData.projectId);
  const [responseData, setResponseData] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isInitialRender.current) {
        try {
          const response = await fetch(
            `http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/projects/${rowData.projectId}`,
          );
          const data = await response.json();
          const flattendData = getFlattenedData(data);
          console.log(flattendData)
          setResponseData(flattendData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        isInitialRender.current = false;
      }
    };

    fetchData();
  }, []);

  const getFlattenedData = (data) => {
    setAssignments(data.assignments);
    setWorkOrders(data.billRates);
    return {
      ...data,
      ...(data.assignments ? data.assignments : {}),
      ...(data.employee ? { firstName: data.employee.firstName.value } : {}),
      ...(data.employee ? data.employee : {}),
      ...(data.customer ? { customer: data.customer } : {}),
      ...(data.billRates ? data.billRates[0] : {}),
    };
  };

  const { TabPane } = Tabs;
  //const history = useHistory();
  const items = [
    {
      key: 1,
      label: "PROJECT SUMMARY",
      title: "Project Summary Page /",
      children: <ProjectPersonalFile rowData={rowData} />,
    },
    {
      key: 2,
      label: "Assignments",
      title: "Assignments",
      children: <AssignmentDetails projectId={rowData.projectId} isCollapsed={isCollapsed} />,
    },
    {
      key: 3,
      label: "WorkOrders",
      children: <WorkOrderDetails rowData={workOrders}  isCollapsed={isCollapsed}/>,
    },
    {
      key: 4,
      label: "Invoices",
      children: (
        <InvoiceById
          url={`http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/invoice/getInvoicesForProject?projectId=${rowData.projectId}`}
          employeeId={rowData.employeeId}
          isCollapsed={isCollapsed}
        />
      ),
    },
    {
      key: 5,
      label: "BillingDetails",
      children: (
        <BillingDetails
          url={`http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/bills/getBillsForProject?projectId=${rowData.projectId}`}
          isCollapsed={isCollapsed}
        />
      ),
    },
  ];
  
  const handleCollapseChange = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (  
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                <span style={{ fontWeight: "bold" }}>Project Overview</span>
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
                  <ProjectOutlined style={{ marginRight: 5, color: "#1890ff" }} />
                  Project: {responseData.projectName}
                </Typography.Text>
                <br />
                <Typography.Text className="designation-style">
                  <BankOutlined style={{ marginRight: 5, color: "#52c41a" }} />
                  {responseData.customer?.customerName}
                </Typography.Text>
                <Typography.Text
                  style={{ float: "right", color: "black", fontSize: "10px" }}
                >
                  <UserOutlined style={{ marginRight: 5, color: "#faad14" }} />
                  {responseData.employeeName}
                </Typography.Text>
                </Card>
              )}
              {/* </Col> */}
  
              {/* Bill Rate & Dates
              <Col xs={24} sm={8}>
                <Card> */}
                  <div className="details-row">
                    <div className="field">
                    <Typography.Text>
                      <DollarOutlined style={{ marginRight: 5, color: "#13c2c2" }} />
                      <b>Bill Rate:</b> {responseData?.wage}
                    </Typography.Text>
                  </div>
                  <div className="field">
                    <Typography.Text>
                      <CalendarOutlined style={{ marginRight: 5, color: "#722ed1" }} />
                      <b>Start Date:</b> {responseData?.startDate}
                    </Typography.Text>
                  </div>
                  <div className="field">
                    <Typography.Text>
                      <CalendarOutlined style={{ marginRight: 5, color: "#eb2f96" }} />
                      <b>End Date:</b> {responseData?.endDate}
                    </Typography.Text>
                    </div>
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

export default ProjectFullDetails;
