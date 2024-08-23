import React, { useState, useEffect } from "react";
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Col, Row ,Card, Tabs  } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined  } from '@ant-design/icons';
import { useLocation, useHistory } from 'react-router-dom';


const EmployeePersonnelFilePage = () => {

    const location = useLocation();
    const { rowData } = location.state;
    const [responseData, setResponseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState();
    
    useEffect(() => {
      console.log('rowData:', rowData);
      setResponseData(rowData);
  }, [rowData]);


    return (

        <main className="page-main">
        <section className="personal-info">
          <div className="header-personnel">
            <h2 className="header-title">Personnel File</h2>
            <button className="update-button">Update</button>
          </div>
          <hr className="dotted-line" />
          <div className="employee-details">
            <div className="details-row">
              <div className="field">
                <label htmlFor="firstName">First Name</label>
                <span className="field-value">{rowData.firstName}</span>
              </div>
              <div className="field">
                <label htmlFor="middleName">Middle Name</label>
                <span className="field-value">{rowData.middleName}</span>
              </div>
              <div className="field">
                <label htmlFor="lastName">Last Name</label>
                <span className="field-value">{rowData.lastName}</span>
              </div>
              <div className="field">
                <label htmlFor="designation">Designation</label>
                <span className="field-value">{rowData.designation}</span>
              </div>
            </div>
            <div className="details-row">
              <div className="field">
                <label htmlFor="gender">Gender</label>
                <span className="field-value">{rowData.gender}</span>
              </div>
              <div className="field">
                <label htmlFor="dob">Date of Birth</label>
                <span className="field-value">{rowData.dob}</span>
              </div>
              <div className="field">
                <label htmlFor="ethnicity">Ethnicity</label>
                <span className="field-value">{rowData.ethinicity}</span>
              </div>
              <div className="field">
                <label htmlFor="veteranStatus">Veteran Status</label>
                <span className="field-value">{rowData.veteranStatus}</span>
              </div>
            </div>
        <div className="header">
            <h4 className="header-title-green">Contact Information</h4>
        </div>
            <div className="details-row">
              <div className="field">
                <label htmlFor="emailId">Email Address</label>
                <span className="field-value">{rowData.emailId}</span>
              </div>
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <span className="field-value">{rowData.phone}</span>
              </div>
            </div>

        <div className="header">
            <h4 className="header-title-green">Employment Details</h4>
        </div>
            <div className="details-row">
              <div className="field">
                <label htmlFor="employmentType">Employment Type</label>
                <span className="field-value">{rowData.employmentType}</span>
              </div>
              <div className="field">
                <label htmlFor="startDate">Employment Start Date</label>
                <span className="field-value">{rowData.startDate}</span>
              </div>
              <div className="field">
                <label htmlFor="period">Employment Period</label>
                <span className="field-value">{rowData.period}</span>
              </div>
              <div className="field">
                <label htmlFor="employeeId">Employment Id</label>
                <span className="field-value">{rowData.employeeId}</span>
              </div>
            </div>
            <div className="details-row">
              <div className="field">
                <label htmlFor="emailAddress">Billing status</label>
                <span className="field-value">{rowData.status}</span> {/*TODO change status */}
              </div>
              <div className="field">
                <label htmlFor="wage">Wage Rate</label>
                <span className="field-value">{rowData.wage}</span>
              </div>
              <div className="field">
                <label htmlFor="department">Department</label>
                <span className="field-value">{rowData.department}</span>
              </div>
              <div className="field">
                <label htmlFor="status">Benefit Status</label>
                <span className="field-value">{rowData.status}</span>
              </div>
            </div>
            </div>
        <hr className="dotted-line" />
        <div className="header">
            <h4 className="header-title-green">Current Home Address</h4>
        </div>
            <div className="details-row">
              <div className="field">
                <label htmlFor="addressLine1">Address Line1</label>
                <span className="field-value">{rowData.address ? rowData.address.address : 'NA'}</span>
              </div>
              <div className="field">
                <label htmlFor="addressLine2">Address Line2</label>
                <span className="field-value">{rowData.address ? rowData.address.addressLine2 : 'NA'}</span>
              </div>
              <div className="field">
                <label htmlFor="City">City,State</label>
                <span className="field-value">{rowData.address ? rowData.address.city : 'NA'},{rowData.address ? rowData.address.state : 'NA'}</span>
              </div>
              <div className="field">
                <label htmlFor="zipCode">Zip Code</label>
                <span className="field-value">{rowData.address ? rowData.address.zipCode : 'NA'}</span>
              </div>
            </div>
          
        </section>
      </main>
      
    );
}

export default EmployeePersonnelFilePage;
