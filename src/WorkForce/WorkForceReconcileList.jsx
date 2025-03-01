import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Link } from "react-router-dom";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./WorkForceList.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";

const WorkForceReconcileList = ({ employees, isCollapsed  }) => {  
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  const columnsList = [
    "First Name",
    "Last Name",
    "Income",
    "Expense",
    "Status",
    "Visa",
    "StartDate",
    "EndDate",
    "Annual Pay",
    "Email Id",
    "Phone",
    "DOB",
    "Employment Type"
  ];

  useEffect(() => {
    setRowData(employees);
  }, []);

  const getColumnsDefList = (columnsList, isSortable) => {
    let columns = columnsList.map((column) => {
      let fieldValue = column.split(" ").join("");
      fieldValue = fieldValue[0].toLowerCase() + fieldValue.slice(1);
      if (
        fieldValue.toLowerCase() === "ssn" ||
        fieldValue.toLowerCase() === "dob"
      ) {
        fieldValue = fieldValue.toLowerCase();
      }

      let updatedColumn = column === "DOB" ? "Date of Birth" : column;
      updatedColumn = column;
      let columnFilter;
      if (
        column === "Date of Birth" ||
        column === "startDate" ||
        column === "DOB" ||
        column === "endDate"
      ) {
        columnFilter = "agDateColumnFilter";
      } else if (column === "Annual Pay" || column === "EmployeeId") {
        columnFilter = "agNumberColumnFilter";
      } else {
        columnFilter = "agSetColumnFilter";
      }
      let autoWidth = 0;
      if (column == "Visa") {
        autoWidth = 100;
      } else if (
        column == "Status" ||
        column == "StartDate" ||
        column == "EndDate" ||
        column == "Annual Pay" ||
        column == "Income" ||
        column == "Expense" ||
        column == "SSN"
      ) {
        autoWidth = 145;
      } else {
        const maxDataLength =
          rowData && rowData.length > 0
            ? rowData.reduce((max, row) => {
                const valueLength = row[fieldValue]
                  ? row[fieldValue].toString().length
                  : 0;
                return Math.max(max, valueLength);
              }, column.length)
            : column.length;

        const charWidth = 8;
        const maxAllowedWidth = 25 * charWidth;       
        autoWidth = Math.min(maxDataLength * charWidth + 30, maxAllowedWidth);
      }

      return {
        headerName: updatedColumn,
        field: fieldValue,
        sortable: isSortable,
        editable: true,        
        headerClass: "ag-header-cell",
        filter: columnFilter,
        minWidth: autoWidth,
        suppressSizeToFit: true,
        tooltipValueGetter: (params) => params.value,
        cellClassRules: {
          darkGreyBackground: (params) => {
            return params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1;
          }          
        },
        cellRenderer: (params) => {
          if (column === "First Name" || column === "Last Name") {
            return (
              <Link to="/employeeFullDetails" state={{ rowData: params.data }}>
                {params.value}
              </Link>
            );
          } else if (params.colDef.field === "annualPay") {
            return formatCurrency(params.value);
          } 
          else if (params.colDef.field === "income") {
            return formatCurrency(params.value);
          }
          else if (params.colDef.field === "expense") {
            return formatCurrency(params.value);
          }else {
            return params.value;
          }
        },
        tooltipShowDelay: 0,
      };
    });
    return columns;
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

  const CustomTooltip = (props) => {
    return (
      <div style={{ color: "red", background: "yellow", padding: "5px" }}>
        {props.value}
      </div>
    );
  };
  return (
    <div className="ag-theme-alpine workforce-container">
      <div class="workforce-search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />
      </div>
      <div  className={`ag-workforce-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`}>
        <AgGridReact
          rowData={filterData()}
          frameworkComponents={{ customTooltip: CustomTooltip }}
          columnDefs={getColumnsDefList(columnsList, true, false)}
          defaultColDef={{
            flex: 1,
            resizable: true,
            filter: true,
          }}
          hiddenByDefault={false}
          sideBar={{
            toolPanels: [
              {
                id: "columns",
                labelDefault: "Columns",
                labelKey: "columns",
                iconKey: "columns",
                toolPanel: "agColumnsToolPanel",
                toolPanelParams: {
                  suppressRowGroups: true,
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
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[20, 50, 100]}
          domLayout="normal"            
          enableBrowserTooltips={true} 
          popupParent={document.body}   
        />
      </div>
    </div>
  );
};

export default WorkForceReconcileList;
