import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../config";
import { Button, Card, Row, Col, Collapse, Radio, Select } from "antd";
import axios from "axios";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear, formatDate } from "../Utils/dateFormat";
import ReactApexChart from "react-apexcharts";
import PayrollDetails from "./PayrollDetails";

const { Panel } = Collapse;

const PayrollSummary = ({ employeeId }) => {
  const [rowData, setRowData] = useState([]);
  const [chartData, setChartData] = useState({
    departments: [],
    netPayByDept: [],
    totalNetPay: 0,
    totalHours: 0,
    checkDateTotals: { checkDates: [], totalExpenses: [], netPay: [], taxWithheld: [], employerLiability: [] },
    checkDateBreakdown: {},
    yearTotals: { years: [], totalExpenses: [], netPay: [], taxWithheld: [], employerLiability: [] },
    employeeCountByMonth: { months: [], counts: [] },
  });
  const [checkDateOffset, setCheckDateOffset] = useState(0);
  const [chartsOpen, setChartsOpen] = useState(true);
  const [checkDateGroupBy, setCheckDateGroupBy] = useState("date"); // "date" | "year"
  // Which check date the "Amounts by Check Date" donut breaks down —
  // defaults to (and re-snaps to) the most recent check date whenever the
  // available dates change, but keeps the user's pick otherwise.
  const [selectedCheckDate, setSelectedCheckDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = () => {
    setRowData([]);
    const endpoint = employeeId
      ? API_ENDPOINTS.getPayrollsForEmp(employeeId)
      : API_ENDPOINTS.getPayrollSummaryAll;
    axios
      .get(endpoint)
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
    // Net Pay by Department (Department count still feeds the "Departments" KPI card)
    const deptMap = {};
    data.forEach((row) => {
      const dept = row.department || "Unknown";
      if (!deptMap[dept]) deptMap[dept] = { netPay: 0, hours: 0 };
      deptMap[dept].netPay += row.netPay || 0;
      deptMap[dept].hours += row.hours || 0;
    });
    const departments = Object.keys(deptMap);
    const netPayByDept = departments.map((d) => Math.round(deptMap[d].netPay));

    // Distinct employees paid per check-date month.
    const monthEmployeeMap = {};
    data.forEach((row) => {
      if (!row.checkDate) return;
      const month = row.checkDate.substring(0, 7); // "yyyy-MM"
      if (!monthEmployeeMap[month]) monthEmployeeMap[month] = new Set();
      monthEmployeeMap[month].add(row.employeeId ?? row.employeeName);
    });
    const months = Object.keys(monthEmployeeMap).sort();
    const employeeCountByMonth = {
      months,
      counts: months.map((m) => monthEmployeeMap[m].size),
    };

    // Totals by checkDate — also keeps deductions (not needed by the bar
    // chart above, but is one of the 4 slices in the per-check-date
    // amount-breakdown donut below).
    const checkDateMap = {};
    data.forEach((row) => {
      const cd = row.checkDate ? row.checkDate.substring(0, 10) : "Unknown"; // group by full date YYYY-MM-DD
      if (!checkDateMap[cd]) checkDateMap[cd] = { totalExpenses: 0, netPay: 0, taxWithheld: 0, employerLiability: 0, deductions: 0 };
      checkDateMap[cd].totalExpenses += row.totalExpenses || 0;
      checkDateMap[cd].netPay += row.netPay || 0;
      checkDateMap[cd].taxWithheld += row.taxWithheld || 0;
      checkDateMap[cd].employerLiability += row.employerLiability || 0;
      checkDateMap[cd].deductions += row.deductions || 0;
    });
    const checkDates = Object.keys(checkDateMap).filter((d) => d !== "Unknown").sort();
    const checkDateTotals = {
      checkDates,
      totalExpenses: checkDates.map((d) => Math.round(checkDateMap[d].totalExpenses)),
      netPay: checkDates.map((d) => Math.round(checkDateMap[d].netPay)),
      taxWithheld: checkDates.map((d) => Math.round(checkDateMap[d].taxWithheld)),
      employerLiability: checkDates.map((d) => Math.round(checkDateMap[d].employerLiability)),
    };
    const checkDateBreakdown = checkDateMap;

    // Totals by year (same shape as checkDateTotals, grouped coarser)
    const yearMap = {};
    data.forEach((row) => {
      const yr = row.checkDate ? row.checkDate.substring(0, 4) : "Unknown";
      if (!yearMap[yr]) yearMap[yr] = { totalExpenses: 0, netPay: 0, taxWithheld: 0, employerLiability: 0 };
      yearMap[yr].totalExpenses += row.totalExpenses || 0;
      yearMap[yr].netPay += row.netPay || 0;
      yearMap[yr].taxWithheld += row.taxWithheld || 0;
      yearMap[yr].employerLiability += row.employerLiability || 0;
    });
    const years = Object.keys(yearMap).sort();
    const yearTotals = {
      years,
      totalExpenses: years.map((y) => Math.round(yearMap[y].totalExpenses)),
      netPay: years.map((y) => Math.round(yearMap[y].netPay)),
      taxWithheld: years.map((y) => Math.round(yearMap[y].taxWithheld)),
      employerLiability: years.map((y) => Math.round(yearMap[y].employerLiability)),
    };

    const totalNetPay = data.reduce((sum, r) => sum + (r.netPay || 0), 0);
    const totalHours = data.reduce((sum, r) => sum + (r.hours || 0), 0);

    setChartData({ departments, netPayByDept, totalNetPay, totalHours, checkDateTotals, checkDateBreakdown, yearTotals, employeeCountByMonth });

    // Default the amount-breakdown donut to the most recent check date, and
    // re-snap to it if the current selection no longer exists (e.g. after a
    // refetch) — otherwise leave whatever the user picked alone.
    setSelectedCheckDate((current) =>
      current && checkDates.includes(current) ? current : checkDates[checkDates.length - 1] || null,
    );
  };

  // Chart configs — grouped by either exact check date or by year, per the toggle.
  const groupedTotals = checkDateGroupBy === "year" ? chartData.yearTotals : chartData.checkDateTotals;
  const allCheckDates = checkDateGroupBy === "year" ? groupedTotals.years : groupedTotals.checkDates;
  const visibleCount = 6;
  const totalDates = allCheckDates.length;
  // Default to showing last 6; offset counts from end
  const startIdx = Math.max(0, totalDates - visibleCount - checkDateOffset);
  const endIdx = Math.max(visibleCount, totalDates - checkDateOffset);
  const visibleDates = allCheckDates.slice(startIdx, endIdx);
  const visibleTotals = {
    totalExpenses: groupedTotals.totalExpenses.slice(startIdx, endIdx),
    netPay: groupedTotals.netPay.slice(startIdx, endIdx),
    taxWithheld: groupedTotals.taxWithheld.slice(startIdx, endIdx),
    employerLiability: groupedTotals.employerLiability.slice(startIdx, endIdx),
  };

  const checkDateBarOptions = {
    chart: { type: "bar", toolbar: { show: false }, stacked: false },
    plotOptions: { bar: { borderRadius: 3, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    colors: ["#63abfd", "#6bcbe2", "#f8aa4e", "#e697ff"],
    xaxis: {
      categories: visibleDates,
      labels: { style: { fontSize: "11px" }, rotate: -30 },
      title: { text: checkDateGroupBy === "year" ? "Year" : "Check Date (Month)" },
    },
    yaxis: { show: false },
    legend: { position: "top", fontSize: "12px" },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
    title: {
      text: checkDateGroupBy === "year" ? "Payroll Totals by Year" : "Payroll Totals by Check Date",
      align: "center",
      style: { fontSize: "13px" },
    },
  };

  const employeeCountByMonthOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    colors: ["#e697ff"],
    xaxis: {
      categories: chartData.employeeCountByMonth.months.map((m) => formatMonthYear(m)),
      labels: { style: { fontSize: "11px" }, rotate: -30 },
    },
    yaxis: { show: false },
    title: { text: "Employee Count by Month", align: "center", style: { fontSize: "13px" } },
  };

  // Amounts by Check Date — Net Pay / Tax Withheld / Deductions / Employer
  // Liability breakdown for whichever check date is selected above,
  // replacing the old "Payroll Status" donut (payroll rows don't carry a
  // meaningful status, so that chart was always just one "Unknown" slice).
  const selectedBreakdown = chartData.checkDateBreakdown[selectedCheckDate] || {
    netPay: 0,
    taxWithheld: 0,
    deductions: 0,
    employerLiability: 0,
  };
  const breakdownLabels = ["Net Pay", "Tax Withheld", "Deductions", "Employer Liability"];
  const breakdownSeries = [
    selectedBreakdown.netPay,
    selectedBreakdown.taxWithheld,
    selectedBreakdown.deductions,
    selectedBreakdown.employerLiability,
  ].map((v) => Math.round(v));
  const breakdownTotal = breakdownSeries.reduce((sum, v) => sum + v, 0);

  const checkDateBreakdownOptions = {
    chart: { type: "donut" },
    labels: breakdownLabels,
    colors: ["#63abfd", "#f8aa4e", "#e697ff", "#6bcbe2"],
    // No static amount/% on the slices or in the legend — numbers only
    // surface on hover, via the tooltip below, so the donut itself stays
    // uncluttered.
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "12px" },
    tooltip: {
      y: {
        formatter: (val) => {
          const pct = breakdownTotal > 0 ? ((val / breakdownTotal) * 100).toFixed(1) : "0.0";
          return `${formatCurrency(val)} (${pct}%)`;
        },
      },
    },
    title: { text: "Payroll Summary", align: "center", style: { fontSize: "13px" } },
  };

  if (employeeId) {
    return <PayrollDetails rowData={rowData} onRefresh={fetchData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "auto", paddingBottom: 16 }}>

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
        defaultActiveKey={["charts"]}
        onChange={(keys) => setChartsOpen(keys.includes("charts"))}
        style={{ margin: "12px 12px 0", transition: "all 0.3s ease-in-out" }}
      >
        <Panel header="Payroll Overview Charts" key="charts">
          <Row gutter={16}>
            <Col span={12}>
              <Card bodyStyle={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Radio.Group
                    size="small"
                    value={checkDateGroupBy}
                    onChange={(e) => {
                      setCheckDateGroupBy(e.target.value);
                      setCheckDateOffset(0); // reset paging — bucket count changes between date/year views
                    }}
                  >
                    <Radio.Button value="date">By Check Date</Radio.Button>
                    <Radio.Button value="year">By Year</Radio.Button>
                  </Radio.Group>
                  <div style={{ display: "flex", gap: 8 }}>
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
                <Select
                  size="small"
                  style={{ width: "100%", marginBottom: 4 }}
                  value={selectedCheckDate}
                  onChange={setSelectedCheckDate}
                  options={chartData.checkDateTotals.checkDates.map((d) => ({ value: d, label: formatDate(d) }))}
                  placeholder="Select check date"
                />
                {breakdownTotal > 0 ? (
                  <ReactApexChart
                    options={checkDateBreakdownOptions}
                    series={breakdownSeries}
                    type="donut"
                    height={280}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>No amounts for this check date</div>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: "12px", height: "100%" }}>
                <ReactApexChart
                  options={employeeCountByMonthOptions}
                  series={[{ name: "Employees", data: chartData.employeeCountByMonth.counts }]}
                  type="bar"
                  height={300}
                />
              </Card>
            </Col>
          </Row>
        </Panel>
      </Collapse>

      {/* Grid Section */}
      <div style={{ flex: 1, minHeight: 0, margin: "8px 12px 12px" }}>
        <PayrollDetails
          rowData={rowData}
          onRefresh={fetchData}
          gridHeight={chartsOpen ? "calc(100vh - 720px)" : "calc(100vh - 400px)"}
        />
      </div>
    </div>
  );
};

export default PayrollSummary;
