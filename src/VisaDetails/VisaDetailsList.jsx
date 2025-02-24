import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Card } from "antd";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import axios from "axios";
import "./VisaDetailsList.css"

export default function VisaDetailsList() {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      fetchData();
    } else {
      isInitialRender.current = false;
    }
  }, []);

  const fetchData = () => {
    axios
      .get("http://localhost:8080/api/v1/employees/getAllEmployees")
      .then((response) => {
        console.log("Raw API Response:", response.data); // Check API response
        const flattenedData = getFlattenedData(response.data);
        console.log("Flattened Data:", flattenedData); // Ensure it's structured correctly
        setRowData(flattenedData);
      })
      .catch((error) => {
        console.error("API Fetch Error:", error);
      });
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {      
      return { ...dataObj };
    });
    return updatedData || [];
  };
  
  const columnDefs = [
    {
      field: "firstName",
      headerName: "FirstName"   ,
      cellRenderer: "agGroupCellRenderer",   
    },
    { field: "lastName", headerName: "LastName", filter: true },
    {
      field: "emailId",
      headerName: "EmailId",     
      filter: true,
    },
    {
      field: "phone",
      headerName: "Phone",      
      filter: true,
    },
    {
      field: "dob",
      headerName: "Dob",    
      filter: true,
    },
    {
      field: "ssn",
      headerName: "SSN",      
      filter: true,
    },
    {
      field: "visa",
      headerName: "visa",
      filter: true,      
    },
    {
      field: "taxTerm",
      headerName: "TaxTerm",      
      filter: true,
    },
    {
        field: "referredBy",
        headerName: "ReferredBy",
        filter: true,      
    },
    {
        field: "designation",
        headerName: "Designation",      
        filter: true,
    },
    {
        field: "employmentType",
        headerName: "EmploymentType",
        filter: true,      
    },   
    { field: "startDate", headerName: "Start Date", filter: true },
    { field: "endDate", headerName: "End Date", filter: true },
  ];  

  const detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        {
          field: "visaCategory",
          headerName: "Visa Category",
          filter: true,
        },
        { field: "receiptNumber", headerName: "ReceiptNumber", filter: true },
        {
          field: "jobTitle",
          headerName: "JobTitle",              
          filter: true,
        },
        {
          field: "lcaNumber",
          headerName: "LcaNumber",             
          filter: true,
        },
        { field: "socCode", headerName: "SocCode", filter: true },
        { field: "client", headerName: "Client", filter: true },
        { field: "vendor", headerName: "Vendor", filter: true },
        { field: "client", headerName: "Client", filter: true },
        { field: "jobLocation", headerName: "JobLocation", filter: true },
        { field: "jobLocation2", headerName: "JobLocation2", filter: true },
        { field: "lcaWage", headerName: "LcaWage", filter: true },
        { field: "status", headerName: "Status", filter: true },
        { field: "startDate", headerName: "StartDate", filter: true },
        { field: "endDate", headerName: "End Date", filter: true },
      ],
    domLayout: 'normal', 
    defaultColDef: {
      flex: 1,
      minWidth: 180,
    }
    },
    getDetailRowData : (params) => {
        console.log("Row Data:", params.data);
        params.successCallback(params.data.visas);          
    },
    template: function (params) {
      return `
        <div class="project-grid-wrapper">
          <div ag-grid="params.detailGridOptions"></div>
        </div>
      `;
    }
  };
  return (
    <div style={{
        height: "100vh", // Full viewport height
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevents unwanted scroll
      }}>
    <div className="ag-theme-alpine" >
    <Card className="employeeTableCard" style={{ height: "100%" }}>
    <div className="ag-theme-alpine">
      <div class="workforce-search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />        
      </div>
      <div  className="ag-grid-wrapper">
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
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
        masterDetail={true}
        detailCellRendererParams={detailCellRendererParams}       
        animateRows={true}
      />
      </div>
       </div>
      </Card>     
    </div>
    </div>
  );
}

