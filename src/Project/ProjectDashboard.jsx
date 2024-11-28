import React, { useMemo,useState, useEffect,useRef } from "react";
import "@ag-grid-community/styles/ag-grid.css";
import './ProjectGrid.css';
import {DesktopOutlined,RiseOutlined,PlusOutlined} from '@ant-design/icons';
import RevenueCharts from '../RevenueCharts/RevenueCharts';
import { Col, Row ,Card, Button, Tabs, Drawer, Spin  } from 'antd';
import ProjectOnBoardingForm from '../OnBoardingComponent/ProjectOnBoarding';
import './ProjectGrid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import ProjectList from "./ProjectsList";

const ProjectDashboard = () => {

  const [rowData, setRowData] = useState();
  const [activeKey, setActiveKey] = useState("1"); // State for active tab
  const projectsSize = rowData ? rowData.length : 0
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];
  const[isEmployeesLoading, setEmployeeLoading] = useState(true);

  const isInitialRender = useRef(true);

  const addNewProject = () => {
    setOpen(true);
  };

const onClose = () => {
  setOpen(false);
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
  { key: '1', label: 'All', children: <ProjectList projectsList={rowData} />},
  { key: '2', label: 'Active', children: <ProjectList projectsList={processedData?.active} /> }  
];

useEffect(() => {
  const fetchData = async () => {
      if (!isInitialRender.current) {
          try {
            const response = await fetch('http://localhost:8080/api/v1/getProjects');
              const data = await response.json();
              const flattendData = getFlattenedData(data)
              setRowData(flattendData); 
              setEmployeeLoading(false);
              console.log(flattendData)                     
          } catch (error) {
              console.error('Error fetching data:', error);
          }
      } else {
          isInitialRender.current = false;
      }
  };

  fetchData();
}, []);

const getFlattenedData = (data) => {

    let updatedData = data.map((dataObj) => {
    return { ...dataObj}

       // return { ...dataObj,...dataObj.assignments[0],...dataObj.employee.firstName.value, ...dataObj.employee.employeeAssignments[0],...dataObj.customer,...dataObj.billRates[0] }
    });
    console.log(updatedData)
    return updatedData || [];
}

return (
  <>  
            <>
                <Row gutter={16}>
                    <Col span={7}>
                        <Card className='totalProjectsCard'>
                            <Row className='mrgTop15'>
                                <Col><DesktopOutlined/> <span className='totalProjectLabel'>Total Active Projects</span></Col>
                            </Row>
                            <Row justify="space-between" className='mrgtop145'>
                                <Col><span className='totalProjectsCount'>{projectsSize}</span></Col>
                                {/* should add icon dynamicall based on logic */}
                                <Col className='projectStatcol'><RiseOutlined className='riseIcon'/> <span> vs Last Month</span></Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={17}>
                        <div>
                            <Card className='totalRevenceCard'>
                                <>
                                <span className='totalRevenueLabel'>Total Revenue</span>
                                <span className='totalRevenueCount'>$66,143.00</span>
                                </>
                                <RevenueCharts thisMonthData={thisMonthData} lastMonthData={lastMonthData} />
                            </Card>
                        </div>
                    </Col>
                </Row>

            </>               
        <Drawer
              title={`Create New Project`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
              <ProjectOnBoardingForm onClose={onClose} />

          </Drawer>                 
        {isEmployeesLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'top', height: '100vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Card>
          <Tabs
            className="bean-home-tabs"            
            onChange={setActiveKey}
            items={items}
            tabBarExtraContent={<Button type='primary' className='button-vendor' onClick={addNewProject}><PlusOutlined /> Add New Project</Button>            
          }
          />
        </Card>
      )}
    </>
)
}

export default ProjectDashboard;

