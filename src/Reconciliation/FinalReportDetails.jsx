import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear, formatDate } from "../Utils/dateFormat";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";

// One grid, two categories ("Projects" and "Payments"), grouped/collapsed
// under a single "Category" column. Not every column applies to every
// category — Projects use Billing/Income/Income Paid, Payments use Total
// Payment — cells that don't apply to a row's category are just left blank.
//
// Projects: built from the Projects and Invoice services directly — a
// project's real billing rate lives on the project itself (EMP_PAY
// assignment wage), and its real hours/income come from its own invoices.
// Expanding a project row (master/detail) shows that project's invoices.
//
// Payments: one row per YEAR (from payroll), aggregated client-side.
// Expanding a year row (same master/detail mechanism) shows every
// individual pay record for that year.
export default function FinalReportDetails({ employeeId }) {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const fetchProjectRows = async () => {
    const { data: projects } = await axios.get(API_ENDPOINTS.projectsByEmployeeId(employeeId));

    return Promise.all(
      (projects || []).map(async (project) => {
        const { data: invoices } = await axios.get(
          API_ENDPOINTS.getInvoicesForProject(project.projectId),
        );
        // "Billing" here is what the employee is paid (EMP_PAY assignment
        // wage), not the client billing rate.
        const empPayAssignment = (project.assignments || []).find(
          (assignment) =>
            assignment.assignmentType === "EMP_PAY" &&
            Number(assignment.employeeId) === Number(employeeId),
        );

        const billing = empPayAssignment?.wage || 0;
        const totalHours = invoices.reduce((sum, inv) => sum + (inv.hours || 0), 0);
        const paidHours = invoices
          .filter((inv) => inv.status === "Paid")
          .reduce((sum, inv) => sum + (inv.hours || 0), 0);

        return {
          category: "Projects",
          detailType: "invoices",
          projectId: project.projectId,
          description: `Consulting services provided for ${project.customer?.customerCompanyName || project.projectName}`,
          billing,
          hours: totalHours,
          paidHours,
          income: billing * totalHours,
          incomePaid: billing * paidHours,
          invoiceRecords: invoices,
        };
      }),
    );
  };

  const fetchPaymentRows = async () => {
    const { data: payrolls } = await axios.get(API_ENDPOINTS.getPayrollsForEmp(employeeId));

    const byYear = {};
    (payrolls || [])
      .filter((payroll) => payroll.checkDate)
      .forEach((payroll) => {
        const year = payroll.checkDate.substring(0, 4);
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(payroll);
      });

    return Object.entries(byYear).map(([year, records]) => ({
      category: "Payments",
      detailType: "payroll",
      description: `Payroll for ${year}`,
      totalPayment: records.reduce((sum, r) => sum + (r.totalPaid || 0), 0),
      payRecords: records,
    }));
  };

  // Adjustments: one combined row at the top level (Total Payment / Income /
  // Income Paid summed across every adjustment), same as Projects/Payments —
  // expanding it (master/detail) reveals every individual adjustment
  // record. Per the employee's role on each record: when they're the
  // recipient ("to"), it's money paid to them — Total Payment; when they're
  // the source ("from"), it's Income they're owed back, so it counts as
  // both Income and Income Paid.
  const fetchAdjustmentRows = async () => {
    const { data: adjustments } = await axios.get(
      `${API_ENDPOINTS.findAdjustmentsByEmployeeId}?id=${employeeId}`,
    );

    const adjustmentRecords = (adjustments || []).map((adjustment) => {
      const isRecipient = Number(adjustment.toId) === Number(employeeId);
      const amount = Math.abs(adjustment.amount || 0);
      return {
        description: adjustment.adjustmentType,
        from: adjustment.fromName,
        to: adjustment.toName,
        date: adjustment.adjustmentDate,
        notes: adjustment.notes,
        totalPayment: isRecipient ? amount : undefined,
        income: !isRecipient ? amount : undefined,
        incomePaid: !isRecipient ? amount : undefined,
      };
    });

    if (adjustmentRecords.length === 0) return [];

    return [
      {
        category: "Adjustments",
        detailType: "adjustments",
        description: "Adjustments",
        totalPayment: adjustmentRecords.reduce((sum, r) => sum + (r.totalPayment || 0), 0),
        income: adjustmentRecords.reduce((sum, r) => sum + (r.income || 0), 0),
        incomePaid: adjustmentRecords.reduce((sum, r) => sum + (r.incomePaid || 0), 0),
        adjustmentRecords,
      },
    ];
  };

  // Expenses: same combined-row-with-drilldown pattern as Adjustments — but
  // the top-level Total Payment only sums reimbursable expenses (money
  // actually owed back to the employee). Non-reimbursable expenses still
  // show in the drill-down for the full picture, they just don't count
  // toward the total.
  const fetchExpenseRows = async () => {
    const { data: expenses } = await axios.get(API_ENDPOINTS.getExpensesForEmployee(employeeId));

    const expenseRecords = (expenses || []).map((expense) => ({
      description: expense.description,
      amount: expense.amount || 0,
      reimbursable: expense.reimbursable,
      date: expense.expenseDate,
      status: expense.status,
    }));

    if (expenseRecords.length === 0) return [];

    return [
      {
        category: "Expenses",
        detailType: "expenses",
        description: "Expenses",
        totalPayment: expenseRecords
          .filter((r) => r.reimbursable)
          .reduce((sum, r) => sum + r.amount, 0),
        expenseRecords,
      },
    ];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectRows, paymentRows, adjustmentRows, expenseRows] = await Promise.all([
        fetchProjectRows(),
        fetchPaymentRows(),
        fetchAdjustmentRows(),
        fetchExpenseRows(),
      ]);
      setRowData([...projectRows, ...paymentRows, ...adjustmentRows, ...expenseRows]);
    } catch (error) {
      console.error("Error fetching final report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pinnedTopRowData = useMemo(
    () =>
      rowData.length > 0
        ? [
            (() => {
              const hours = rowData.reduce((sum, row) => sum + (row.hours || 0), 0);
              const paidHours = rowData.reduce((sum, row) => sum + (row.paidHours || 0), 0);
              const income = rowData.reduce((sum, row) => sum + (row.income || 0), 0);
              const incomePaid = rowData.reduce((sum, row) => sum + (row.incomePaid || 0), 0);
              const totalPayment = rowData.reduce((sum, row) => sum + (row.totalPayment || 0), 0);
              return {
                description: "Total",
                hours,
                paidHours,
                income,
                incomePaid,
                totalPayment,
                balancePaid: incomePaid - totalPayment,
                balance: income - totalPayment,
              };
            })(),
          ]
        : [],
    [rowData],
  );

  const columnDefs = [
    {
      field: "category",
      headerName: "Category",
      rowGroup: true,
      hide: true,
    },
    {
      field: "description",
      headerName: "Description",
      cellRenderer: "agGroupCellRenderer",
      cellRendererParams: { suppressCount: true },
      minWidth: 260,
    },
    {
      field: "hours",
      headerName: "Total Hours",
      aggFunc: "sum",
      valueFormatter: (params) => (params.value ? params.value : ""),
    },
    { field: "paidHours", headerName: "Paid Hours", aggFunc: "sum" },
    {
      field: "billing",
      headerName: "Billing",
      valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
    },
    {
      field: "income",
      headerName: "Income",
      aggFunc: "sum",
      valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
    },
    {
      field: "incomePaid",
      headerName: "Income Paid",
      aggFunc: "sum",
      valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
    },
    {
      field: "totalPayment",
      headerName: "Total Payment",
      aggFunc: "sum",
      valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
    },
    {
      field: "balancePaid",
      headerName: "Balance-Paid",
      valueFormatter: (params) => (params.value !== undefined ? formatCurrency(params.value) : ""),
    },
    {
      field: "balance",
      headerName: "Balance",
      valueFormatter: (params) => (params.value !== undefined ? formatCurrency(params.value) : ""),
    },
  ];

  const invoiceDetailConfig = {
    detailGridOptions: {
      domLayout: "autoHeight",
      columnDefs: [
        { field: "invoiceId", headerName: "Invoice Id", filter: true },
        {
          field: "invoiceMonth",
          headerName: "Invoice Month",
          filter: true,
          valueFormatter: (params) => formatMonthYear(params.value),
        },
        { field: "hours", headerName: "Hours", filter: true },
        { field: "status", headerName: "Status", filter: true },
      ],
      defaultColDef: { flex: 1, minWidth: 20, resizable: true },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.invoiceRecords || []);
    },
  };

  const payrollDetailConfig = {
    detailGridOptions: {
      domLayout: "autoHeight",
      columnDefs: [
        {
          field: "checkDate",
          headerName: "Pay Check Date",
          filter: true,
          valueFormatter: (params) => formatDate(params.value),
        },
        { field: "hours", headerName: "Hours", filter: true },
        {
          field: "totalPaid",
          headerName: "Total Paid",
          filter: true,
          valueFormatter: (params) => formatCurrency(params.value),
        },
        { field: "paymentDetails", headerName: "Payment Details", filter: true },
        { field: "payPeriodStartDate", headerName: "Pay Cycle Start", filter: true },
        { field: "payPeriodEndDate", headerName: "Pay Cycle End", filter: true },
      ],
      defaultColDef: { flex: 1, minWidth: 20, resizable: true },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.payRecords || []);
    },
  };

  const adjustmentDetailConfig = {
    detailGridOptions: {
      domLayout: "autoHeight",
      columnDefs: [
        { field: "description", headerName: "Type", filter: true },
        { field: "from", headerName: "From", filter: true },
        { field: "to", headerName: "To", filter: true },
        { field: "date", headerName: "Date", filter: true },
        { field: "notes", headerName: "Notes", filter: true },
        {
          field: "totalPayment",
          headerName: "Total Payment",
          filter: true,
          valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
        },
        {
          field: "income",
          headerName: "Income",
          filter: true,
          valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
        },
        {
          field: "incomePaid",
          headerName: "Income Paid",
          filter: true,
          valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
        },
      ],
      defaultColDef: { flex: 1, minWidth: 20, resizable: true },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.adjustmentRecords || []);
    },
  };

  const expenseDetailConfig = {
    detailGridOptions: {
      domLayout: "autoHeight",
      columnDefs: [
        { field: "description", headerName: "Description", filter: true },
        {
          field: "amount",
          headerName: "Amount",
          filter: true,
          valueFormatter: (params) => (params.value ? formatCurrency(params.value) : ""),
        },
        {
          field: "reimbursable",
          headerName: "Reimbursable",
          filter: true,
          valueFormatter: (params) => (params.value ? "Yes" : "No"),
        },
        { field: "date", headerName: "Date", filter: true },
        { field: "status", headerName: "Status", filter: true },
      ],
      defaultColDef: { flex: 1, minWidth: 20, resizable: true },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.expenseRecords || []);
    },
  };

  // Which detail grid to show depends on the row's own category — Projects
  // drill down into invoices, Payments (year rows) drill down into the
  // individual pay records for that year, Adjustments/Expenses drill down
  // into their own individual records.
  const detailCellRendererParams = (params) => {
    if (params.data?.detailType === "payroll") return payrollDetailConfig;
    if (params.data?.detailType === "adjustments") return adjustmentDetailConfig;
    if (params.data?.detailType === "expenses") return expenseDetailConfig;
    return invoiceDetailConfig;
  };

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
            rowData={rowData}
            columnDefs={sizeColumnsForHeader(columnDefs)}
            masterDetail={true}
            isRowMaster={(dataItem) => Boolean(dataItem?.detailType)}
            detailCellRendererParams={detailCellRendererParams}
            groupDefaultExpanded={0}
            groupIncludeTotalFooter={false}
            suppressAggFuncInHeader={true}
            pinnedTopRowData={pinnedTopRowData}
            getRowStyle={(params) =>
              params.node.rowPinned ? { backgroundColor: "#d3f4ff", fontWeight: "bold" } : null
            }
            defaultColDef={{
              minWidth: 100,
              resizable: true,
              filter: true,
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
            detailRowAutoHeight={true}
          />
        </div>
      </div>
    </div>
  );
}
