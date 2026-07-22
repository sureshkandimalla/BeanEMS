import React, { useState, useEffect, useRef, useMemo } from "react";
import API_ENDPOINTS, { expenseStatusList, expenseTypeList } from "../config";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card, Drawer } from "antd";
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../Invoice/Invoice.css";
import NewExpense from "./NewExpense";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatDate } from "../Utils/dateFormat";

const editableUnlessReimbursed = (params) => params.data?.status !== "Reimbursed";

// employeeId is optional — when provided (e.g. embedded in the Employee Full
// Details tab), the grid scopes down to just that employee's expenses.
// statusFilter is likewise optional — when provided, only expenses with that
// exact status are shown.
const ExpenseDetails = ({ employeeId, statusFilter, gridHeight } = {}) => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  const [employees, setEmployeesData] = useState([]);
  const [pinnedTopRowData, setPinnedTopRowData] = useState([]);
  const [modifiedRows, setModifiedRows] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  useEffect(() => {
    fetch(API_ENDPOINTS.getEmployees)
      .then((response) => response.json())
      .then((data) => setEmployeesData(data || []))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  const employeesById = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.employeeId, employee])),
    [employees],
  );

  const fetchData = () => {
    setRowData([]);
    const request = employeeId
      ? axios.get(API_ENDPOINTS.getExpensesForEmployee(employeeId))
      : axios.get(API_ENDPOINTS.getAllExpenses);
    request
      .then((response) => setRowData(response.data || []))
      .catch((error) => console.error("Error fetching expenses:", error));
  };

  // Merge in each expense's employee-derived display name as a real
  // property (not just an AG Grid valueGetter) so the search box — which
  // searches Object.values(row) — can actually match against it too.
  const enrichedRowData = useMemo(() => {
    if (!rowData) return rowData;
    const enriched = rowData.map((row) => ({
      ...row,
      employeeName: employeesById[row.employeeId]?.name || "",
    }));
    let scoped = enriched;
    if (statusFilter) {
      scoped = scoped.filter(
        (row) => (row.status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    return scoped;
  }, [rowData, employeesById, statusFilter]);

  const onCellValueChanged = (params) => {
    const expenseId = params.data?.expenseId;
    if (expenseId === undefined || expenseId === null) return;
    setModifiedRows((prev) => ({ ...prev, [expenseId]: params.data }));
  };

  const handleSaveChanges = () => {
    const rows = Object.values(modifiedRows);
    if (rows.length === 0) return;
    Promise.all(rows.map((row) => axios.put(API_ENDPOINTS.expenseById(row.expenseId), row)))
      .then(() => {
        setModifiedRows({});
        fetchData();
      })
      .catch((error) => console.error("Error saving expense changes:", error));
  };

  const handleCancelChanges = () => {
    setModifiedRows({});
    fetchData();
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const filterData = () => {
    if (!searchText) return enrichedRowData;
    return (enrichedRowData || []).filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  useEffect(() => {
    const visibleRows = filterData();
    if (visibleRows && visibleRows.length > 0) {
      setPinnedTopRowData([
        {
          expenseId: "Total",
          amount: visibleRows.reduce((sum, row) => sum + (row.amount || 0), 0),
        },
      ]);
    } else {
      setPinnedTopRowData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichedRowData, searchText]);

  const onBtnExportDataAsExcel = () => {
    if (gridRef.current) {
      gridRef.current.exportDataAsExcel();
    }
  };

  const addNewExpense = () => setOpen(true);
  const onClose = () => setOpen(false);

  const getColumnsDefList = (isSortable) => [
    {
      headerName: "Expense Id",
      field: "expenseId",
      sortable: isSortable,
      valueFormatter: (params) =>
        params.node.rowPinned === "top" ? "Total" : params.value,
    },
    { headerName: "Employee Name", field: "employeeName", sortable: isSortable, enableRowGroup: true },
    {
      headerName: "Description",
      field: "description",
      sortable: isSortable,
      editable: editableUnlessReimbursed,
      minWidth: 220,
    },
    {
      headerName: "Expense Type",
      field: "expenseType",
      sortable: isSortable,
      editable: editableUnlessReimbursed,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: expenseTypeList.map((t) => t.value) },
      enableRowGroup: true,
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: isSortable,
      editable: editableUnlessReimbursed,
      aggFunc: "sum",
      valueFormatter: (params) =>
        params.node.rowPinned === "top" ? formatCurrency(params.value) : formatCurrency(params.value),
    },
    {
      headerName: "Reimbursable",
      field: "reimbursable",
      sortable: isSortable,
      editable: editableUnlessReimbursed,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: [true, false] },
      valueFormatter: (params) =>
        params.node.rowPinned === "top" ? "" : params.value ? "Yes" : "No",
      enableRowGroup: true,
    },
    {
      headerName: "Date",
      field: "expenseDate",
      sortable: isSortable,
      editable: editableUnlessReimbursed,
      valueFormatter: (params) =>
        params.node.rowPinned === "top" ? "" : formatDate(params.value),
    },
    {
      headerName: "Status",
      field: "status",
      sortable: isSortable,
      editable: editableUnlessReimbursed,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: expenseStatusList.map((s) => s.value) },
      enableRowGroup: true,
    },
  ];

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" };
    }
    return null;
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="ag-theme-alpine employee-List-grid">
        <Card className="employeeTableCard" style={{ height: "100%" }}>
          <Drawer title="Add New Expense" placement="right" size="large" onClose={onClose} open={open}>
            <NewExpense onClose={() => { onClose(); fetchData(); }} employeeId={employeeId} />
          </Drawer>
          <div className="workforce-search-container" style={{ gap: "32px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={fetchData}
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
                <>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveChanges}
                    style={{ marginLeft: "10px" }}
                  >
                    Save
                  </Button>
                  <Button icon={<CloseOutlined />} onClick={handleCancelChanges} style={{ marginLeft: "10px" }}>
                    Cancel
                  </Button>
                </>
              )}
              <Button
                style={{ marginLeft: "20px" }}
                type="primary"
                className="button-vendor"
                onClick={addNewExpense}
              >
                <PlusOutlined /> Add New Expense
              </Button>
            </div>
          </div>
          <div
            className="invoice1-grid-wrapper"
            style={gridHeight ? { height: gridHeight, maxHeight: gridHeight } : undefined}
          >
            <AgGridReact
              ref={gridRef}
              onGridReady={(params) => {
                gridRef.current = params.api;
              }}
              onFirstDataRendered={(params) => {
                try {
                  params.api.autoSizeAllColumns();
                } catch (e) {}
              }}
              autoSizeStrategy={{ type: "fitCellContents" }}
              onCellValueChanged={onCellValueChanged}
              rowHeight={48}
              rowData={filterData()}
              columnDefs={sizeColumnsForHeader(getColumnsDefList(true))}
              defaultColDef={{
                minWidth: 100,
                maxWidth: 220,
                resizable: true,
                filter: "agSetColumnFilter",
                headerClass: "ag-header-cell",
                cellClassRules: {
                  darkGreyBackground: (params) =>
                    params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
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
              paginationPageSizeSelector={[20, 50, 100]}
              pinnedTopRowData={pinnedTopRowData}
              getRowStyle={getRowStyle}
              enableBrowserTooltips={true}
              popupParent={document.body}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseDetails;
