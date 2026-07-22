import React, { useState, useEffect, useRef } from "react";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";
import { AgGridReact } from "@ag-grid-community/react";
import { Button } from "antd";
import { ReloadOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ProjectList.css";
import {
  INVOICE_TERM_OPTIONS,
  invoiceTermLabel,
  invoiceTermCode,
} from "../Utils/invoiceTerm";

const ProjectList = ({ projectsList, isCollapsed, onRefresh }) => {
  console.log(projectsList);
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
  const [modifiedRows, setModifiedRows] = useState({});

  const onCellValueChanged = (params) => {
    const projectId = params.data?.projectId;
    if (projectId === undefined || projectId === null) return;
    setModifiedRows((prev) => ({ ...prev, [projectId]: params.data }));
  };

  const handleSaveChanges = () => {
    const rows = Object.values(modifiedRows);
    if (rows.length === 0) return;
    // Bill Rate / Start Date / End Date shown here actually live on the
    // project's Wage record (not the Project entity itself), so those go to
    // the Wage endpoint; everything else editable goes to the Project one.
    const requests = rows.flatMap((row) => {
      const projectUpdate = axios.put(API_ENDPOINTS.projectsById(row.projectId), row);
      if (!row.wageId) return [projectUpdate];
      const wageUpdate = axios.put(API_ENDPOINTS.wagesById(row.wageId), {
        wage: row.billRate,
        startDate: row.startDate,
        endDate: row.endDate,
      });
      return [projectUpdate, wageUpdate];
    });
    Promise.all(requests)
      .then(() => {
        setModifiedRows({});
        onRefresh?.();
      })
      .catch((error) => {
        console.error("Error saving project changes:", error);
      });
  };

  const handleCancelChanges = () => {
    setModifiedRows({});
    onRefresh?.();
  };

  useEffect(() => {
    setRowData((prevState) => (projectsList ? [...projectsList] : prevState));
  }, [projectsList]);

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData);
      setPinnedBottomRowData([
        {
          projectName: "Total",
          billRate: rowData.reduce((sum, row) => sum + (row.billRate || 0), 0),
          net: rowData.reduce((sum, row) => sum + (row.net || 0), 0),
          employeePay: rowData.reduce(
            (sum, row) => sum + (row.employeePay || 0),
            0
          ),
          expenseExternal: rowData.reduce(
            (sum, row) => sum + (row.expenseExternal || 0),
            0
          ), // Summing billRate values
          expenseInternal: rowData.reduce(
            (sum, row) => sum + (row.expenseInternal || 0),
            0
          ),
        },
      ]);
      console.log(pinnedBottomRowData);
    }
  }, [rowData]);

  const getColumnsDefList = (isSortable) => {
    var columns = [
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
      {
        headerName: "Project Id",
        field: "projectId",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Project Name",
        field: "projectName",
        cellRenderer: (params) => {
          // Group rows (e.g. when grouped by another column) have no
          // params.data — just show nothing rather than crashing.
          if (!params.data) return null;
          const rowData = params.data;
          return (
            <Link to="/projectFullDetails" state={{ rowData }}>
              {" "}
              {rowData.projectName}
            </Link>
          );
        },
        sortable: isSortable,
        editable: true,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Employee Name",
        field: "employeeName",
        cellRenderer: (params) => {
          // Group rows (e.g. when grouped by another column) have no
          // params.data — just show nothing rather than crashing.
          if (!params.data) return null;
          const rowData = params.data;
          return (
            <Link
              to={{ pathname: "/employeeProjectDetails", state: { rowData } }}
            >
              {" "}
              {rowData.employeeName}{" "}
            </Link>
          );
        },
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Vendor Name",
        field: "vendorName",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Status",
        field: "status",
        sortable: isSortable,
        editable: true,
        filter: "agSetColumnFilter",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["Active", "Yet to Start", "Closed", "Inactive"],
        },
      },
      {
        headerName: "Bill Rate",
        field: "billRate",
        sortable: isSortable,
        editable: true,
        filter: "agSetColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Bean Net Internal",
        field: "net",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Employee pay Rate",
        field: "employeePay",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "External",
        field: "expenseExternal",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Internal",
        field: "expenseInternal",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Bean Net",
        field: "net",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Client",
        field: "clientName",
        sortable: isSortable,
        editable: false,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Project Start Date",
        field: "startDate",
        sortable: isSortable,
        editable: true,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Project End Date",
        field: "endDate",
        sortable: isSortable,
        editable: true,
        filter: "agSetColumnFilter",
      },
      {
        headerName: "Invoice Terms",
        field: "invoiceTerm",
        sortable: isSortable,
        editable: true,
        filter: "agSetColumnFilter",
        // Backend stores/edits a numeric code; grid always shows/edits the text label.
        valueGetter: (params) => invoiceTermLabel(params.data?.invoiceTerm),
        valueSetter: (params) => {
          params.data.invoiceTerm = invoiceTermCode(params.newValue);
          return true;
        },
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: INVOICE_TERM_OPTIONS.map((option) => option.label),
        },
      },
    ];
    return columns;
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const filterData = () => {
    if (!searchText) {
      console.log(rowData)
      return rowData;
    }

    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };
  return (
    <div className="ag-theme-alpine project-List-grid">
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
        {Object.keys(modifiedRows).length > 0 && (
          <>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveChanges}
              style={{ marginLeft: "10px" }}
            >
              Save
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancelChanges}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      <div className={`project-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`}>
        <AgGridReact
          ref={gridRef}
          onGridReady={(params) => {
            gridRef.current = params.api;
          }}
          onCellValueChanged={onCellValueChanged}
          onFirstDataRendered={(params) => {
            try { params.api.autoSizeAllColumns(); } catch (e) {}
          }}
          autoSizeStrategy={{ type: "fitCellContents" }}
          rowHeight={48}
          rowData={filterData()}
          enableFilter={true}
          columnDefs={sizeColumnsForHeader(getColumnsDefList(true))}
          defaultColDef={{
            minWidth: 100,
            maxWidth: 220,
            resizable: true,
            filter: "agSetColumnFilter",
            enableRowGroup: true,
            headerClass: "ag-header-cell",
            cellClassRules: {
              darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
            }
          }}
          hiddenByDefault={false}
          rowGroupPanelShow="always"
          pivotPanelShow="always"
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
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[20, 50, 100]}
          domLayout="normal"
          pinnedBottomRowData={pinnedBottomRowData}
          enableBrowserTooltips={true}
          popupParent={document.body}
        />
      </div>
    </div>
  );
};

export default ProjectList;
