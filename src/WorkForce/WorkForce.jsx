import React,{useState,useEffect,useRef} from "react";
import { Tabs,Card, Row, Col, Button, Flex, Drawer, Menu ,Spin} from 'antd';
import {PlusOutlined, RiseOutlined} from '@ant-design/icons';
import Newemployee from "../Newemployee/Newemployee";
import Active from "./Active";
import WorkForceList from "./WorkForceList";
import ProjectGrid from "../Project/ProjectGrid";

import PieCharts from '../PieCharts/PieCharts';

const WorkForce=()=>{

  const { TabPane } = Tabs;
  const [workForceChartData, setWorkForceChartData] = useState([]);
  const [workForceChartLabels, setWorkForceChartLabels] = useState([]);
  const [invoicesChartData, setInvoicesChartData] = useState([]);
  const [invoicesChartLabels, setInvoicesChartLabels] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [activeRowData, setActiveRowData] = useState([]);
  const [usaRowData, setUSARowData] = useState([]);
  const [indRowData, setIndRowData] = useState([]);
  const [rTypeData, setTypeRowData] = useState([]);
  const [terminatedRowData, setTerminatedRowData] = useState([]);
  const [onBoardingRowData, setOnBoardingRowData] = useState([]);
  const [onApprovedRowData, setApprovedRowData] = useState([]);
  const [fullTimeRowData, setfullTimeRowData] = useState([]);
  const [corpRowData, setcorpRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isInitialRender = useRef(true);
  const [totalWage, setTotalWage] = useState([]);


  useEffect(() => {
    const handleBeforeUnload = () => {
        localStorage.removeItem('employeeData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up the event listener when the component unmounts
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, []);

const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
        //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
        return { ...dataObj }
    });
    return updatedData || [];
}

  const toggleTabs = (e) => {
  }

  
    const rowStyle = {
      height: 70 + 'px', // Set the height of the row dynamically
    };

    const items = [
        {
            key: 1,
            label: 'USA',
            children: <WorkForceList employees={usaRowData}/>
        },
        {
            key: 2,
            label: 'India',
            children: <WorkForceList employees={indRowData}/>
        },
        {
            key: 3,
            label: 'Workforce',
            children: <WorkForceList employees={rowData}/>
        },
        {
            key: 4,
            label: 'Billable Employees',
            children: <WorkForceList employees={rTypeData}/>
        },
        {
            key: 5,
            label: 'Active Employees',
            children: <WorkForceList employees={activeRowData}/>
        },
        
        {
            key: 6,
            label: 'Onboarding',
            children: <WorkForceList employees={onBoardingRowData}/>
        },
        {
            key: 7,
            label: 'Corp to Corp',
            children: <WorkForceList employees={corpRowData}/>
        },
        {
            key: 8,
            label: 'Fulltime',
            children: <WorkForceList employees={fullTimeRowData}/>
        },
        {
            key: 9,
            label: 'Terminated',
            children: <WorkForceList employees={terminatedRowData}/>
        },
    ]


    const [current, setCurrent] = useState('Active');
    const [open, setOpen] = useState(false);

    const addNewEmployee = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onClick = (e) => {
      console.log('click ', e);
      setCurrent(e.key);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!isInitialRender.current) {
                try {
                    const response1 = await fetch('http://localhost:8080/api/v1/employees/employeesCountByStatus');
                    const data1 = await response1.json();

                    // Assuming the response from your API is an array of objects with 'label' and 'value' properties
                    const labels = data1.map(item => item.status);
                    const chartData = data1.map(item => item.count);
                    setWorkForceChartLabels(labels);
                    setWorkForceChartData(chartData);

                    const response2 = await fetch('http://localhost:8080/api/v1/invoice/invoicesCountByStatus');
                    const data2 = await response2.json();
                    const labels2 = data2.map(item => item.status);
                    const chartData2 = data2.map(item => item.count);
                    setInvoicesChartLabels(labels2);
                    setInvoicesChartData(chartData2);

                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            } else {
                isInitialRender.current = false;
            }

            const storedData = localStorage.getItem('employeeData');

    if (storedData) {
        // Use data from localStorage if available
        setRowData(JSON.parse(storedData));
    } else {
    fetch('http://localhost:8080/api/v1/employees/getAllEmployees')
        .then(response => response.json())
        .then(data => {
            const flattenedData = getFlattenedData(data);
            setLoading(false);
            console.log(flattenedData);
            
            // Save flattened data to localStorage
            localStorage.setItem('employeeData', JSON.stringify(flattenedData));           
            setRowData(() => flattenedData);  
            setIndRowData(() => flattenedData?.filter(({ workCountry }) => workCountry === 'India'));
            setUSARowData(() => flattenedData?.filter(({ workCountry }) => workCountry === 'USA'));                    
            setTypeRowData(() => flattenedData?.filter(({resourceType}) => resourceType === 'Billable'))                     
            setActiveRowData(() => flattenedData?.filter(({status}) => status === 'Active'))           
            setTerminatedRowData(() =>
                flattenedData?.filter(({ status }) => status !== 'Active')
              );            
            setOnBoardingRowData(() => flattenedData?.filter(({status}) => status === 'Onboarding')) 
            setApprovedRowData(() => flattenedData?.filter(({status}) => status === 'Approved')) 

            const totalWage= rTypeData.reduce((total, item) => total + item.billRate, 0);           
            setTotalWage(totalWage);
            
            setcorpRowData(() =>
                flattenedData?.filter(({ employmentType }) =>
                  ['1099', 'C2C'].includes(employmentType)
                )
              );
              
              setfullTimeRowData(() =>
                flattenedData?.filter(({ employmentType }) =>
                  ['W2', 'Full-Time'].includes(employmentType)
                )
              ); 
            console.log(activeRowData)
            console.log(onBoardingRowData)
            console.log(terminatedRowData)
            console.log("Total Wage"+totalWage)

        })
        .catch(error => console.error('Error fetching data:', error))
        .finally(() => setLoading(false)); // Hide loader when data is fetched

    }
        };

        fetchData();
    }, []);

   // const totalParamCount = workForceChartData[0] + workForceChartData[1] + workForceChartData[2] + workForceChartData[3]+ workForceChartData[4];

    return (
        <>
            <Drawer
                title="Employee Onboarding"
                placement="right"
                size="large"
                onClose={onClose}
                open={open}
            >
                <Newemployee />
            </Drawer>
                <>
                    <Row>
                        <Col span={24}>
                            <Row>
                                <Col span={8}>
                                    <Card className='billingCard'>
                                        <span className='invoiceCardTitle'>Billing</span>
                                        <PieCharts chartData={invoicesChartData} chartLabels={invoicesChartLabels} />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card className='totalworkForceCard1'>
                                        <PieCharts chartData={workForceChartData} chartLabels={workForceChartLabels} />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card className='invoiceStatusCard1'>
                                        <span className='invoiceCardTitle'>Invoice Status</span>
                                        <PieCharts chartData={invoicesChartData} chartLabels={invoicesChartLabels} />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'top', height: '100vh' }}>
                    <Spin size="large" />
                </div>
            ) : (
                    <Card>
                        <Tabs
                            className='bean-home-tabs'
                            defaultActiveKey="1"
                            onChange={toggleTabs}
                            items={items}
                            tabBarExtraContent={<Button type='primary' onClick={addNewEmployee}><PlusOutlined /> Add New Employee</Button>}
                        />
                    </Card>
            )}
                </>
        </>
    );
};
export default WorkForce