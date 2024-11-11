import React, { useState, useEffect } from "react";
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ProjectFullDetails.css';
import ProjectGrid from "./ProjectGrid";
// import '../WorkForce/WorkForce.css'
import { Col, Row ,Card, Tabs  } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined  } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import EmployeePersonnelFilePage from '../EmployeeDetailsComponent/EmployeePersonnelFilePage';
import RevenueCharts from '../RevenueCharts/RevenueCharts';
import ProjectPersonalFile from "./ProjectPersonalFile";
import AssignmentDetails from "./AssignmentDetails";
//const style: React.CSSProperties = { background: '#A9A9A9', padding: '8px 0' ,paddingLeft: '8px 0'};

const ProjectFullDetails = () => {
    const divStyle = {
    //     height: '95%', // Set the desired height in pixels or any other valid CSS unit
        border: '1px solid #ccc',
        padding: '20px',
        background: '#ffffff',
        //border: '0px solid #ccc',
      };
    const handleClick = () => {
        // Your logic or actions when the button is clicked
        console.log('Button clicked!');
      };
          const thisMonthData = [50000, 43000, 60000, 70000, 55000];
          const lastMonthData = [25000, 28000, 20000, 15000, 50000];
          const location = useLocation();
          const { rowData } = location.state;
          console.log(location.state)
          localStorage.setItem('projectName', rowData?.projectName)
          localStorage.setItem('projectId',rowData?.projectId);
          const [responseData, setResponseData] = useState(null);
         
          useEffect(() => {
            console.log('rowData:', rowData);
            setResponseData(rowData);
        }, [rowData]);
        
          const { TabPane } = Tabs;
          //const history = useHistory();
          const items = [
            {
              key: 1,
              label: 'PROJECT SUMMARY',
              title: 'Project Summary Page /',
              children: < ProjectPersonalFile rowData={rowData}/>
            },
            {
              key: 2,
              label: 'WorkOrders'
          },
            {
                key: 3,
                label: 'Assignments',
                title: 'Assignments',
                children: <AssignmentDetails/>
            }
            
        ]
        const toggleTabs = (e) => {
          //TODO
        }
        
     return (
      
      <div className="two-parts-container">
          <div className="part left-part">
          
             <Row >
                <Col span={24}>
                    <Row >
                        <Col span={8}>
                            {/* <Card className='billingCard'> */}
                            <section className="personal-info">
              {responseData && (
                  <Card className="responsive-card" style={{ width: '100%' }}>
                      <p>
                          <div>
                              <span className='name-span' style={{ color: 'blue', padding: '5px', fontSize: '20px' }}>
                                  Project : {responseData.projectName} </span>
                              <button style={{ float: 'right', top: '4', right: '0', background: '#ffffff', border: 'none', cursor: 'pointer' }} onClick={handleClick}>...</button><br />
                              <span className="designation-style">Client : {responseData.vendorName}</span>
                              <span style={{ float: 'right', right: '0', color: 'black', padding: '5px', fontSize: '10px' }}>  {responseData.employeeName}</span>
                          </div>
                      </p>
                  </Card>
              )}
               <div className="details-row"  style={{ marginTop: '10px' }}>
                 <div className="field">
                   <label htmlFor="phone">BillRate</label>
                   <span className="field-value">{rowData.billRate}</span>
                 </div>
               </div>
               <div className="details-row"  style={{ marginTop: '10px' }}>
                 <div className="field">
                   <label htmlFor="phone">Project Start Date</label>
                   <span className="field-value">{rowData.startDate}</span>
                 </div>
                 <div className="field">
                   <label htmlFor="phone">Project End Date</label>
                   <span className="field-value">{rowData.endDate}</span>
                 </div>
               </div>              
               <hr className="dotted-line" />
             </section>
                            
                        </Col>
                        <Col span={16}>
                        <Card className='totalRevenceCard'>
                                <>
                                <span className='totalRevenueLabel'>Total Revenue</span>
                                <span className='totalRevenueCount'>$66,143.00</span>
                                </>
                                <RevenueCharts thisMonthData={thisMonthData} lastMonthData={lastMonthData} />
                            </Card>
                            
                        </Col>
                        
                    </Row>
                </Col>
            </Row>
           </div>
          <div className="gap"></div> {/* Gap between the two parts */}
          <div className="part right-part">
              <Tabs className='bean-home-tabs' defaultActiveKey="2" onChange={toggleTabs} items={items}>
              </Tabs>
          </div>
      </div>
      
        );

      };



export default ProjectFullDetails;
