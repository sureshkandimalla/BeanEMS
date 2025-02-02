import React, { useState, useEffect , useCallback, useRef} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./WorkForceList.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { FileExcelOutlined } from "@ant-design/icons";


const WorkForceList = ({ employees, isCollapsed  }) => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  const [gridApi, setGridApi] = useState(null);
  const columnsList = [
    "First Name",
    "Last Name",
    "Visa",
    "Status",
    "Annual Pay",
    "Designation",
    "StartDate",
    "Primary Skills",
    "Work City",
    "Work Country",
    "Email Id",
    "Phone",
    "DOB",
    "EndDate",
    "Employment Type",
    "SSN",
  ];

  useEffect(() => {
    setRowData(employees);
  }, []);

  const excelStyles = [
      {
        id: "cell",
        alignment: {
          vertical: "Center",
        },
      },         
      {
        id: "darkGreyBackground",
        interior: {
          color: "#CEDBC7",
          pattern: "Solid",
        },
        font: {
          fontName: "Calibri Light",
          color: "#006400",
        },
      },
      {
        id: "blueUnderline",
        font: {
          fontName: "Calibri Light",    
          color: "#0000EE",     
        },
      }
    ];

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
        headerClass: "ag-header-cell" ,
        filter: columnFilter,
        minWidth: autoWidth,
        suppressSizeToFit: true,
        tooltipValueGetter: (params) => params.value,
        cellClassRules: {
          darkGreyBackground: (params) => {
            return params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 0;
          },
          blueUnderline: (params) => {
            console.log(params.colDef)
            return params.colDef.field === "emailId";
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
          } else {
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

  const onBtnExportDataAsExcel = useCallback(() => {
    if (gridRef.current && gridRef.current.api) { 
      gridRef.current.api.exportDataAsExcel();
    }
  }, []);

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
         <Button 
      type="default" 
      icon={<FileExcelOutlined />} 
      onClick={onBtnExportDataAsExcel}
      style={{ marginLeft: "10px" }}
    >
      Export to Excel
    </Button>
      </div>
      
      <div  className={`ag-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`}>
        <AgGridReact
          ref={gridRef}
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
          excelStyles={excelStyles}                 
        />
      </div>
    </div>
  );
};

export default WorkForceList;
