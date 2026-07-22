import React, { useState, useEffect , useCallback, useRef, useMemo} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, message } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./WorkForceList.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { FileExcelOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import API_ENDPOINTS, { workingStatusList, workAuthorizationList, companyList } from "../config";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";

const employmentTypeOptions = ["Full-Time", "Part-Time", "Hourly", "W2", "C2C", "1099"];
const i9EverifyStatusOptions = ["Completed", "In Progress", "Failed"];

const WorkForceList = ({ employees, isCollapsed, onRefresh }) => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [modifiedRows, setModifiedRows] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const columnsList = [
    "First Name",
    "Last Name",
    "Visa",
    "Status",
    "Company Name",
    "Everify Status",
    "I9",
    "Paf",
    "Annual Pay",
    "Designation",
    "StartDate",
    "Employee Id",
    "Primary Skills",
    "Work City",
    "Work Country",
    "Email Id",
    "Phone",
    "DOB",
    "EndDate",
    "Employment Type",
    "SSN",
    "Tax Term",
    "Referred By",
    "Gender",
    "Employee Type",
    "Location",
    "Secondary Skills",
    "Resource Type",
    "Employee Dept",
    "Payroll Start",
    "Insurance",
    "Last Updated",
  ];

  useEffect(() => {
    setRowData(Array.isArray(employees) ? employees : []);
  }, [employees]);

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
          color: "#E7E4EC",
          pattern: "Solid",
        },
        font: {
          fontName: "Calibri Light",
          color: "#000000",
        },
      },
      {
        id: "blueUnderline",
        font: {
          fontName: "Calibri Light",    
          color: "#0000EE",     
        },
      },
      
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
      // Every column uses the checkbox/select-values Set Filter — kept
      // consistent across every grid in the app rather than per-type
      // filter widgets (contains/equals/etc.).
      const columnFilter = "agSetColumnFilter";
      let autoWidth = 0;
      if (column == "Visa") {
        autoWidth = 110;
      } else if (
        column == "Status" ||
        column == "StartDate" ||
        column == "EndDate" ||
        column == "Annual Pay" ||
        column == "SSN"
      ) {
        autoWidth = 145;
      } else {
        autoWidth = 170;
        // const maxDataLength =
        //   rowData && rowData.length > 0
        //     ? rowData.reduce((max, row) => {
        //         const valueLength = row[fieldValue]
        //           ? row[fieldValue].toString().length
        //           : 0;
        //         return Math.max(max, valueLength);
        //       }, column.length)
        //     : column.length;

        // const charWidth = 8;
        // const maxAllowedWidth = 25 * charWidth;       
        // autoWidth = Math.min(maxDataLength * charWidth + 30, maxAllowedWidth);
      }

      const isPinnedColumn = column === "First Name" || column === "Last Name";

      let cellEditor;
      let cellEditorParams;
      if (fieldValue === "status") {
        cellEditor = "agSelectCellEditor";
        cellEditorParams = { values: workingStatusList.map((o) => o.value) };
      } else if (fieldValue === "visa") {
        cellEditor = "agSelectCellEditor";
        cellEditorParams = { values: workAuthorizationList.map((o) => o.value) };
      } else if (fieldValue === "companyName") {
        cellEditor = "agSelectCellEditor";
        cellEditorParams = { values: companyList.map((o) => o.value) };
      } else if (fieldValue === "employmentType") {
        cellEditor = "agSelectCellEditor";
        cellEditorParams = { values: employmentTypeOptions };
      } else if (fieldValue === "i9" || fieldValue === "everifyStatus") {
        cellEditor = "agSelectCellEditor";
        cellEditorParams = { values: i9EverifyStatusOptions };
      }

      return {
        colId: fieldValue,
        headerName: updatedColumn,
        field: fieldValue,
        sortable: isSortable,
        editable: true,
        cellEditor,
        cellEditorParams,
        headerClass: column === "Employee Id" ? "ag-center-cols" : "ag-header-cell",
        filter: columnFilter,
        minWidth: autoWidth,
        pinned: isPinnedColumn ? "left" : undefined,
        lockPinned: isPinnedColumn,
        suppressSizeToFit: true,
        tooltipValueGetter: (params) => params.value,
        cellClassRules: {
          darkGreyBackground: (params) => {
            return params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1;
          },
          blueUnderline: (params) => {
            return params.colDef.field === "emailId";
          },
          centerAlign: (params) => {
            return params.colDef.field === "employeeId";
          }
        },
        cellClass: column === "Employee Id" ? "ag-center-cols" : undefined,
        cellStyle: column === "Employee Id" ? { textAlign: "center" } : undefined,
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
    if (gridRef.current) {
      gridRef.current.exportDataAsExcel();
    }
  }, []);

  const onCellValueChanged = useCallback((params) => {
    const employeeId = params.data?.employeeId;
    if (employeeId === undefined || employeeId === null) return;
    setModifiedRows((prev) => ({ ...prev, [employeeId]: params.data }));
  }, []);

  const saveChanges = useCallback(() => {
    const rows = Object.values(modifiedRows);
    if (rows.length === 0) return;
    setIsSaving(true);
    Promise.all(
      rows.map((row) => axios.put(API_ENDPOINTS.updateEmployee(row.employeeId), row)),
    )
      .then(() => {
        message.success(`${rows.length} employee record(s) saved successfully`);
        setModifiedRows({});
        if (onRefresh) onRefresh();
      })
      .catch(() => {
        message.error("One or more records failed to save. Please try again.");
      })
      .finally(() => setIsSaving(false));
  }, [modifiedRows, onRefresh]);

  // Ensure we always return an array for AgGrid rowData
  const filterData = () => {
    const source = Array.isArray(rowData) ? rowData : [];
    if (!searchText) {
      return source;
    }

    return source.filter((row) =>
      Object.values(row || {}).some((value) =>
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

  // compute columnDefs once per rowData change
  const workforceColumnDefs = useMemo(() => {
    return [
      {
        colId: "rowNum",
        headerName: "#",
        valueGetter: (params) => params.node.rowIndex + 1,
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        pinned: "left",
        lockPosition: true,
        suppressMovable: true,
        sortable: false,
        filter: false,
        editable: false,
        suppressSizeToFit: true,
        cellStyle: { textAlign: "center", fontWeight: 500 },
        headerClass: "ag-center-cols",
        cellClassRules: {
          darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
        },
      },
      ...getColumnsDefList(columnsList, true, false),
    ];
  }, [rowData]);

  // Append any additional fields present in service response that are not in the default columns
  const combinedColumnDefs = useMemo(() => {
    try {
      const base = Array.isArray(workforceColumnDefs) ? [...workforceColumnDefs] : [];
      if (!Array.isArray(rowData) || rowData.length === 0) return base;
      const sample = rowData[0] || {};
      const existingFields = new Set(base.map(c => c.field).filter(Boolean));
      // Only include primitive fields (string, number, boolean) or null — skip objects/arrays
      const extraKeys = Object.keys(sample).filter(k => {
        if (existingFields.has(k) || k.startsWith('__')) return false;
        const v = sample[k];
        return v === null || ["string", "number", "boolean"].includes(typeof v);
      });
      const extras = extraKeys.map(k => ({
        colId: k,
        headerName: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
        field: k,
        sortable: true,
        filter: "agSetColumnFilter",
        resizable: true,
        minWidth: 120,
        cellClassRules: {
          darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
        },
      }));
      return [...base, ...extras];
    } catch (e) {
      return workforceColumnDefs;
    }
  }, [workforceColumnDefs, rowData]);

  // Force the grid to match our intended order/pin state — AG Grid preserves
  // existing columns' live position across columnDefs updates rather than
  // re-deriving it from array order, which can drift once extra columns
  // (discovered from the API response) are appended after the initial mount.
  useEffect(() => {
    if (!gridRef.current || !Array.isArray(combinedColumnDefs) || combinedColumnDefs.length === 0) return;
    try {
      gridRef.current.applyColumnState({
        state: combinedColumnDefs.map((c) => ({ colId: c.colId, pinned: c.pinned ?? null })),
        applyOrder: true,
      });
    } catch (e) {}
  }, [combinedColumnDefs]);

  // debug: log row/column state to diagnose empty grid
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug('WorkForceList debug: rowData.length=', Array.isArray(rowData) ? rowData.length : typeof rowData);
      // eslint-disable-next-line no-console
      console.debug('WorkForceList debug: combinedColumnDefs=', Array.isArray(combinedColumnDefs) ? combinedColumnDefs.length : typeof combinedColumnDefs);
      if (Array.isArray(rowData) && rowData.length > 0) {
        // eslint-disable-next-line no-console
        console.debug('WorkForceList sample row:', rowData[0]);
      }
    } catch (e) {}
  }, [rowData, combinedColumnDefs]);

  return (
    <div className="ag-theme-alpine workforce-container">
      <div className="workforce-search-container">
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          style={{ marginRight: "10px" }}
        >
          Refresh
        </Button>
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
    {Object.keys(modifiedRows).length > 0 && (
      <Button
        type="primary"
        ghost
        icon={<SaveOutlined />}
        onClick={saveChanges}
        loading={isSaving}
        style={{ marginLeft: "10px" }}
      >
        Save Changes
      </Button>
    )}
      </div>
      
      <div  className={`workforce-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <AgGridReact
          ref={gridRef}
          onGridReady={(params) => {
            gridRef.current = params.api;
          }}
          onFirstDataRendered={(params) => {
            try { params.api.autoSizeAllColumns(); } catch (e) {}
          }}
          autoSizeStrategy={{ type: "fitCellContents" }}
          rowHeight={48}
          rowData={filterData()}
          getRowId={(params) => String(params.data.employeeId)}
          onCellValueChanged={onCellValueChanged}
          frameworkComponents={{ customTooltip: CustomTooltip }}
          columnDefs={sizeColumnsForHeader(combinedColumnDefs)}
           defaultColDef={{
             resizable: true,
             filter: "agSetColumnFilter" ,
             minWidth: 100,
             maxWidth: 220,
             enableRowGroup: true,
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
          rowGroupPanelShow="always"
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
