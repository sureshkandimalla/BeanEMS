// src/Dashboard/Dashboard.js
import React, { useState, useEffect, useRef } from "react";
import { Card, Row, Col, Button, Flex, Drawer, Space, Tag } from "antd";
import { DesktopOutlined, RiseOutlined, PlusOutlined } from "@ant-design/icons";
import Newemployee from "../Newemployee/Newemployee";
import Newvendor from "../Vendor/NewVendor";
import PieCharts from "../PieCharts/PieCharts";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import InvoiceCard from "../InvoiceCard/InvoiceCard";
import CurrentEmployeeCard from "../CurrentEmployeeCard/CurrentEmployeeCard";
import "./Dashboard.css";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
const Dashboard = () => {
  //addedchangesstart
  const [rowData, setRowData] = useState();
  const [workForceChartData, setWorkForceChartData] = useState([]);
  const [workForceChartLabels, setWorkForceChartLabels] = useState([]);
  const [invoicesChartData, setInvoicesChartData] = useState([]);
  const [invoicesChartLabels, setInvoicesChartLabels] = useState([]);
  const isInitialRender = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isInitialRender.current) {
        try {
          const response1 = await fetch(
            "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/employees/employeesCountByStatus",
          );
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

          const response2 = await fetch(
            "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/invoice/invoicesCountByStatus",
          );
          const data2 = await response2.json();
          const labels2 = data2.map((item) => item.status);
          const chartData2 = data2.map((item) => item.count);
          setInvoicesChartLabels(labels2);
          setInvoicesChartData(chartData2);

          const response3 = await fetch(
            "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/getProjects",
          );
          const data3 = await response3.json();
          setRowData(data3);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        isInitialRender.current = false;
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

  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [vendorDrawerVisible, setVendorDrawerVisible] = useState(false);
  const [projectDrawerVisible, setProjectDrawerVisible] = useState(false);

  const showEmployeeDrawer = () => {
    setEmployeeDrawerVisible(true);
  };

  const showVendorDrawer = () => {
    setVendorDrawerVisible(true);
  };

  const showProjectDrawer = () => {
    setProjectDrawerVisible(true);
  };

  const onClose = () => {
    setEmployeeDrawerVisible(false);
    setVendorDrawerVisible(false);
    setProjectDrawerVisible(false);
  };

  //added changes end

  // Sample data (you can replace it with your actual data) for Pie Charts

  //const invoicesChartData = [30,20,20];
  //const invoicesChartLabels = ['Upcoming', 'Pending','Over Dew'];
  //const totalWorkForceChartData = [46,9,15,11];
  //const totalWorkForceLabels = ['On Boarding', 'Bench','New Hires','Active'];
  //const totalParamCount = totalWorkForceChartData[0] + totalWorkForceChartData[1] + totalWorkForceChartData[2] + totalWorkForceChartData[3];

  // Sample revenue data for this month and last month (you can replace it with your actual data)
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];
  const [open, setOpen] = useState(false);
  const addNewEmployee = () => {
    setOpen(true);
  };
  const onClose1 = () => {
    setOpen(false);
  };
  const addNewVendor = () => {
    setOpen(true);
  };
  const addNewProject = () => {
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
              <Button type="primary" onClick={showVendorDrawer}>
                <PlusOutlined /> Add New Vendor
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
        visible={employeeDrawerVisible}
      >
        <Newemployee />
      </Drawer>
      <Drawer
        title={`Vendor Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        visible={vendorDrawerVisible}
      >
        {/* Use the NewVendor component */}
        <Newvendor />
      </Drawer>
      <Drawer
        title={`Project Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        visible={projectDrawerVisible}
      >
        {/* Use the NewVendor component */}
        <ProjectOnBoardingForm />
      </Drawer>
      <>
        <Row gutter={16}>
          <Col span={7}>
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
                  <span className="totalProjectsCount">{projectsSize}</span>
                </Col>
                {/* should add icon dynamicall based on logic */}
                <Col className="projectStatcol">
                  <RiseOutlined className="riseIcon" />{" "}
                  <span> vs Last Month</span>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={17}>
            <div>
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
            </div>
          </Col>
        </Row>
      </>
      <>
        <Row gutter={16}>
          <Col span={17}>
            <Row>
              <Col span={10}>
                <Card className="invoiceStatusCard">
                  <span className="invoiceCardTitle">Invoice Status</span>
                  <PieCharts
                    chartData={invoicesChartData}
                    chartLabels={invoicesChartLabels}
                  />
                </Card>
              </Col>
              <Col span={14}>
                <Card className="totalworkForceCard">
                  <Row>
                    <Col span={18}>
                      <PieCharts
                        chartData={workForceChartData}
                        chartLabels={workForceChartLabels}
                      />
                    </Col>
                    <Col span={6}>
                      <div className="totalWorkFrcDiv">
                        <span
                          className="totalWorkTitle"
                          style={{ marginTop: "10px" }}
                        >
                          Total Work Force
                        </span>
                        <Row justify="space-between">
                          <span className="totalWorkForceCount">
                            {totalParamCount}
                          </span>
                          <span className="mrgTop15">
                            <RiseOutlined className="riseIcon" />{" "}
                            <span> 3.5%</span>
                          </span>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Invoice Status" className="invoiceCard">
                  <InvoiceCard employeeData={employeeData} />
                </Card>
              </Col>
            </Row>
          </Col>

          <Col span={7}>
            <Card title="Current Employees" className="currentEmployeesCard">
              <CurrentEmployeeCard />
            </Card>
          </Col>
        </Row>
      </>
    </>
  );
};

export default Dashboard;
