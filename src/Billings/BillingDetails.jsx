import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "react-datepicker/dist/react-datepicker.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import "./BillingDetails.css"

const BillingDetails = ({ url, isCollapsed }) => {
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  const navigate = useNavigate();
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
    //default status =viewAll
    setRowData([]);
    const today = new Date();
    axios
      .get(url, {
        params: {
          // selectedDate: '2023-11-01',//formattedDate,
          //status: 'viewAll'
        },
      })
      .then((response) => {
        console.log(response.data);
        const data = getFlattenedData(response.data);
        setRowData(data);
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
        headerName: "Description",
        field: "billType",
        sortable: isSortable,
        width: 250,
      },
      {
        headerName: "InvoiceMonth",
        field: "invoiceMonth",
        sortable: isSortable,
        valueFormatter: (params) => {
          if (!params.value) return ""; // Handle empty or undefined values
          const date = new Date(params.value);
          return date.toLocaleDateString("en-US", {
            month: "short", // Short month format (e.g., Mar)
            year: "numeric", // Full year format
          });
        },
      },
      {
        headerName: "Billing",
        field: "billing",
        sortable: isSortable,
        valueFormatter: (params) => {
          // Check if this is a pinned row
          if (params.node.rowPinned) {
            return params.value; // Return the raw value without formatting
          }

          // Apply formatting for non-pinned rows
          return formatCurrency(params.value);
        },
      },
      { headerName: "Hours", field: "hours", sortable: isSortable },
      {
        headerName: "Total",
        field: "total",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      {
        headerName: "Bill PaidAmount",
        field: "billPaidAmount",
        sortable: isSortable,
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      { headerName: "BillDate", field: "billDate", sortable: isSortable },
      { headerName: "Start Date", field: "startDate", sortable: isSortable },
      { headerName: "End Date", field: "endDate", sortable: isSortable },
      {
        headerName: "Payment Date",
        field: "paymentDate",
        sortable: isSortable,
      },
      { headerName: "Status", field: "status", sortable: isSortable },
    ];
    return columns;
  };

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10, // Number of rows to show per page
    domLayout: "normal",
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

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData);
      setPinnedBottomRowData([
        {
          billType: "Total",
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          total: rowData.reduce((sum, row) => sum + (row.total || 0), 0),
          billPaidAmount: rowData.reduce(
            (sum, row) => sum + (row.billPaidAmount || 0),
            0
          ), // Summing billRate values
        },
      ]);
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
    <div
      className="workforce-search-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: "0px" }}>
        {/* Any additional elements can be added here */}
      </div>
    </div>

    <div
      className={`billing-grid-wrapper ${
        !isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"
      }`}
    >
      <AgGridReact
        rowData={filterData()}
        columnDefs={getColumnsDefList(true)}
        gridOptions={gridOptions}
        defaultColDef={{
          minWidth: 150,
          filter: true,
          floatingFilter: false,
          cellClassRules: {
            darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
          } 
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
        pinnedTopRowData={pinnedBottomRowData}
        getRowStyle={getRowStyle}
      />
    </div>
  </div>
</div>

  );
};

export default BillingDetails;
