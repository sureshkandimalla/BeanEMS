import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Card, Row, Col, Button, Flex, Drawer, Space, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./Vendor.css";
import Newvendor from "./NewVendor";

const VendorDetails = () => {
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  //  const columnsList = ['Customer Id', 'Company Name', 'Email Id', 'Phone', 'Status', 'ein', 'Website','startDate','endDate' ];

  useEffect(() => {
    fetch(
      "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/customers/getAllCustomers"
    )
      .then((response) => response.json())
      .then((data) => {
        setRowData(getFlattenedData(data));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
      //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
      return { ...dataObj };
    });
    return updatedData || [];
  };

  const getColumnsDefList = (isSortable, isEditable, hasFilter) => {
    var columns = [
      { headerName: "Customer Id", field: "customerId", sortable: isSortable },
      {
        headerName: "Name",
        field: "customerCompanyName",
        sortable: isSortable,
      },
      { headerName: "Email", field: "customerEmail", sortable: isSortable },
      { headerName: "Phone", field: "customerPhone", sortable: isSortable },
      { headerName: "Status", field: "customerStatus", sortable: isSortable },
      { headerName: "ein", field: "ein", sortable: isSortable },
      { headerName: "Website", field: "website", sortable: isSortable },
      {
        headerName: "Start Date",
        field: "customerStartDate",
        sortable: isSortable,
      },
      {
        headerName: "End Date",
        field: "customerEndDate",
        sortable: isSortable,
      },
    ];
    return columns;
  };

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10, // Number of rows to show per page
    domLayout: "autoHeight",
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const filterData = () => {
    if (!searchText) {
      return rowData;
    }

    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };

  const [open, setOpen] = useState(false);

  const addNewVendor = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div
    style={{
      height: "100vh", 
      display: "flex",
      flexDirection: "column",
      overflow: "hidden", 
    }}
  >
    <div className="ag-theme-alpine vendor-List-grid">
     <Card>
      <Drawer
        title={`Vendor Onboarding`}
        placement="right"
        size="large"
        onClose={onClose}
        open={open}
      >
        <Newvendor />
      </Drawer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "end",
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
            style={{ marginRight: "2px" }} // Correct inline style syntax
          />

          <Button
            type="primary"
            className="button-vendor"
            onClick={addNewVendor}
          >
            <PlusOutlined /> Add New Vendor
          </Button>
        </div>
      </div>
      <div className= "vendor-grid-wrapper">
      <AgGridReact
        rowData={filterData()}
        columnDefs={getColumnsDefList(true)}
        gridOptions={gridOptions}
        domLayout="normal"
        pagination={true}        
        paginationPageSize={100}
        paginationPageSizeSelector={[100,200, 300]}
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
          filter: false,
          floatingFilter: false,
          cellClassRules: {
            darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
          } 
        }}
        enableBrowserTooltips={true} 
        popupParent={document.body}  
      />
      </div>
      </Card>
    </div>
    </div>
  );
};

export default VendorDetails;
