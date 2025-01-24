import React, { useState, useEffect } from "react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
//import './EmployeeFullDetailsComponent.css';

import "../WorkForce/WorkForce.css";

import { Col, Row, Card, Tabs } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
//import EmployeePersonnelFilePage from '../EmployeeDetailsComponent/EmployeePersonnelFilePage';

//const style: React.CSSProperties = { background: '#A9A9A9', padding: '8px 0' ,paddingLeft: '8px 0'};

const EmployeeFullDetails = () => {
  const divStyle = {
    //     height: '95%', // Set the desired height in pixels or any other valid CSS unit
    border: "1px solid #ccc",
    padding: "20px",
    background: "#ffffff",
    //border: '0px solid #ccc',
  };
  const handleClick = () => {
    // Your logic or actions when the button is clicked
    console.log("Button clicked!");
  };

  const location = useLocation();
  const { rowData } = location.state;
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    console.log("rowData:", rowData);
    setResponseData(rowData);
  }, [rowData]);

  const { TabPane } = Tabs;
  //const history = useHistory();
  const items = [
    {
      key: 1,
      label: "PERSONNEL FILE",
      title: "EmployeePersonnelFilePage /",
    },
    {
      key: 2,
      label: "PROJECTS",
      title: "EmployeeAddProject ",
    },
    {
      key: 3,
      label: "PAF",
    },
    {
      key: 4,
      label: "WA",
      title: "WORK AUTHORIZATION",
    },
    {
      key: 5,
      label: "FORMS",
    },
    {
      key: 6,
      label: "TASKS",
    },
    {
      key: 7,
      label: "EVALUATION",
    },
    {
      key: 8,
      label: "LEAVE REPORT",
    },
  ];

  const toggleTabs = (e) => {
    //TODO
  };

  function toggleContent() {
    alert("toogle");
  }
  return (
    <div className="two-parts-container">
      <div className="part left-part">
        <section className="personal-info">
          {responseData && (
            <Card
              className="responsive-card"
              style={{ width: "30%", height: "70%" }}
            >
              <p>
                <div>
                  <span
                    className="name-span"
                    style={{ color: "blue", padding: "5px", fontSize: "20px" }}
                  >
                    <UserOutlined style={{ marginRight: "14px" }} />{" "}
                    {responseData.firstName} {responseData.lastName}
                  </span>
                  <button
                    style={{
                      float: "right",
                      top: "4",
                      right: "0",
                      background: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={handleClick}
                  >
                    ...
                  </button>
                  <br />
                  <span className="designation-style">
                    {responseData.designation}
                  </span>
                  <span
                    style={{
                      float: "right",
                      right: "0",
                      color: "black",
                      padding: "5px",
                      fontSize: "10px",
                    }}
                  >
                    {" "}
                    {responseData.employmentType}
                  </span>
                </div>
                <div>
                  <span
                    style={{ color: "black", padding: "5px", fontSize: "12px" }}
                  >
                    {" "}
                    <MailOutlined /> {responseData.emailId}
                  </span>
                  <span
                    style={{ color: "black", padding: "5px", fontSize: "12px" }}
                  >
                    {" "}
                    <PhoneOutlined /> {responseData.phone}{" "}
                  </span>
                </div>
                <div className="details-row" style={{ marginTop: "10px" }}>
                  <div className="field">
                    <label htmlFor="emailId">Work Authorization Type</label>
                    <span className="field-value">{rowData.visa}</span>
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Tax Term</label>
                    <span className="field-value">{rowData.taxTerm}</span>
                  </div>
                </div>
                <div className="details-row" style={{ marginTop: "10px" }}>
                  <div className="field">
                    <label htmlFor="emailId">H1B validity</label>
                    <span className="field-value"> {rowData.h1bValidity}</span>
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Current Project Validity</label>
                    <span className="field-value">null</span>
                  </div>
                </div>
                <div className="details-row" style={{ marginTop: "10px" }}>
                  <div className="field">
                    <label htmlFor="emailId">Employment Start Date</label>
                    <span className="field-value">{rowData.startDate}</span>
                  </div>
                </div>
              </p>
            </Card>
          )}

          <hr className="dotted-line" />
          <div class="labelArrow" onclick="toggleContent()">
            Document Alerts <span class="arrow">&#9660;</span>
          </div>
          <div class="content" id="content">
            Content here
          </div>
        </section>
      </div>
      <div className="gap"></div> {/* Gap between the two parts */}
      <div className="part right-part">
        <Tabs
          className="bean-home-tabs"
          defaultActiveKey="1"
          onChange={toggleTabs}
          items={items}
        ></Tabs>
      </div>
    </div>
  );
};

export default EmployeeFullDetails;
