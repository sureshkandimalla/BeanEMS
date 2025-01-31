import React, { useMemo, useState, useEffect, useRef } from "react";
import "@ag-grid-community/styles/ag-grid.css";
import { DesktopOutlined, RiseOutlined, PlusOutlined } from "@ant-design/icons";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import { Col, Row, Card, Button, Tabs,Collapse, Drawer, Spin } from "antd";
import ProjectOnBoardingForm from "../OnBoardingComponent/ProjectOnBoarding";
import "./ProjectDashboard.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import ProjectList from "./ProjectsList";

const { Panel } = Collapse;

const ProjectDashboard = () => {
  const [rowData, setRowData] = useState();
  const [activeKey, setActiveKey] = useState("0"); // State for active tab
  const projectsSize = rowData ? rowData.length : 0;
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];
  const [isEmployeesLoading, setEmployeeLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isInitialRender = useRef(true);

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
      active: rowData.filter(({ status }) => status === "ACTIVE"),
    };
  }, [rowData]);

  const items = [
    {
      key: "1",
      label: "Active",
      children: <ProjectList projectsList={processedData?.active} isCollapsed={isCollapsed}  />,
    },
    {
      key: "2",
      label: "All",
      children: <ProjectList projectsList={rowData} isCollapsed={isCollapsed}  />,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialRender.current) {
        try {
          const response = await fetch(
            "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/getProjects"
          );
          const data = await response.json();
          const flattendData = getFlattenedData(data);
          setRowData(flattendData);
          setEmployeeLoading(false);
          console.log(flattendData);
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
    let updatedData = data.map((dataObj) => {
      return { ...dataObj };

      // return { ...dataObj,...dataObj.assignments[0],...dataObj.employee.firstName.value, ...dataObj.employee.employeeAssignments[0],...dataObj.customer,...dataObj.billRates[0] }
    });
    console.log(updatedData);
    return updatedData || [];
  };

  return (
    <>
      <div
        style={{
          height: "100vh", // Full viewport height
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Prevents unwanted scroll
        }}
      >
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
                      <span className="totalProjectsCount">{projectsSize}</span>
                    </Col>                    
                    <Col className="projectStatcol">
                      <RiseOutlined className="riseIcon" />{" "}
                      <span> vs Last Month</span>
                    </Col>
                  </Row>
                </Card>
              </Col>
             
              <Col xs={24} sm={17}>
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
                <Button
                  type="primary"
                  className="button-vendor"
                  onClick={addNewProject}
                >
                  <PlusOutlined /> Add New Project
                </Button>
              }
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProjectDashboard;
