import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatDate } from "../Utils/dateFormat";

const PayrollDetails = ({ rowData: externalRowData, onRefresh, employeeId, isCollapsed, gridHeight = "calc(100vh - 500px)" }) => {
  const [searchText, setSearchText] = useState("");
  const [internalRowData, setInternalRowData] = useState([]);
  const gridRef = useRef(null);

  const rowData = employeeId ? internalRowData : (externalRowData || []);

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  const fetchData = () => {
    axios
      .get(API_ENDPOINTS.getPayrollsForEmp(employeeId))
      .then((response) => setInternalRowData(response.data || []))
      .catch((error) => console.error("Error fetching payroll:", error));
  };

  const formatDateCell = (params) => formatDate(params.value);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Payroll Summary Id",
        field: "payrollSummaryId",
        sortable: true,
        minWidth: 160,
        hide: true,
        valueFormatter: (params) =>
          params.node.rowPinned === "top" ? "Total" : params.value,
      },
      { headerName: "Employee Id", field: "employeeId", sortable: true, hide: true },
      {
        headerName: "Employee Name",
        field: "employeeName",
        sortable: true,
        minWidth: 180,
        pinned: "left",
        enableRowGroup: true,
        rowGroup: !employeeId,
      },
      {
        headerName: "Year",
        field: "checkDate",
        colId: "checkYear",
        sortable: true,
        enableRowGroup: true,
        filter: "agSetColumnFilter",
        valueGetter: (params) =>
          params.data?.checkDate ? params.data.checkDate.substring(0, 4) : null,
        valueFormatter: (params) =>
          params.node.rowPinned === "top" ? "" : params.value,
      },
      {
        headerName: "Pay Check Date",
        field: "checkDate",
        sortable: true,
        valueFormatter: formatDateCell,
      },
      { headerName: "Hours", field: "hours", sortable: true, aggFunc: "sum" },
      {
        headerName: "Total Paid",
        field: "totalPaid",
        sortable: true,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Net Pay",
        field: "netPay",
        sortable: true,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Tax Withheld",
        field: "taxWithheld",
        sortable: true,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Deductions",
        field: "deductions",
        sortable: true,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Employer Liability",
        field: "employerLiability",
        sortable: true,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      { headerName: "Pay Period", field: "payPeriodId", sortable: true, hide: true },
      { headerName: "Department", field: "department", sortable: true, enableRowGroup: true },
      {
        headerName: "Pay Cycle Start",
        field: "payPeriodStartDate",
        sortable: true,
        valueFormatter: formatDateCell,
      },
      {
        headerName: "Pay Cycle End",
        field: "payPeriodEndDate",
        sortable: true,
        valueFormatter: formatDateCell,
      },
      { headerName: "Status", field: "status", sortable: true, enableRowGroup: true },
    ],
    [employeeId],
  );

  const pinnedTopRowData = useMemo(() =>
    rowData.length > 0
      ? [
          {
            payrollSummaryId: "Total",
            totalPaid: rowData.reduce((sum, row) => sum + (row.totalPaid || 0), 0),
            hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
            taxWithheld: rowData.reduce((sum, row) => sum + (row.taxWithheld || 0), 0),
            deductions: rowData.reduce((sum, row) => sum + (row.deductions || 0), 0),
            netPay: rowData.reduce((sum, row) => sum + (row.netPay || 0), 0),
            employerLiability: rowData.reduce((sum, row) => sum + (row.employerLiability || 0), 0),
          },
        ]
      : [],
  [rowData]);

  useEffect(() => {
    if (gridRef.current?.api && pinnedTopRowData.length > 0) {
      gridRef.current.api.setGridOption("pinnedTopRowData", pinnedTopRowData);
    }
  }, [pinnedTopRowData]);

  const handleExport = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsExcel({
        fileName: "payroll_summary.xlsx",
      });
    }
  };

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" };
    }
    return null;
  };

  return (
    <div
      className="ag-theme-alpine employee-List-grid"
      style={{ flex: 1, height: "100%", overflow: "hidden" }}
    >
      <Card className="employeeTableCard" style={{ height: "100%", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {(onRefresh || employeeId) && (
              <Button
                style={{ marginRight: "10px" }}
                type="default"
                icon={<ReloadOutlined />}
                onClick={employeeId ? fetchData : onRefresh}
              >
                Refresh
              </Button>
            )}
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              style={{ marginLeft: "8px" }}
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export Excel
            </Button>
          </div>
        </div>

        <div
          style={{
            height: gridHeight,
            minHeight: 300,
            width: "100%",
            overflow: "hidden",
            transition: "height 0.3s ease-in-out",
          }}
        >
          <AgGridReact
            ref={gridRef}
            onFirstDataRendered={(params) => {
              try { params.api.autoSizeAllColumns(); } catch (e) {}
            }}
            autoSizeStrategy={{ type: "fitCellContents" }}
            rowHeight={48}
            rowData={rowData}
            quickFilterText={searchText}
            columnDefs={sizeColumnsForHeader(columnDefs)}
            pinnedTopRowData={pinnedTopRowData}
            defaultColDef={{
              minWidth: 100,
              maxWidth: 220,
              resizable: true,
              filter: true,
              floatingFilter: false,
              headerClass: "ag-header-cell",
              cellClassRules: {
                darkGreyBackground: (params) =>
                  params.node?.rowIndex !== undefined &&
                  params.node.rowIndex % 2 === 1,
              },
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
            rowGroupPanelShow="always"
            domLayout="normal"
            pagination={true}
            paginationPageSize={100}
            paginationPageSizeSelector={[100, 200, 300]}
            getRowStyle={getRowStyle}
            popupParent={document.body}
          />
        </div>
      </Card>
    </div>
  );
};

export default PayrollDetails;
