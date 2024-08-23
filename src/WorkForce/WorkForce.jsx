import React,{useState,useEffect,useRef} from "react";
import { Tabs,Card, Row, Col, Button, Flex, Drawer, Menu } from 'antd';
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
  const isInitialRender = useRef(true);
  const [rowData, setRowData] = useState();
  console.log(rowData);
  console.log(setRowData);
  console.log("Suresh");



  const toggleTabs = (e) => {
  }

  
    const rowStyle = {
      height: 70 + 'px', // Set the height of the row dynamically
    };

  const items = [
    {
        key: 1,
        label: 'Employee List',
        children: <WorkForceList />
    },
    {
        key: 2,
        label: 'Projects',
        children: <ProjectGrid/>
    },
    {
        key: 3,
        label: 'Invoices'
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
        };

        fetchData();
    }, []);

    const totalParamCount = workForceChartData[0] + workForceChartData[1] + workForceChartData[2] + workForceChartData[3];

    return (
        <>
            <Drawer
                title={`Employee Onboarding`}
                placement="right"
                size="large"
                onClose={onClose}
                open={open}
            >
                <Newemployee />
            </Drawer>
            <Row >
                <Col span={24}>
                    <Row >
                        <Col span={8}>
                            <Card className='billingCard'>
                                <span className='invoiceCardTitle'>Billing </span>
                                <PieCharts chartData={invoicesChartData} chartLabels={invoicesChartLabels} />
                            </Card>
                            
                        </Col>
                        <Col span={8}>
                            <Card className='totalworkForceCard1'>
                            <Row>
                            <div className="pie-chart-container">
                                    <Col ><PieCharts chartData={workForceChartData} chartLabels={workForceChartLabels} /></Col>
                                    </div>
                                </Row>
                            </Card>
                            
                        </Col>
                        <Col span={8}>
                            <Card className='invoiceStatusCard1'>
                                <span className='invoiceCardTitle'>Invoice Status</span>
                                <PieCharts  chartData={invoicesChartData} chartLabels={invoicesChartLabels} />
                            </Card>
                        </Col>
                        {/* <Col span={14}>
                            <Card className='totalworkForceCard1'>
                                <Row>
                                    <Col span={18}><PieCharts chartData={workForceChartData} chartLabels={workForceChartLabels} /></Col>
                                    <Col span={3}>
                                        <div className="totalWorkFrcDiv">
                                            <span className='totalWorkTitle' style={{ marginTop: "10px" }}>Total Work Force</span>
                                            <Row justify="space-between">
                                                <span className='totalWorkForceCount'>{totalParamCount}</span>
                                                <span className='mrgTop15'><RiseOutlined className='riseIcon' /> <span> 3.5%</span></span>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        
                       <Col span={10}>
                            <Card className='invoiceStatusCard'>
                                <span className='invoiceCardTitle'>Invoice Status</span>
                                <PieCharts chartData={invoicesChartData} chartLabels={invoicesChartLabels} />
                            </Card>
    </Col> */}
                    </Row>
                </Col>
            </Row>

            <Card>
                <Tabs className='bean-home-tabs' defaultActiveKey="1" onChange={toggleTabs} items={items}
                    tabBarExtraContent={<Button type='primary' onClick={addNewEmployee}><PlusOutlined /> Add New Employee</Button>}>
                </Tabs>
            </Card>
        </>
    );
}
export default WorkForce