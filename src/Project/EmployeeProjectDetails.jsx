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
 
          const location = useLocation();
          const { rowData } = location.state;
          const [responseData, setResponseData] = useState(null);
          const [isLoading, setIsLoading] = useState(true);
          const [error, setError] = useState();
          
          const apiUrl = 'http://localhost:8080';
          const endpoint = '/api/v1/employees/employee';
          const empId = bigInt(rowData.employeeId);
          // Construct the URL with the path variable
          const url = `${apiUrl}${endpoint}/${empId}`;
         
          useEffect(() => {
            alert(url);
            fetch(url)
                .then(response => response.json())
                .then(data => {
                  alert(data.firstName);
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
                children: < EmployeeAddProject /> //for popup oldone
                //children: < ProjectOnBoardingForm/>
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
      <div className="two-parts-container">
          <div className="part left-part">
              {responseData && (
                  <Card className="responsive-card" style={{ width: '100%' }}>
                      <p>
                          <div>
                              <span className='name-span' style={{ color: 'blue', padding: '5px', fontSize: '20px' }}>
                                  <UserOutlined style={{ marginRight: '14px' }} /> {responseData.firstName} {responseData.lastName}</span>
                              <button style={{ float: 'right', top: '4', right: '0', background: '#ffffff', border: 'none', cursor: 'pointer' }} onClick={handleClick}>...</button><br />
                              <span className="designation-style">{responseData.designation}</span>
                              <span style={{ float: 'right', right: '0', color: 'black', padding: '5px', fontSize: '10px' }}> {responseData.employmentType}</span>
                          </div>
                          <div>
                              <span style={{ color: 'black', padding: '5px', fontSize: '12px' }}>  <MailOutlined /> {responseData.emailId}</span>
                              <span style={{ color: 'black', padding: '5px', fontSize: '12px' }}> <PhoneOutlined /> {responseData.phone} </span>
                          </div>
                      </p>
                  </Card>
              )}
          </div>
          <div className="gap"></div> {/* Gap between the two parts */}
          <div className="part right-part">
              <Tabs className='bean-home-tabs' defaultActiveKey="1" onChange={toggleTabs} items={items}>
              </Tabs>
          </div>
      </div>
      </Sidebar>
        );

      };



export default TwoPartPage;

