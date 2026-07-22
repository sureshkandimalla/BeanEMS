import React, { useState, useEffect, useRef, useMemo } from "react";
import API_ENDPOINTS from "../config";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card, Drawer, message } from "antd";

import { PlusOutlined, ReloadOutlined, FileExcelOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./Invoice.css";
import NewInvoice from "./NewInvoice";
import GenerateInvoiceDetails from "./GenerateInvoiceDetails";
import MonthlyTimesheetDialog from "../Project/TimeSheet/MonthlyTimeSheetModal";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear } from "../Utils/dateFormat";

// employeeId/projectId are optional — when provided (e.g. embedded in the
// Employee Full Details "INVOICES" tab, or the Project Full Details
// "Invoices" tab), the grid scopes down to just that employee's/project's
// invoices, with every other feature (search, edit, Save/Cancel, Export to
// Excel, Add New Invoice, Generate Invoice, totals) unchanged. statusFilter
// is likewise optional — when provided (e.g. embedded in a status tab on
// the Dashboard), only invoices with that exact status are shown.
const InvoiceDetails = ({ employeeId, projectId, statusFilter, isCollapsed, gridHeight, onRefresh } = {}) => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [rowData, setRowData] = useState();
  const [projects, setProjectsData] = useState([]);
  const navigate = useNavigate();
  const [pinnedTopRowData, setPinnedTopRowData] = useState([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  //  const columnsList = ['Customer Id', 'Company Name', 'Email Id', 'Phone', 'Status', 'ein', 'Website','startDate','endDate' ];
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
        fetchData();
    } else {
      isInitialRender.current = false;
    }
  }, []);

  // Projects carry their own employeeName/projectName/vendorName — used to
  // look up those display columns for each invoice by its projectId.
  useEffect(() => {
    fetch(API_ENDPOINTS.getProjects)
      .then((response) => response.json())
      .then((data) => setProjectsData(data || []))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.projectId, project])),
    [projects],
  );

  // Merge in each invoice's project-derived display fields as real
  // properties (not just AG Grid valueGetters) so the search box — which
  // searches Object.values(row) — can actually match against them too.
  const enrichedRowData = useMemo(() => {
    if (!rowData) return rowData;
    const enriched = rowData.map((row) => {
      const project = projectsById[row.projectId];
      return {
        ...row,
        employeeName: project?.employeeName || "",
        projectName: project?.projectName || "",
        vendorName: project?.vendorName || "",
      };
    });
    let scoped = enriched;
    if (projectId) {
      // Invoices carry projectId directly, so this scoping is exact.
      scoped = scoped.filter((row) => Number(row.projectId) === Number(projectId));
    }
    if (employeeId) {
      // Invoices only carry a projectId, so resolve each invoice's project
      // to find its employeeId. Compared as Numbers since the
      // caller-supplied employeeId and the project's own employeeId aren't
      // guaranteed to be the same type.
      scoped = scoped.filter(
        (row) => Number(projectsById[row.projectId]?.employeeId) === Number(employeeId),
      );
    }
    if (statusFilter) {
      scoped = scoped.filter(
        (row) => (row.status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    return scoped;
  }, [rowData, projectsById, employeeId, projectId, statusFilter]);

  const fetchData = () => {
    //default status =viewAll
    setRowData([]);
    axios
      .get(
        API_ENDPOINTS.getAllInvoices,
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

  // Double-click any editable cell (Invoice Id / Invoice Month / Hours) to
  // edit in place — this is AG Grid's built-in editing interaction, no extra
  // wiring needed once a column is marked `editable`. Pending edits are
  // tracked here so the Save/Cancel buttons only appear once something has
  // actually changed.
  const [modifiedRows, setModifiedRows] = useState({});

  const onCellValueChanged = (params) => {
    const invoiceId = params.data?.invoiceId;
    if (invoiceId === undefined || invoiceId === null) return;

    if (params.column.colId === "hours") {
      const hours = Number(params.data.hours) || 0;
      const billing = Number(params.data.billing) || 0;
      params.data.total = hours * billing;
      params.api.refreshCells({ rowNodes: [params.node], columns: ["total"] });
    }

    setModifiedRows((prev) => ({ ...prev, [invoiceId]: params.data }));
  };

  const handleSaveChanges = () => {
    const rows = Object.values(modifiedRows);
    if (rows.length === 0) return;
    Promise.all(
      rows.map((row) => axios.put(API_ENDPOINTS.invoiceById(row.invoiceId), row)),
    )
      .then(() => {
        setModifiedRows({});
        fetchData();
        onRefresh?.();
      })
      .catch((error) => {
        console.error("Error saving invoice changes:", error);
      });
  };

  const handleCancelChanges = () => {
    // Discard local edits by simply refetching clean data from the server.
    setModifiedRows({});
    fetchData();
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // //alert(date.toISOString().split('T')[0]);
    // const formttedDate = date.toISOString().split('T')[0]; //yyyy-mm-dd
    // fetchData(formttedDate);
  };

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
      //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
      return { ...dataObj };
    });
    return updatedData || [];
  };

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);

  const handleOpenTimesheet = (employee) => {
    setSelectedEmployee(employee);
    setIsTimesheetOpen(true);
  };

  const handleSaveTimesheet = (totalHours) => {
    setRowData((prevData) =>
      prevData.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, hours: totalHours } : emp,
      ),
    );
    setIsTimesheetOpen(false);
  };

  const getColumnsDefList = (isSortable, isEditable, hasFilter) => {
    // Paid invoices are locked — nothing on the row is editable once paid.
    const editableUnlessPaid = (params) => params.data?.status !== "Paid";

    var columns = [
      {
        headerName: "Invoice Id",
        field: "invoiceId",
        sortable: isSortable,
        editable: editableUnlessPaid,
        valueFormatter: (params) => {
          // Check if this row is the pinned bottom row and show "Total"
          return params.node.rowPinned === "bottom" ? "Total" : params.value;
        },
      },
      { headerName: "Employee Name", field: "employeeName", sortable: isSortable, enableRowGroup: true },
      { headerName: "Vendor Name", field: "vendorName", sortable: isSortable, enableRowGroup: true },
      {
        headerName: "Year",
        field: "invoiceMonth",
        colId: "invoiceYear",
        sortable: isSortable,
        enableRowGroup: true,
        filter: "agSetColumnFilter",
        valueGetter: (params) =>
          params.data?.invoiceMonth ? params.data.invoiceMonth.substring(0, 4) : null,
        valueFormatter: (params) =>
          params.node.rowPinned === "bottom" ? "" : params.value,
      },
      {
        headerName: "InvoiceMonth",
        field: "invoiceMonth",
        sortable: isSortable,
        editable: editableUnlessPaid,
        enableRowGroup: true,
        valueFormatter: (params) => formatMonthYear(params.value),
      },
      {
        headerName: "Billing",
        field: "billing",
        sortable: isSortable,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      {
        headerName: "Hours",
        field: "hours",
        sortable: isSortable,
        editable: editableUnlessPaid,
        aggFunc: "sum",
      },
      {
        headerName: "InvoiceAmount",
        field: "total",
        sortable: isSortable,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      {
        headerName: "Invoice PaidAmount",
        field: "invoicePaidAmount",
        sortable: isSortable,
        aggFunc: "sum",
        valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
      },
      { headerName: "Start Date", field: "startDate", sortable: isSortable },
      { headerName: "End Date", field: "endDate", sortable: isSortable },
      //{ headerName: 'Invoice Date', field: 'invoiceDate', sortable: isSortable},
      {
        headerName: "Status",
        field: "status",
        sortable: isSortable,
        editable: editableUnlessPaid,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["Created", "Paid", "Partially Paid"],
        },
      },
      { headerName: "Project Id", field: "projectId", sortable: isSortable },
      { headerName: "Project Name", field: "projectName", sortable: isSortable },
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

  const onBtnExportDataAsExcel = () => {
    if (gridRef.current) {
      gridRef.current.exportDataAsExcel();
    }
  };

  const filterData = () => {
    if (!searchText) {
      return enrichedRowData;
    }

    return (enrichedRowData || []).filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const [open, setOpen] = useState(false);

  const addNewInvoice = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const visibleRows = filterData();
    if (visibleRows && visibleRows.length > 0) {
      setPinnedTopRowData([
        {
          invoiceId: "Total",
          hours: visibleRows.reduce((sum, row) => sum + (row.hours || 0), 0),
          total: visibleRows.reduce((sum, row) => sum + (row.total || 0), 0),
          invoicePaidAmount: visibleRows.reduce(
            (sum, row) => sum + (row.invoicePaidAmount || 0),
            0,
          ), // Summing billRate values
        },
      ]);
    } else {
      setPinnedTopRowData([]);
    }
    // Recompute whenever the underlying data or the search filter changes —
    // the totals row must reflect exactly what's currently visible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichedRowData, searchText]);

  const generateInvoice = () => {
    if (employeeId) {
      // Check first whether there's actually anything left to generate —
      // if every period already has an invoice, just alert and stay on
      // this page instead of swapping to an empty Generate Invoice grid.
      axios
        .get(API_ENDPOINTS.activeProjectsForInvoiceByEmployee(employeeId))
        .then((response) => {
          const rows = response.data || [];
          const remaining = rows.filter((row) => !row.invoiceId);
          if (rows.length > 0 && remaining.length === 0) {
            message.success(`Invoices for ${rows[0].employeeName || "this employee"} is up to date`);
            return;
          }
          // Scoped to just this employee's own active projects — swap the
          // grid in place instead of navigating to a separate page.
          setIsGeneratingInvoice(true);
        })
        .catch((error) => {
          console.error("Error checking invoice status:", error);
          // Fail open — let the grid itself surface any error.
          setIsGeneratingInvoice(true);
        });
      return;
    }

    const formattedDate = selectedDate
      ? new Date(selectedDate).toISOString().split("T")[0]
      : null;
    const month = formattedDate
      ? new Date(selectedDate).toLocaleString("default", { month: "long" }) // Use 'short' for abbreviated month
      : null;
    const endDate = new Date().toISOString().split("T")[0];
    const encodedEndDate = encodeURIComponent(endDate);
    const encodedFormatSelectedDate = encodeURIComponent(formattedDate);
    // Any additional logic can go here
    navigate("/generateInvoice", {
      state: {
        url: API_ENDPOINTS.activeProjects(encodedEndDate, encodedFormatSelectedDate),
        month: month,
      },
    });
  };

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" }; // Custom inline style for pinned rows
    }
    return null;
  };

  if (isGeneratingInvoice) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <GenerateInvoiceDetails
          url={API_ENDPOINTS.activeProjectsForInvoiceByEmployee(employeeId)}
          onBack={() => {
            setIsGeneratingInvoice(false);
            fetchData();
            onRefresh?.();
          }}
        />
      </div>
    );
  }

  return (
    <div
    style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <div className="ag-theme-alpine employee-List-grid">
    <Card className="employeeTableCard" style={{ height: "100%" }}>
      <Drawer
        title={`Add New Invoice`}
        placement="right"
        size="large"
        onClose={onClose}
        open={open}
      >
        <NewInvoice onClose={onClose} employeeId={employeeId} open={open} />
      </Drawer>
      <div className="workforce-search-container" style={{ gap: "32px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchData();
              // When embedded (e.g. Project Full Details' "Invoices" tab),
              // also refreshes the host page's own totals/chart — otherwise
              // those go stale after a save made right here.
              onRefresh?.();
            }}
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
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancelChanges}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            style={{ marginLeft: "20px" }}
            type="primary"
            className="button-vendor"
            onClick={addNewInvoice}
          >
            <PlusOutlined /> Add New Invoice
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label style={{ marginBottom: 0 }}>Invoice Date:&nbsp;</label>
          <DatePicker
            className="left-panel"
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MM/yyyy"
            placeholderText="Select the date"
            showMonthYearPicker
            style={{ width: "150px" }} // Add a fixed width
          />
          <Button
            type="primary"
            style={{ marginLeft: "10px" }}
            className="button-vendor"
            // Scoped to an employee (e.g. the employeeFullDetails Invoices
            // tab), generateInvoice() doesn't need a month — it's only
            // required for the generic/bulk (no employeeId) path below.
            disabled={!employeeId && !selectedDate}
            onClick={generateInvoice}
          >
            <PlusOutlined /> Generate Invoice
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
          try { params.api.autoSizeAllColumns(); } catch (e) {}
        }}
        autoSizeStrategy={{ type: "fitCellContents" }}
        onCellValueChanged={onCellValueChanged}
        rowHeight={48}
        rowData={filterData()}
        columnDefs={sizeColumnsForHeader(getColumnsDefList(true))}
        gridOptions={gridOptions}
        defaultColDef={{
          minWidth: 100,
          maxWidth: 220,
          resizable: true,
          filter: "agSetColumnFilter",
          headerClass: "ag-header-cell",
          cellClassRules: {
            darkGreyBackground: (params) => params.node?.rowIndex !== undefined
            && params.node.rowIndex % 2 === 1,
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
        rowGroupPanelShow="always"
        domLayout="normal"
        pagination={true}
        paginationPageSize={100}
        paginationPageSizeSelector={[20, 50, 100]}
        pinnedTopRowData={pinnedTopRowData} // Set pinned bottom row data here
        getRowStyle={getRowStyle}
        enableBrowserTooltips={true}
        popupParent={document.body}
      />
      {isTimesheetOpen && (
        <MonthlyTimesheetDialog
          open={isTimesheetOpen}
          onClose={() => setIsTimesheetOpen(false)}
          onSave={handleSaveTimesheet}
          initialData={Array(30).fill(0)}
        />
      )}
      </div>
    </Card>
    </div>
    </div>
  );
};

export default InvoiceDetails;
