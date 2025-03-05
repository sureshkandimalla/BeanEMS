import React, { useState, useEffect } from "react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Col, Row, Card, Tabs } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useLocation, useHistory } from "react-router-dom";
import "./EmployeeFullDetailsComponent.css"

const EmployeePersonnelFilePage = () => {
  const location = useLocation();
  const { rowData } = location.state;
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    console.log("rowData:", rowData);
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
            {[
              { label: "First Name", value: rowData.firstName },
              { label: "Middle Name", value: rowData.middleName },
              { label: "Last Name", value: rowData.lastName },
              { label: "Designation", value: rowData.designation },
              { label: "Gender", value: rowData.gender },
              { label: "Date of Birth", value: rowData.dob },
            ].map((item, index) => (
              <div className="column-field" key={index}>
                <label>{item.label}</label>
                <span className="column-field-value">{item.value}</span>
              </div>
            ))}
          </div>
          
          <div className="details-row">
  {/* Contact Information */}
  <div className="column-section">
    <h4 className="header-title-green">Contact Information</h4>
    <div className="details-row">
      {[
        { label: "Email Address", value: rowData.emailId },
        { label: "Phone Number", value: rowData.phone },
      ].map((item, index) => (
        <div className="column-field" key={index}>
          <label>{item.label}</label>
          <span className="column-field-value">{item.value}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Employment Details */}
  <div className="column-section">
    <h4 className="header-title-green">Employment Details</h4>
    <div className="details-row">
      {[
        { label: "Employment Type", value: rowData.employmentType },
        { label: "Employment Start Date", value: rowData.startDate },
        { label: "Employment Period", value: rowData.period },
        { label: "Employment Id", value: rowData.employeeId },
      ].map((item, index) => (
        <div className="column-field" key={index}>
          <label>{item.label}</label>
          <span className="column-field-value">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
</div>
          <div className="details-row">
            <div className="column-field">
              <label htmlFor="emailAddress">Billing status</label>
              <span className="column-field-value">{rowData.status}</span>
              {/*TODO change status */}
            </div>
            <div className="column-field">
              <label htmlFor="wage">Wage Rate</label>
              <span className="column-field-value">{rowData.wage}</span>
            </div>
            <div className="column-field">
              <label htmlFor="department">Department</label>
              <span className="column-field-value">{rowData.department}</span>
            </div>
            <div className="column-field">
              <label htmlFor="status">Benefit Status</label>
              <span className="column-field-value">{rowData.status}</span>
            </div>
          </div>
        </div>
        {/* Address Details */}
        <div className="header">
          <h4 className="header-title-green">Current Home Address</h4>
        </div>
        <div className="details-row">
          {[
            {
              label: "Address Line 1",
              value: rowData.address?.address || "NA",
            },
            {
              label: "Address Line 2",
              value: rowData.address?.addressLine2 || "NA",
            },
            {
              label: "City, State",
              value: `${rowData.address?.city || "NA"}, ${
                rowData.address?.state || "NA"
              }`,
            },
            { label: "Zip Code", value: rowData.address?.zipCode || "NA" },
          ].map((item, index) => (
            <div className="column-field" key={index}>
              <label>{item.label}</label>
              <span className="column-field-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default EmployeePersonnelFilePage;
