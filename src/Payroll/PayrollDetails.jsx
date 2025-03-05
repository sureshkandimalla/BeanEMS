import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "react-datepicker/dist/react-datepicker.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";

const PayrollDetails = ({ employeeId, isCollapsed }) => {
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);

  //  const columnsList = ['Customer Id', 'Company Name', 'Email Id', 'Phone', 'Status', 'ein', 'Website','startDate','endDate' ];
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
      .get(
        `http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/payroll/getPayrollsForEmp?employeeId=${employeeId}`,
        {
          params: {
            // selectedDate: '2023-11-01',//formattedDate,
            //status: 'viewAll'
          },
        },
      )
      .then((response) => {
        console.log(response.data);
        setRowData(getFlattenedData(response.data));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
      //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
      return { ...dataObj };
    });
    return updatedData || [];
  };

  const getColumnsDefList = (isSortable, isEditable, hasFilter) => {
    var columns = [
      {
        headerName: "PayCheckId",
        field: "payCheckId",
        sortable: isSortable,
        valueFormatter: (params) => {
          // Check if this row is the pinned bottom row and show "Total"
          return params.node.rowPinned === "bottom" ? "Total" : params.value;
        },
      },
      {
        headerName: "PayCycleStartDate",
        field: "payCycleStartDate",
        sortable: isSortable,
        valueFormatter: (params) => {
          if (!params.value) return ""; // Handle empty or undefined values
          const date = new Date(params.value);
          return date.toLocaleDateString("en-US", {
            month: "short", // Short month format (e.g., Mar)
            day: "numeric", // Numeric day format
            year: "numeric", // Full year format
          });
        },
      },
      {
        headerName: "PayCycleEndDate",
        field: "payCycleEndDate",
        sortable: isSortable,
        valueFormatter: (params) => {
          if (!params.value) return ""; // Handle empty or undefined values
          const date = new Date(params.value);
          return date.toLocaleDateString("en-US", {
            month: "short", // Short month format (e.g., Mar)
            day: "numeric", // Numeric day format
            year: "numeric", // Full year format
          });
        },
      },
      { headerName: "Hours", field: "hours", sortable: isSortable },
      {
        headerName: "TotalPaid",
        field: "totalPaid",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      {
        headerName: "NetPay",
        field: "netPay",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "TaxWithheld",
        field: "taxWithheld",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      {
        headerName: "Deductions",
        field: "deductions",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "EmployerLiability",
        field: "employerLiability",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value),
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
        String(value).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData);
      setPinnedBottomRowData([
        {
          payrollId: "Total",
          totalPaid: rowData.reduce(
            (sum, row) => sum + (row.totalPaid || 0),
            0,
          ),
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          taxWithheld: rowData.reduce(
            (sum, row) => sum + (row.taxWithheld || 0),
            0,
          ),
          deductions: rowData.reduce(
            (sum, row) => sum + (row.deductions || 0),
            0,
          ), // Summing billRate values
          netPay: rowData.reduce((sum, row) => sum + (row.netPay || 0), 0),
          employerLiability: rowData.reduce(
            (sum, row) => sum + (row.employerLiability || 0),
            0,
          ),
        },
      ]);
      console.log(pinnedBottomRowData);
    }
  }, [rowData]);

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" }; // Custom inline style for pinned rows
    }
    return null;
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
    <div className="ag-theme-alpine workforce-container">
       <div class="workforce-search-container">
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={handleSearchInputChange}
      />
      </div>
      <div  className={`assignment-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`}>
      <AgGridReact
        rowData={filterData()}
        columnDefs={getColumnsDefList(true, false, true)}
        gridOptions={gridOptions}
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
          filter: true,
        }}
        sideBar={{
          toolPanels: [
            {
              id: "columns",
              labelDefault: "Columns",
              labelKey: "columns",
              iconKey: "columns",
              toolPanel: "agColumnsToolPanel",
              toolPanelParams: {
                suppressRowGroups: false,
                suppressValues: true,
                suppressPivots: false,
                suppressPivotMode: true,
                suppressColumnFilter: true,
                suppressColumnSelectAll: true,
                suppressColumnExpandAll: true,
              },
            },
          ],
        }}
        sortable={true}
        defaultToolPanel="columns"
        domLayout="normal"
        pagination={true}        
        paginationPageSize={100}
        paginationPageSizeSelector={[100,200, 300]}
        enableBrowserTooltips={true} 
        popupParent={document.body} 
        pinnedTopRowData={pinnedBottomRowData} // Set pinned bottom row data here
        getRowStyle={getRowStyle}
      />
      </div>
    </div>
    </div>
  );
};

export default PayrollDetails;
