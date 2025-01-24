import React, { useState, useEffect } from "react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const ProjectPersonalFile = ({ rowData }) => {
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    console.log("rowData:", rowData);
    setResponseData(rowData);
  }, [rowData]);

  return (
    <main className="page-main">
      <section className="personal-info">
        <div className="header-personnel">
          <h2 className="header-title">Project File</h2>
          <button className="update-button">Update</button>
        </div>
        <hr className="dotted-line" />
        <div className="employee-details">
          <div className="details-row">
            <div className="field">
              <label htmlFor="firstName">Project Name</label>
              <span className="field-value">{rowData?.projectName}</span>
            </div>
            <div className="field">
              <label htmlFor="middleName">Vendor Name</label>
              <span className="field-value">{rowData?.vendorName}</span>
            </div>
            <div className="field">
              <label htmlFor="lastName">Client Name</label>
              <span className="field-value">{rowData?.clientName}</span>
            </div>
            <div className="field">
              <label htmlFor="designation">BillRate</label>
              <span className="field-value">{rowData?.billRate}</span>
            </div>
          </div>
        </div>
        {/* <div className="details-row">
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
            </div> */}
        {/* <div className="header">
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
            </div> */}

        <div className="header">
          <h4 className="header-title-green">Project Details</h4>
        </div>
        <div className="details-row">
          <div className="field">
            <label htmlFor="employmentType">Project Status</label>
            <span className="field-value">{rowData?.status}</span>
          </div>
          <div className="field">
            <label htmlFor="startDate">Project Start Date</label>
            <span className="field-value">{rowData?.startDate}</span>
          </div>
          <div className="field">
            <label htmlFor="period">Project End Date</label>
            <span className="field-value">{rowData?.endDate}</span>
          </div>
          <div className="field">
            <label htmlFor="employeeId">Project Id</label>
            <span className="field-value">{rowData?.projectId}</span>
          </div>
        </div>
        <div className="header">
          <h4 className="header-title-green">Billing Information</h4>
          <div className="details-row">
            <div className="field">
              <label htmlFor="emailAddress">Expense Internal</label>
              <span className="field-value">
                {rowData?.expenseInternal}
              </span>{" "}
              {/*TODO change status */}
            </div>
            <div className="field">
              <label htmlFor="wage">Expense External</label>
              <span className="field-value">{rowData?.expenseExternal}</span>
            </div>
            <div className="field">
              <label htmlFor="department">Hours</label>
              <span className="field-value">{rowData?.hours}</span>
            </div>
            <div className="field">
              <label htmlFor="status">Net</label>
              <span className="field-value">{rowData?.net}</span>
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
            <span className="field-value">
              {rowData?.address ? rowData.address.address : "NA"}
            </span>
          </div>
          <div className="field">
            <label htmlFor="addressLine2">Address Line2</label>
            <span className="field-value">
              {rowData?.address ? rowData.address.addressLine2 : "NA"}
            </span>
          </div>
          <div className="field">
            <label htmlFor="City">City,State</label>
            <span className="field-value">
              {rowData?.address ? rowData.address.city : "NA"},
              {rowData?.address ? rowData.address.state : "NA"}
            </span>
          </div>
          <div className="field">
            <label htmlFor="zipCode">Zip Code</label>
            <span className="field-value">
              {rowData?.address ? rowData.address.zipCode : "NA"}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProjectPersonalFile;
