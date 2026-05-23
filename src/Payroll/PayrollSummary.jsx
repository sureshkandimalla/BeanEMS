import React, { useState, useEffect, useRef } from "react";
import API_ENDPOINTS from "../config";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card, Row, Col, Collapse } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import ReactApexChart from "react-apexcharts";

const { Panel } = Collapse;

const PayrollSummary = () => {
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [chartData, setChartData] = useState({
    departments: [],
    netPayByDept: [],
    hoursByDept: [],
    statusLabels: [],
    statusCounts: [],
    totalNetPay: 0,
    totalHours: 0,
    checkDateTotals: { checkDates: [], totalExpenses: [], netPay: [], taxWithheld: [], employerLiability: [] },
  });
  const [checkDateOffset, setCheckDateOffset] = useState(0);
  const isInitialRender = useRef(true);
  const gridRef = useRef(null);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      fetchData();
    }
  }, []);

  const fetchData = () => {
    setRowData([]);
    axios
      .get(API_ENDPOINTS.getPayrollSummaryAll)
      .then((response) => {
        const data = response.data || [];
        setRowData(data);
        buildChartData(data);
      })
      .catch((error) => {
        console.error("Error fetching payroll summary:", error);
      });
  };

  const buildChartData = (data) => {
    // Net Pay & Hours by Department
    const deptMap = {};
    data.forEach((row) => {
      const dept = row.department || "Unknown";
      if (!deptMap[dept]) deptMap[dept] = { netPay: 0, hours: 0 };
      deptMap[dept].netPay += row.netPay || 0;
      deptMap[dept].hours += row.hours || 0;
    });
    const departments = Object.keys(deptMap);
    const netPayByDept = departments.map((d) => Math.round(deptMap[d].netPay));
    const hoursByDept = departments.map((d) => deptMap[d].hours);

    // Totals by checkDate
    const checkDateMap = {};
    data.forEach((row) => {
      const cd = row.checkDate ? row.checkDate.substring(0, 10) : "Unknown"; // group by full date YYYY-MM-DD
      if (!checkDateMap[cd]) checkDateMap[cd] = { totalExpenses: 0, netPay: 0, taxWithheld: 0, employerLiability: 0 };
      checkDateMap[cd].totalExpenses += row.totalExpenses || 0;
      checkDateMap[cd].netPay += row.netPay || 0;
      checkDateMap[cd].taxWithheld += row.taxWithheld || 0;
      checkDateMap[cd].employerLiability += row.employerLiability || 0;
    });
    const checkDates = Object.keys(checkDateMap).sort();
    const checkDateTotals = {
      checkDates,
      totalExpenses: checkDates.map((d) => Math.round(checkDateMap[d].totalExpenses)),
      netPay: checkDates.map((d) => Math.round(checkDateMap[d].netPay)),
      taxWithheld: checkDates.map((d) => Math.round(checkDateMap[d].taxWithheld)),
      employerLiability: checkDates.map((d) => Math.round(checkDateMap[d].employerLiability)),
    };

    // Status distribution
    const statusMap = {};
    data.forEach((row) => {
      const s = row.status || "Unknown";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusLabels = Object.keys(statusMap);
    const statusCounts = statusLabels.map((s) => statusMap[s]);

    const totalNetPay = data.reduce((sum, r) => sum + (r.netPay || 0), 0);
    const totalHours = data.reduce((sum, r) => sum + (r.hours || 0), 0);

    setChartData({ departments, netPayByDept, hoursByDept, statusLabels, statusCounts, totalNetPay, totalHours, checkDateTotals });
  };



  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" };
    }
    return null;
  };

  const formatDate = (params) => {
    if (!params.value) return "";
    const date = new Date(params.value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleExport = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsExcel({ fileName: "payroll_summary.xlsx" });
    }
  };

  // Chart configs
  const allCheckDates = chartData.checkDateTotals.checkDates;
  const visibleCount = 6;
  const totalDates = allCheckDates.length;
  // Default to showing last 6; offset counts from end
  const startIdx = Math.max(0, totalDates - visibleCount - checkDateOffset);
  const endIdx = Math.max(visibleCount, totalDates - checkDateOffset);
  const visibleDates = allCheckDates.slice(startIdx, endIdx);
  const visibleTotals = {
    totalExpenses: chartData.checkDateTotals.totalExpenses.slice(startIdx, endIdx),
    netPay: chartData.checkDateTotals.netPay.slice(startIdx, endIdx),
    taxWithheld: chartData.checkDateTotals.taxWithheld.slice(startIdx, endIdx),
    employerLiability: chartData.checkDateTotals.employerLiability.slice(startIdx, endIdx),
  };

  const checkDateBarOptions = {
    chart: { type: "bar", toolbar: { show: false }, stacked: false },
    plotOptions: { bar: { borderRadius: 3, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    colors: ["#63abfd", "#6bcbe2", "#f8aa4e", "#e697ff"],
    xaxis: {
      categories: visibleDates,
      labels: { style: { fontSize: "11px" }, rotate: -30 },
      title: { text: "Check Date (Month)" },
    },
    yaxis: { show: false },
    legend: { position: "top", fontSize: "12px" },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
    title: { text: "Payroll Totals by Check Date", align: "center", style: { fontSize: "13px" } },
  };

  const hoursBarOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    colors: ["#e697ff"],
    xaxis: { categories: chartData.departments, labels: { style: { fontSize: "11px" } } },
    yaxis: { show: false },
    title: { text: "Hours by Department", align: "center", style: { fontSize: "13px" } },
  };

  const statusPieOptions = {
    chart: { type: "donut" },
    labels: chartData.statusLabels,
    colors: ["#6bcbe2", "#f8aa4e", "#78a0ed", "#596b4e", "#f45b5b"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "12px" },
    title: { text: "Payroll Status", align: "center", style: { fontSize: "13px" } },
  };

  const getColumnsDefList = () => [
    {
      headerName: "Payroll Summary Id",
      field: "payrollSummaryId",
      sortable: true,
      minWidth: 160,
      valueFormatter: (params) => params.node.rowPinned === "top" ? "Total" : params.value,
    },
    { headerName: "Employee Id", field: "employeeId", sortable: true },
    { headerName: "Employee Name", field: "employeeName", sortable: true, minWidth: 180, pinned: "left" },
    { headerName: "Department", field: "department", sortable: true },
    { headerName: "Pay Check Date", field: "checkDate", sortable: true, valueFormatter: formatDate },
    { headerName: "Pay Cycle Start", field: "payPeriodStartDate", sortable: true, valueFormatter: formatDate },
    { headerName: "Pay Cycle End", field: "payPeriodEndDate", sortable: true, valueFormatter: formatDate },
    { headerName: "Hours", field: "hours", sortable: true },
    { headerName: "Total Paid", field: "totalPaid", sortable: true, valueFormatter: (params) => formatCurrency(params.value) },
    { headerName: "Net Pay", field: "netPay", sortable: true, valueFormatter: (params) => formatCurrency(params.value) },
    { headerName: "Tax Withheld", field: "taxWithheld", sortable: true, valueFormatter: (params) => formatCurrency(params.value) },
    { headerName: "Deductions", field: "deductions", sortable: true, valueFormatter: (params) => formatCurrency(params.value) },
    { headerName: "Employer Liability", field: "employerLiability", sortable: true, valueFormatter: (params) => formatCurrency(params.value) },
    { headerName: "Pay Period", field: "payPeriodId", sortable: true },
    { headerName: "Status", field: "status", sortable: true },
  ];

  const handleSearchInputChange = (event) => setSearchText(event.target.value);

  const filterData = () => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };

  const filteredData = filterData();

  const pinnedTopRowData = filteredData.length > 0
    ? [{
        payrollSummaryId: "Total",
        totalPaid: filteredData.reduce((sum, row) => sum + (row.totalPaid || 0), 0),
        hours: filteredData.reduce((sum, row) => sum + (row.hours || 0), 0),
        taxWithheld: filteredData.reduce((sum, row) => sum + (row.taxWithheld || 0), 0),
        deductions: filteredData.reduce((sum, row) => sum + (row.deductions || 0), 0),
        netPay: filteredData.reduce((sum, row) => sum + (row.netPay || 0), 0),
        employerLiability: filteredData.reduce((sum, row) => sum + (row.employerLiability || 0), 0),
      }]
    : [];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "auto" }}>

      {/* Summary KPI Cards */}
      <Row gutter={16} style={{ margin: "12px 12px 0" }}>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#63abfd,#3a7bd5)", color: "#fff", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#e8f4ff" }}>Total Net Pay</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{formatCurrency(chartData.totalNetPay)}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#e697ff,#a855f7)", color: "#fff", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#f5e6ff" }}>Total Hours</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{chartData.totalHours.toLocaleString()}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#6bcbe2,#1e90ff)", color: "#fff", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#e0f7fa" }}>Total Records</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{rowData.length}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#f8aa4e,#f97316)", color: "#fff", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#fff3e0" }}>Departments</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{chartData.departments.length}</div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Collapse
        style={{ margin: "12px 12px 0", transition: "all 0.3s ease-in-out" }}
      >
        <Panel header="Payroll Overview Charts" key="charts">
          <Row gutter={16}>
            <Col span={12}>
              <Card bodyStyle={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 4 }}>
                  <Button
                    size="small"
                    onClick={() => setCheckDateOffset((o) => Math.min(o + 1, totalDates - visibleCount))}
                    disabled={checkDateOffset >= totalDates - visibleCount}
                  >← Older</Button>
                  <Button
                    size="small"
                    onClick={() => setCheckDateOffset((o) => Math.max(o - 1, 0))}
                    disabled={checkDateOffset <= 0}
                  >Newer →</Button>
                </div>
                <ReactApexChart
                  options={checkDateBarOptions}
                  series={[
                    { name: "Total Expenses", data: visibleTotals.totalExpenses },
                    { name: "Net Pay",         data: visibleTotals.netPay },
                    { name: "Tax Withheld",    data: visibleTotals.taxWithheld },
                    { name: "Employer Liability", data: visibleTotals.employerLiability },
                  ]}
                  type="bar"
                  height={220}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: "12px", height: "100%" }}>
                {chartData.statusCounts.length > 0 && (
                  <ReactApexChart
                    options={statusPieOptions}
                    series={chartData.statusCounts}
                    type="donut"
                    height={300}
                  />
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: "12px", height: "100%" }}>
                <ReactApexChart
                  options={hoursBarOptions}
                  series={[{ name: "Hours", data: chartData.hoursByDept }]}
                  type="bar"
                  height={300}
                />
              </Card>
            </Col>
          </Row>
        </Panel>
      </Collapse>

      {/* Grid Section */}
      <div className="ag-theme-alpine employee-List-grid" style={{ flex: 1, margin: "12px" }}>
        <Card className="employeeTableCard" style={{ height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={handleSearchInputChange}
              />
              <Button style={{ marginLeft: "12px" }} type="primary" className="button-vendor" onClick={fetchData}>
                Refresh
              </Button>
              <Button style={{ marginLeft: "8px" }} icon={<DownloadOutlined />} onClick={handleExport}>
                Export Excel
              </Button>
            </div>
          </div>

          <div style={{ height: "calc(100vh - 320px)", minHeight: 300, width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={filteredData}
              columnDefs={getColumnsDefList()}
              defaultColDef={{
                flex: 1,
                minWidth: 150,
                resizable: true,
                filter: false,
                floatingFilter: false,
                cellClass: "ag-cell-centered",
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
              domLayout="normal"
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[100, 200, 300]}
              pinnedTopRowData={pinnedTopRowData}
              getRowStyle={getRowStyle}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PayrollSummary;
