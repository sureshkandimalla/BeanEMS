import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button } from "antd";
import { ReloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear } from "../Utils/dateFormat";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";
import { useFilteredTotalsRow } from "../Utils/useFilteredTotalsRow";

// Standalone "All Bills" list — every bill across every employee, grouped by
// Employee Name (AG Grid row grouping, which also gives free per-employee
// subtotals). There's no vendor on a Bill in the data model (Bills only
// carry employeeId/projectId/invoiceId/assignmentId), so the vendor shown
// per row is looked up via the bill's employee → employee.vendorId, and only
// shown for C2C employees since vendorId is only meaningful there.
export default function AllBills() {
  const gridRef = useRef(null);
  const [bills, setBills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get(API_ENDPOINTS.getAllBills).then((res) => res.data || []),
      axios.get(API_ENDPOINTS.getAllEmployees).then((res) => res.data || []),
      axios.get(API_ENDPOINTS.getAllVendors).then((res) => res.data || []),
    ])
      .then(([billsData, employeesData, vendorsData]) => {
        setBills(billsData);
        setEmployees(employeesData);
        setVendors(vendorsData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const employeesById = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.employeeId, e])),
    [employees],
  );

  const vendorNameById = useMemo(
    () => Object.fromEntries(vendors.map((v) => [v.vendorId, v.vendorCompanyName || v.vendorName])),
    [vendors],
  );

  const rowData = useMemo(
    () =>
      bills.map((bill) => {
        const employee = employeesById[bill.employeeId];
        const employeeName = employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "";
        const isC2C = employee?.employeeType?.toUpperCase() === "C2C";
        return {
          ...bill,
          employeeName: employeeName || "Unassigned",
          vendorName: isC2C ? vendorNameById[employee.vendorId] || "" : "",
        };
      }),
    [bills, employeesById, vendorNameById],
  );

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    const q = searchText.toLowerCase();
    return rowData.filter((row) =>
      Object.values(row).some((value) => value != null && String(value).toLowerCase().includes(q)),
    );
  }, [rowData, searchText]);

  const sumBillRows = (rows, label) => ({
    employeeName: label,
    billing: rows.reduce((sum, row) => sum + (row.billing || 0), 0),
    hours: rows.reduce((sum, row) => sum + (row.hours || 0), 0),
    total: rows.reduce((sum, row) => sum + (row.total || 0), 0),
    billPaidAmount: rows.reduce((sum, row) => sum + (row.billPaidAmount || 0), 0),
  });

  // Bottom row: grand total across every bill, regardless of the search box
  // or any AG Grid column filter.
  const pinnedBottomRowData = useMemo(
    () => (rowData.length > 0 ? [sumBillRows(rowData, "Total")] : []),
    [rowData],
  );

  // Top row: same totals, but only over rows currently passing both the
  // search box and every AG Grid column/group filter.
  const { pinnedTopRowData, onModelUpdated } = useFilteredTotalsRow((rows) =>
    sumBillRows(rows, "Filtered Total"),
  );

  const onBtnExportDataAsExcel = () => {
    if (gridRef.current) gridRef.current.exportDataAsExcel({ fileName: "all_bills.xlsx" });
  };

  const cellClassRules = {
    darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "employeeName",
        headerName: "Employee Name",
        pinned: "left",
        enableRowGroup: true,
        filter: "agSetColumnFilter",
        cellClassRules,
      },
      { headerName: "Vendor Name", field: "vendorName", filter: "agSetColumnFilter", cellClassRules },
      { headerName: "Description", field: "billType", filter: "agSetColumnFilter", cellClassRules },
      {
        headerName: "Invoice Month",
        field: "invoiceMonth",
        filter: "agSetColumnFilter",
        valueFormatter: (params) => formatMonthYear(params.value),
        cellClassRules,
      },
      {
        headerName: "Billing",
        field: "billing",
        filter: "agNumberColumnFilter",
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
        cellClassRules,
      },
      { headerName: "Hours", field: "hours", filter: "agNumberColumnFilter", aggFunc: "sum", cellClassRules },
      {
        headerName: "Total",
        field: "total",
        filter: "agNumberColumnFilter",
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
        cellClassRules,
      },
      {
        headerName: "Bill PaidAmount",
        field: "billPaidAmount",
        filter: "agNumberColumnFilter",
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value),
        cellClassRules,
      },
      { headerName: "Bill Date", field: "billDate", filter: "agSetColumnFilter", cellClassRules },
      { headerName: "Start Date", field: "startDate", filter: "agSetColumnFilter", cellClassRules },
      { headerName: "End Date", field: "endDate", filter: "agSetColumnFilter", cellClassRules },
      { headerName: "Payment Date", field: "paymentDate", filter: "agSetColumnFilter", cellClassRules },
      { headerName: "Status", field: "status", filter: "agSetColumnFilter", cellClassRules },
      { headerName: "Project Id", field: "projectId", filter: "agSetColumnFilter", cellClassRules },
    ],
    [],
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="ag-theme-alpine project-List-grid">
        <div className="workforce-search-container">
          <Button type="default" icon={<ReloadOutlined />} onClick={fetchData} loading={loading} style={{ marginRight: "10px" }}>
            Refresh
          </Button>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="default" icon={<FileExcelOutlined />} onClick={onBtnExportDataAsExcel} style={{ marginLeft: "10px" }}>
            Export to Excel
          </Button>
        </div>
        <div className="project-grid-wrapper">
          <AgGridReact
            enableCellTextSelection={true}
            ensureDomOrder={true}
            ref={gridRef}
            onGridReady={(params) => {
              gridRef.current = params.api;
            }}
            onSortChanged={(params) => params.api.refreshCells({ force: true })}
            onFilterChanged={(params) => params.api.refreshCells({ force: true })}
            onModelUpdated={onModelUpdated}
            onFirstDataRendered={(params) => {
              try {
                params.api.autoSizeAllColumns();
              } catch (e) {}
            }}
            autoSizeStrategy={{ type: "fitCellContents" }}
            rowHeight={48}
            rowData={filteredRowData}
            columnDefs={sizeColumnsForHeader(columnDefs)}
            groupDefaultExpanded={0}
            suppressAggFuncInHeader={true}
            pinnedTopRowData={pinnedTopRowData}
            pinnedBottomRowData={pinnedBottomRowData}
            getRowStyle={(params) =>
              params.node.rowPinned ? { backgroundColor: "#d3f4ff", fontWeight: "bold" } : null
            }
            defaultColDef={{
              minWidth: 100,
              resizable: true,
              filter: "agSetColumnFilter",
              cellClassRules,
            }}
            rowGroupPanelShow="always"
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
            domLayout="normal"
            enableBrowserTooltips={true}
            popupParent={document.body}
            animateRows={true}
            pagination={true}
            paginationPageSize={100}
            paginationPageSizeSelector={[20, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
}
