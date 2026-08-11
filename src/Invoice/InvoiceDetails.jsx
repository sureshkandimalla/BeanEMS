import React, { useState, useEffect, useRef, useMemo } from "react";
import API_ENDPOINTS from "../config";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card, Drawer, message, Popover, Badge, List, Empty, Row, Col } from "antd";

import { PlusOutlined, ReloadOutlined, FileExcelOutlined, SaveOutlined, CloseOutlined, BellOutlined } from "@ant-design/icons";
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
import { formatMonthYear, formatDate } from "../Utils/dateFormat";
import RevenueCharts from "../RevenueCharts/RevenueCharts";
import TrendLineChart from "../RevenueCharts/TrendLineChart";
import PieCharts, { getPieColors } from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import ChartOverviewPanel from "../Utils/ChartOverviewPanel";

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
  const [referralEmployeeIds, setReferralEmployeeIds] = useState(new Set());
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

  // Projects carry their own employeeName/projectName/customerName — used to
  // look up those display columns for each invoice by its projectId.
  useEffect(() => {
    fetch(API_ENDPOINTS.getProjects)
      .then((response) => response.json())
      .then((data) => setProjectsData(data || []))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  // Referral-company employees aren't run through invoicing — exclude them
  // from the page-level invoice alert below.
  useEffect(() => {
    axios
      .get(API_ENDPOINTS.getAllEmployees)
      .then((response) => {
        const ids = (response.data || [])
          .filter((emp) => (emp.companyName || "").trim().toLowerCase() === "referral")
          .map((emp) => emp.employeeId);
        setReferralEmployeeIds(new Set(ids));
      })
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.projectId, project])),
    [projects],
  );

  // Page-level alert (only when not scoped to a single employee/project):
  // for every employee with an active project, reuse the exact same
  // per-employee "active projects for invoice" endpoint Generate Invoice
  // itself relies on, and flag any (employee, project) pair with periods
  // that still don't have an invoice — i.e. invoicing has fallen behind
  // that project's own invoice-term cadence.
  const [invoiceAlerts, setInvoiceAlerts] = useState([]);

  useEffect(() => {
    if (employeeId || projectId) return;
    if (!projects || projects.length === 0) return;

    const activeEmployeeIds = Array.from(
      new Set(
        projects
          .filter((p) => (p.status || "").toUpperCase() === "ACTIVE")
          .map((p) => p.employeeId)
          .filter(Boolean)
          .filter((empId) => !referralEmployeeIds.has(empId)),
      ),
    );
    if (activeEmployeeIds.length === 0) {
      setInvoiceAlerts([]);
      return;
    }

    Promise.all(
      activeEmployeeIds.map((empId) =>
        axios
          .get(API_ENDPOINTS.activeProjectsForInvoiceByEmployee(empId))
          .then((response) => response.data || [])
          .catch((error) => {
            console.error("Error checking invoice status for employee " + empId, error);
            return [];
          }),
      ),
    ).then((results) => {
      const today = new Date().toISOString().split("T")[0];
      const missingByProject = {};
      results.flat().forEach((row) => {
        if (row.invoiceId) return; // already invoiced
        if ((row.status || "").toUpperCase() !== "ACTIVE") return; // project itself isn't active
        if (row.endDate && row.endDate > today) return; // period hasn't ended yet — nothing to invoice for it
        const key = `${row.employeeId}_${row.projectId}`;
        if (!missingByProject[key]) {
          missingByProject[key] = {
            employeeId: row.employeeId,
            employeeName: row.employeeName,
            projectName: row.projectName,
            periods: [],
          };
        }
        missingByProject[key].periods.push({ startDate: row.startDate, endDate: row.endDate });
      });
      Object.values(missingByProject).forEach((entry) => entry.periods.sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setInvoiceAlerts(Object.values(missingByProject));
    });
  }, [projects, employeeId, projectId, referralEmployeeIds]);

  const invoiceAlertContent = (
    <div style={{ maxHeight: 320, overflowY: "auto", minWidth: 320 }}>
      {invoiceAlerts.length === 0 ? (
        <Empty description="No alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={invoiceAlerts}
          renderItem={(item) => (
            <List.Item key={`${item.employeeId}-${item.projectName}`}>
              <List.Item.Meta
                title={`${item.employeeName} — ${item.projectName}`}
                description={
                  <>
                    <div>
                      {item.periods.length} invoice period{item.periods.length === 1 ? "" : "s"} not yet generated:
                    </div>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {item.periods.map((period) => (
                        <li key={`${period.startDate}-${period.endDate}`}>
                          {formatDate(period.startDate)} – {formatDate(period.endDate)}
                        </li>
                      ))}
                    </ul>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
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
        customerName: project?.customerName || "",
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

  // Page-level "Invoice Overview" (only rendered when not scoped to a
  // single employee/project): a monthly Invoiced-vs-Paid bar chart, plus a
  // pie chart of total invoiced amount by customer — same pattern as the
  // Projects Overview panel on /projects.
  const monthlyInvoiceChart = useMemo(() => {
    if (!enrichedRowData || enrichedRowData.length === 0) return { categories: [], invoiced: [], paid: [] };
    const byMonth = {};
    enrichedRowData.forEach((inv) => {
      if (!inv.invoiceMonth) return;
      const key = inv.invoiceMonth.substring(0, 7);
      if (!byMonth[key]) byMonth[key] = { invoiced: 0, paid: 0 };
      byMonth[key].invoiced += inv.total || 0;
      byMonth[key].paid += inv.invoicePaidAmount || 0;
    });
    const sortedKeys = Object.keys(byMonth).sort().slice(-12);
    return {
      categories: sortedKeys.map((k) => formatMonthYear(k)),
      invoiced: sortedKeys.map((k) => Math.round(byMonth[k].invoiced)),
      paid: sortedKeys.map((k) => Math.round(byMonth[k].paid)),
    };
  }, [enrichedRowData]);

  // Flags any month (across the full history, not just the chart's last-12
  // window) where the invoiced total and paid total don't match — i.e.
  // that month still has outstanding/partially-paid invoices.
  const monthlyPaymentAlerts = useMemo(() => {
    if (!enrichedRowData || enrichedRowData.length === 0) return [];
    const byMonth = {};
    enrichedRowData.forEach((inv) => {
      if (!inv.invoiceMonth) return;
      const key = inv.invoiceMonth.substring(0, 7);
      if (!byMonth[key]) byMonth[key] = { invoiced: 0, paid: 0 };
      byMonth[key].invoiced += inv.total || 0;
      byMonth[key].paid += inv.invoicePaidAmount || 0;
    });
    return Object.keys(byMonth)
      .filter((key) => Math.round(byMonth[key].invoiced) !== Math.round(byMonth[key].paid))
      .sort()
      .map((key) => ({
        month: formatMonthYear(key),
        invoiced: byMonth[key].invoiced,
        paid: byMonth[key].paid,
        outstanding: byMonth[key].invoiced - byMonth[key].paid,
      }));
  }, [enrichedRowData]);

  const monthlyPaymentAlertContent = (
    <div style={{ maxHeight: 320, overflowY: "auto", minWidth: 320 }}>
      {monthlyPaymentAlerts.length === 0 ? (
        <Empty description="No alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={monthlyPaymentAlerts}
          renderItem={(item) => (
            <List.Item key={item.month}>
              <List.Item.Meta
                title={item.month}
                description={`Invoiced ${formatCurrency(item.invoiced)} vs Paid ${formatCurrency(item.paid)} — outstanding ${formatCurrency(item.outstanding)}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const monthlyInvoiceCountChart = useMemo(() => {
    if (!enrichedRowData || enrichedRowData.length === 0) return { categories: [], counts: [] };
    const byMonth = {};
    enrichedRowData.forEach((inv) => {
      if (!inv.invoiceMonth) return;
      const key = inv.invoiceMonth.substring(0, 7);
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const sortedKeys = Object.keys(byMonth).sort();
    return {
      categories: sortedKeys.map((k) => formatMonthYear(k)),
      counts: sortedKeys.map((k) => byMonth[k]),
    };
  }, [enrichedRowData]);

  const byCustomerTotals = useMemo(() => {
    const byCustomer = {};
    (enrichedRowData || []).forEach((inv) => {
      const customer = inv.customerName || "Unknown";
      if (!byCustomer[customer]) byCustomer[customer] = { invoiced: 0, paid: 0 };
      byCustomer[customer].invoiced += inv.total || 0;
      byCustomer[customer].paid += inv.invoicePaidAmount || 0;
    });
    return byCustomer;
  }, [enrichedRowData]);

  const customerInvoiceSlices = useMemo(() => {
    const customers = Object.keys(byCustomerTotals);
    const colors = getPieColors(customers.length);
    return customers.map((customer, i) => ({ label: customer, value: byCustomerTotals[customer].invoiced, color: colors[i] }));
  }, [byCustomerTotals]);

  // Same customer totals, reshaped for a grouped Invoiced-vs-Paid bar chart —
  // sorted by amount still due (invoiced minus paid) so customers owing the
  // most show up first.
  const customerBarChart = useMemo(() => {
    // Ascending, not descending — the chart auto-scrolls to the right edge
    // on load, so the customer owing the most should be last (rightmost),
    // not first (off-screen to the left).
    const due = (v) => byCustomerTotals[v].invoiced - byCustomerTotals[v].paid;
    const customers = Object.keys(byCustomerTotals).sort((a, b) => due(a) - due(b));
    return {
      categories: customers,
      invoiced: customers.map((v) => Math.round(byCustomerTotals[v].invoiced)),
      paid: customers.map((v) => Math.round(byCustomerTotals[v].paid)),
    };
  }, [byCustomerTotals]);

  const totalInvoicedAllCustomers = customerInvoiceSlices.reduce((sum, s) => sum + s.value, 0);

  // Chart definitions for the Invoice Overview panel — ChartOverviewPanel
  // handles show/hide, drag-to-reorder, drag-to-resize, and PNG download
  // generically from this list.
  const invoiceOverviewCharts = [
    {
      key: "monthly",
      label: "Invoices by Month",
      filename: "invoices-by-month",
      defaultSize: { width: 700, height: 340 },
      render: (innerHeight, setChartRef) => (
        <RevenueCharts
          ref={setChartRef}
          thisMonthData={monthlyInvoiceChart.invoiced}
          lastMonthData={monthlyInvoiceChart.paid}
          categories={monthlyInvoiceChart.categories}
          series1Name="Invoiced"
          series2Name="Paid"
          visibleCategories={8}
          pxPerCategory={110}
          height={innerHeight}
        />
      ),
    },
    {
      key: "customerPie",
      label: "Total Invoiced (by Customer)",
      title: `Total Invoiced: ${formatCurrency(totalInvoicedAllCustomers)}`,
      filename: "total-invoiced-by-customer",
      defaultSize: { width: 500, height: 340 },
      render: (innerHeight, setChartRef) =>
        customerInvoiceSlices.length > 0 ? (
          <Row align="middle">
            <Col span={14}>
              <div style={{ width: "100%", height: innerHeight }}>
                <PieCharts
                  ref={setChartRef}
                  chartData={customerInvoiceSlices.map((s) => Math.round(s.value))}
                  chartLabels={customerInvoiceSlices.map((s) => s.label)}
                  showLegend={false}
                />
              </div>
            </Col>
            <Col span={10} style={{ maxHeight: innerHeight, overflowY: "auto" }}>
              <PieLegend slices={customerInvoiceSlices} valueFormatter={formatCurrency} />
            </Col>
          </Row>
        ) : (
          <Empty description="No invoice data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ),
    },
    {
      key: "invoiceCount",
      label: "Invoice Count by Month",
      filename: "invoice-count-by-month",
      defaultSize: { width: 420, height: 340 },
      render: (innerHeight, setChartRef) => (
        <TrendLineChart
          ref={setChartRef}
          data={monthlyInvoiceCountChart.counts}
          categories={monthlyInvoiceCountChart.categories}
          seriesName="Invoices"
          height={innerHeight}
        />
      ),
    },
    {
      key: "customerBar",
      label: "Invoices by Customer",
      filename: "invoices-by-customer",
      defaultSize: { width: 800, height: 340 },
      render: (innerHeight, setChartRef) => (
        <RevenueCharts
          ref={setChartRef}
          thisMonthData={customerBarChart.invoiced}
          lastMonthData={customerBarChart.paid}
          categories={customerBarChart.categories}
          series1Name="Invoiced"
          series2Name="Paid"
          xaxisLabelRotate={0}
          maxLabelLength={12}
          height={innerHeight}
        />
      ),
    },
  ];

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
      { headerName: "Customer Name", field: "customerName", sortable: isSortable, enableRowGroup: true },
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
    {!employeeId && !projectId && (
      <ChartOverviewPanel
        panelTitle="Invoice Overview"
        charts={invoiceOverviewCharts}
        alerts={
          <>
            <Popover content={invoiceAlertContent} title="Invoice Alerts" trigger="click" placement="bottomRight">
              <Badge count={invoiceAlerts.length} size="small">
                <Button icon={<BellOutlined />} size="small" />
              </Badge>
            </Popover>
            <Popover content={monthlyPaymentAlertContent} title="Invoiced vs Paid Alerts" trigger="click" placement="bottomRight">
              <Badge count={monthlyPaymentAlerts.length} size="small">
                <Button icon={<BellOutlined />} size="small" />
              </Badge>
            </Popover>
          </>
        }
      />
    )}
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
            className="button-customer"
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
            className="button-customer"
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
        enableCellTextSelection={true}
        ensureDomOrder={true}
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
