import React, { useState, useEffect } from "react";
import TextField from '@material-ui/core/TextField'; 
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './EmployeeProjectForm.scss';
import './EmployeeProjectDetails.scss';
import Sidebar from "../../Commons/Sidebar/Sidebar";
import { Col, Row ,Card, Tabs  } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined  } from '@ant-design/icons';
import { useLocation, useHistory } from 'react-router-dom';
import bigInt from 'big-integer';
import EmployeeAddProject from '../EmployeeProjectForm/EmployeeAddProject';
import { Link } from 'react-router-dom';



//const style: React.CSSProperties = { background: '#A9A9A9', padding: '8px 0' ,paddingLeft: '8px 0'};

const TwoPartPage = () => {
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

     const buttonStyle = {
        border: 'none', // Remove the border
        padding: '10px', // Add padding for better appearance
        background: 'ffffff', // Add a background color (optional)
        cursor: 'pointer', // Change cursor on hover
      };
        const secondLineStyle = {
          fontSize: '10px',      // Set a different font size for the second line
          fontWeight: 'bold',    // Apply additional styles as needed
        };
        const spanWithTextWrap = {
            display: 'block', // Ensure the span behaves like a block element
            whiteSpace: 'normal', // Allow text to wrap
            wordWrap: 'break-word', // Enable word wrap
          };
 
          const location = useLocation();
          const { rowData } = location.state || {};
          const [responseData, setResponseData] = useState(null);
          const [isLoading, setIsLoading] = useState(true);
          const [error, setError] = useState();
          
          const projectsApiUrl = 'http://localhost:8080/api/v1/projects';

          const projectId = bigInt(rowData.projectId);
       //   alert(rowData);
          // Construct the URL with the path variable
          const url = `${projectsApiUrl}/${projectId}`;
         // alert(projectId);
          useEffect(() => {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                  //alert(data.projectName);
                  setResponseData(data);
                  
                })
                .catch(error => console.error('Error fetching data:', error));
        }, []);

          const { TabPane } = Tabs;
          const history = useHistory();
          const items = [
            {
                key: 1,
                label: 'Projects',
                children: < EmployeeAddProject />
            },
            {
                key: 2,
                label: 'Invoices'
            },
            {
              key: 3,
              label: 'LeaveReport'
          },
        ]
        
        const toggleTabs = (e) => {
          //TODO
        }

     return (
         <Sidebar>
            <div className="part" style={{ background: '#f0f0f0', padding: '0px' }}>

         {/* <Row gutter={16} style={{minHeight: '100%'}}> */}
                {/* First Part */}
                <Col span={60}  >
                  <div className="part" style={divStyle}>
                  {responseData && (
                  <>
                    <Card className="responsive-card"
                         style={{ width: '100%', background: '#e3e1e2' }}>
                         <Link  to={{pathname: '/employeeProjectDetails' }} > {'< AllProjects'}   </Link>
                          <h3>{'Project # '} {responseData.projectName} <span style={{color: 'lightBlue'}}> | {responseData.status}  </span>  </h3>
                          <div className="card">
                               <div className="card-content">
                                 <h2>Title</h2>
                                 <p>Content goes here</p>
                               </div>
                             </div>
                             <div className="card">
                                                            <div className="card-content">
                                                              <h2>Title</h2>
                                                              <p>Content goes here</p>
                                                            </div>
                                                          </div>
                                                      <p>

                        {/*  <Card className="responsive-card"
                                                  style={{ width: '30%' }}>
                                         <div>
                                                                      <span className='name-span' style={{  wordWrap: 'break-word', color: 'blue',position: 'responsive',    padding: '5px' ,fontSize: '20px'}}>
                                                                          <h4 style={{  wordWrap: 'break-word',position: 'responsive',marginRight: '14px' }}> Project details for project #
                                                                          {responseData.projectId +' - '+responseData.projectName} </h4></span>
                                                                          <button style={{ float: 'right' ,position: 'responsive', top: '4', right: '0', background: '#ffffff',border: 'none',cursor: 'pointer' }}  onClick={handleClick}>...</button><br />
                                                                          <h4> Employee Name : {responseData.employee.firstName + ' '+responseData.employee.lastName}
                                                                           Vendor Name : {responseData.customer.customerCompanyName}</h4>
                                                                          <span className="designation-style">{responseData.designation}</span>
                                                                          <span style={{ float: 'right', position: 'responsive',  right: '0', color: 'black', padding: '5px' ,fontSize: '10px'}}> {responseData.employmentType}</span>
                                                                  </div>
                          </Card> */}
                         </p>
                     </Card>
                     </>
                    )}
                    </div>
                </Col>

               {/*   */}{/* Second Part */}{/*
                <Col span={18} >
                  <div className="part"  style={divStyle}>
                  <Tabs className='bean-home-tabs' defaultActiveKey="1" onChange={toggleTabs} items={items}>
                 </Tabs>
                  </div>
                </Col> */}
             {/*  </Row> */}
          </div>


          </Sidebar>
        );

      };



export default TwoPartPage;

