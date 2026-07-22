import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Checkbox } from "antd";
import { ReloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";

// Accounting-style negative display: (1,234.56) instead of -1,234.56, in red.
const formatSignedCurrency = (value) => {
  if (!value) return "";
  const formatted = formatCurrency(Math.abs(value));
  return value < 0 ? `(${formatted})` : formatted;
};
const negativeRedCellStyle = (params) => (params.value < 0 ? { color: "red" } : null);

// Company-wide summary — one flat row per employee (no grouping/drill-down),
// each numeric column a pre-aggregated total across that employee's own
// projects/invoices/payroll/adjustments/expenses. Deliberately a separate,
// self-contained component from Reconciliation/FinalReportDetails.jsx so
// this dashboard can't disturb the already-working per-employee tab.
export default function CompanyFinalReportDetails() {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showNewHires, setShowNewHires] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchEmployeeSummary = async (employee) => {
    const employeeName =
      employee.firstName || employee.lastName
        ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim()
        : employee.name || "";

    const [{ data: projects }, { data: bills }] = await Promise.all([
      axios.get(API_ENDPOINTS.projectsByEmployeeId(employee.employeeId)),
      axios.get(API_ENDPOINTS.getBillsForEmployee(employee.employeeId)),
    ]);

    let totalHours = 0;
    let paidHours = 0;
    let totalInvoiceAmount = 0;
    let invoicesPaid = 0;

    await Promise.all(
      (projects || []).map(async (project) => {
        const { data: invoices } = await axios.get(
          API_ENDPOINTS.getInvoicesForProject(project.projectId),
        );
        const paidInvoices = invoices.filter((inv) => inv.status === "Paid");

        const projectHours = invoices.reduce((sum, inv) => sum + (inv.hours || 0), 0);
        const projectPaidHours = paidInvoices.reduce((sum, inv) => sum + (inv.hours || 0), 0);

        totalHours += projectHours;
        paidHours += projectPaidHours;
        totalInvoiceAmount += invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        invoicesPaid += paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      }),
    );

    // Match Reconciliation/FinalReportDetails.jsx (the per-employee FINAL
    // REPORT tab): Employee Pay/Employee Pay Paid come from the bills
    // table (one bill per assignment per invoice, already scoped to this
    // employee) rather than invoice hours × wage. Employee Pay is every
    // bill for the employee; Employee Pay Paid is just the bills whose
    // invoice has cleared (status !== "Created", i.e. "Invoice Cleared"
    // or "Paid").
    const clearedBills = (bills || []).filter((bill) => bill.status !== "Created");
    const employeePay = (bills || []).reduce((sum, bill) => sum + (bill.total || 0), 0);
    const incomePaid = clearedBills.reduce((sum, bill) => sum + (bill.total || 0), 0);

    const { data: payrolls } = await axios.get(API_ENDPOINTS.getPayrollsForEmp(employee.employeeId));
    const payrollTotal = (payrolls || []).reduce((sum, p) => sum + (p.totalPaid || 0), 0);
    const employerTax = (payrolls || []).reduce((sum, p) => sum + (p.employerLiability || 0), 0);

    const { data: adjustments } = await axios.get(
      `${API_ENDPOINTS.findAdjustmentsByEmployeeId}?id=${employee.employeeId}`,
    );
    // Paid: money the employee received via adjustment (they're the "to").
    // Received: money the employee is owed back via adjustment — they
    // fronted it themselves (they're the "from").
    const adjustmentsPaid = (adjustments || [])
      .filter((a) => Number(a.toId) === Number(employee.employeeId))
      .reduce((sum, a) => sum + Math.abs(a.amount || 0), 0);
    const adjustmentsReceived = (adjustments || [])
      .filter((a) => Number(a.fromId) === Number(employee.employeeId))
      .reduce((sum, a) => sum + Math.abs(a.amount || 0), 0);

    const { data: expenseRecords } = await axios.get(
      API_ENDPOINTS.getExpensesForEmployee(employee.employeeId),
    );
    // Company Expenses: everything spent on/for the employee, reimbursable
    // or not. Expenses: just the reimbursable portion — money owed back to
    // the employee, which is what counts toward Total Payment.
    const companyExpenses = (expenseRecords || []).reduce(
      (sum, e) => sum + (e.amount || 0),
      0,
    );
    const expenses = (expenseRecords || [])
      .filter((e) => e.reimbursable)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalPayment = payrollTotal + adjustmentsPaid + expenses;

    // Match Reconciliation/FinalReportDetails.jsx (the per-employee FINAL
    // REPORT tab): Income/Income Paid include adjustments the employee is
    // owed back (they fronted the money — they're the "from"), not just
    // project pay. Adjustments have no paid/unpaid split, so the full
    // amount counts toward both Income and Income Paid there.
    const income = employeePay + adjustmentsReceived;
    const incomePaidTotal = incomePaid + adjustmentsReceived;
    const balance = income - totalPayment;

    return {
      employeeId: employee.employeeId,
      employeeName,
      employeeRecord: employee,
      totalHours,
      paidHours,
      totalInvoiceAmount,
      invoicesPaid,
      employeePay: income,
      incomePaid: incomePaidTotal,
      totalPayment,
      adjustmentsPaid,
      adjustmentsReceived,
      companyExpenses,
      expenses,
      employerTax,
      // Gross = (all invoices for the employee + adjustments received +
      // reimbursable expenses) - (bills for all invoices for the employee
      // + employer tax + non-reimbursable expenses).
      gross: (totalInvoiceAmount + adjustmentsReceived + expenses) - (employeePay + employerTax + (companyExpenses - expenses)),
      balance,
      balancePaid: incomePaidTotal - totalPayment,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: employees } = await axios.get(API_ENDPOINTS.getAllEmployees);
      const summaries = await Promise.all((employees || []).map(fetchEmployeeSummary));
      setRowData(summaries);
    } catch (error) {
      console.error("Error fetching company report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const visibleRows = showNewHires
      ? rowData
      : rowData.filter((row) => row.employeeRecord?.status !== "NewHires");

    if (!searchText) return visibleRows;
    return visibleRows.filter((row) =>
      Object.entries(row).some(
        ([key, value]) =>
          key !== "employeeRecord" &&
          String(value).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const onBtnExportDataAsExcel = () => {
    if (gridRef.current) {
      gridRef.current.exportDataAsExcel();
    }
  };

  const pinnedTopRowData = useMemo(() => {
    const visibleRows = filterData();
    return visibleRows.length > 0
      ? [
          {
            employeeName: "Company Total",
            totalInvoiceAmount: visibleRows.reduce((sum, row) => sum + (row.totalInvoiceAmount || 0), 0),
            invoicesPaid: visibleRows.reduce((sum, row) => sum + (row.invoicesPaid || 0), 0),
            employeePay: visibleRows.reduce((sum, row) => sum + (row.employeePay || 0), 0),
            incomePaid: visibleRows.reduce((sum, row) => sum + (row.incomePaid || 0), 0),
            totalPayment: visibleRows.reduce((sum, row) => sum + (row.totalPayment || 0), 0),
            adjustmentsPaid: visibleRows.reduce((sum, row) => sum + (row.adjustmentsPaid || 0), 0),
            adjustmentsReceived: visibleRows.reduce((sum, row) => sum + (row.adjustmentsReceived || 0), 0),
            companyExpenses: visibleRows.reduce((sum, row) => sum + (row.companyExpenses || 0), 0),
            expenses: visibleRows.reduce((sum, row) => sum + (row.expenses || 0), 0),
            employerTax: visibleRows.reduce((sum, row) => sum + (row.employerTax || 0), 0),
            gross: visibleRows.reduce((sum, row) => sum + (row.gross || 0), 0),
            balance: visibleRows.reduce((sum, row) => sum + (row.balance || 0), 0),
            balancePaid: visibleRows.reduce((sum, row) => sum + (row.balancePaid || 0), 0),
          },
        ]
      : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, searchText, showNewHires]);

  const columnDefs = [
    {
      colId: "rowNum",
      headerName: "#",
      valueGetter: (params) => (params.node.rowPinned ? "" : params.node.rowIndex + 1),
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      pinned: "left",
      lockPosition: true,
      suppressMovable: true,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: "center", fontWeight: 500 },
      headerClass: "ag-center-cols",
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      minWidth: 220,
      pinned: "left",
      cellRenderer: (params) => {
        if (params.node.rowPinned || !params.data?.employeeRecord) return params.value;
        return (
          <Link
            to="/employeeFullDetails"
            state={{ rowData: params.data.employeeRecord, activeTab: "13" }}
          >
            {params.value}
          </Link>
        );
      },
    },
    {
      field: "gross",
      headerName: "Gross",
      valueFormatter: (params) => formatSignedCurrency(params.value),
      cellStyle: negativeRedCellStyle,
    },
    {
      field: "balance",
      headerName: "Balance to Employee",
      valueFormatter: (params) => formatSignedCurrency(params.value),
      cellStyle: negativeRedCellStyle,
    },
    {
      field: "balancePaid",
      headerName: "Balance (Invoices Received)",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    { field: "totalHours", headerName: "Invoice Hours" },
    { field: "paidHours", headerName: "Invoice Cleared Hours" },
    {
      field: "totalInvoiceAmount",
      headerName: "Invoice Amount",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "invoicesPaid",
      headerName: "Invoice Cleared",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "employeePay",
      headerName: "Employee Pay",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "incomePaid",
      headerName: "Employee Pay Paid",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "totalPayment",
      headerName: "Total Payment",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "adjustmentsPaid",
      headerName: "Adjustments Paid",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "adjustmentsReceived",
      headerName: "Adjustments Received",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "companyExpenses",
      headerName: "Company Expenses",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "expenses",
      headerName: "Expenses",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
    {
      field: "employerTax",
      headerName: "Employer Tax",
      valueFormatter: (params) => formatSignedCurrency(params.value),
    },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="ag-theme-alpine project-List-grid">
        <div className="workforce-search-container">
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
            style={{ marginRight: "10px" }}
          >
            Refresh
          </Button>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            type="default"
            icon={<FileExcelOutlined />}
            onClick={onBtnExportDataAsExcel}
            style={{ marginLeft: "10px" }}
          >
            Export to Excel
          </Button>
          <Checkbox
            checked={showNewHires}
            onChange={(e) => setShowNewHires(e.target.checked)}
            style={{ marginLeft: "10px" }}
          >
            Show New Hires
          </Checkbox>
        </div>
        <div className="project-grid-wrapper">
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
            rowHeight={48}
            rowData={filterData()}
            columnDefs={sizeColumnsForHeader(columnDefs)}
            pinnedTopRowData={pinnedTopRowData}
            getRowStyle={(params) =>
              params.node.rowPinned ? { backgroundColor: "#d3f4ff", fontWeight: "bold" } : null
            }
            defaultColDef={{
              minWidth: 100,
              resizable: true,
              filter: "agSetColumnFilter",
              sortable: true,
              headerClass: "ag-header-cell",
              cellClassRules: {
                darkGreyBackground: (params) =>
                  params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
              },
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
