import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../config";
import { Button, Card, Row, Col, Collapse, Radio } from "antd";
import axios from "axios";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { formatMonthYear } from "../Utils/dateFormat";
import ReactApexChart from "react-apexcharts";
import HealthInsuranceDetails from "./HealthInsuranceDetails";

const { Panel } = Collapse;

const HealthInsuranceSummary = ({ employeeId }) => {
  const [rowData, setRowData] = useState([]);
  const [chartData, setChartData] = useState({
    totalBilled: 0,
    totalClaimPrefund: 0,
    employeeCount: 0,
    costBreakdownLabels: [],
    costBreakdownValues: [],
    billDateTotals: { billDates: [], claimPrefund: [], specificStopLoss: [], aggregateStopLoss: [], adminFee: [] },
    yearTotals: { years: [], claimPrefund: [], specificStopLoss: [], aggregateStopLoss: [], adminFee: [] },
    employeeCountByMonth: { months: [], counts: [] },
  });
  const [billDateOffset, setBillDateOffset] = useState(0);
  const [chartsOpen, setChartsOpen] = useState(true);
  const [billDateGroupBy, setBillDateGroupBy] = useState("date"); // "date" | "year"

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = () => {
    setRowData([]);
    const endpoint = employeeId
      ? API_ENDPOINTS.getHealthInsuranceForEmp(employeeId)
      : API_ENDPOINTS.getHealthInsuranceAll;
    axios
      .get(endpoint)
      .then((response) => {
        const data = response.data || [];
        setRowData(data);
        buildChartData(data);
      })
      .catch((error) => {
        console.error("Error fetching health insurance summary:", error);
      });
  };

  const buildChartData = (data) => {
    // Distinct employees billed per bill-date month.
    const monthEmployeeMap = {};
    data.forEach((row) => {
      if (!row.dateOfBill) return;
      const month = row.dateOfBill.substring(0, 7); // "yyyy-MM"
      if (!monthEmployeeMap[month]) monthEmployeeMap[month] = new Set();
      monthEmployeeMap[month].add(row.employeeId ?? row.employeeName);
    });
    const months = Object.keys(monthEmployeeMap).sort();
    const employeeCountByMonth = {
      months,
      counts: months.map((m) => monthEmployeeMap[m].size),
    };

    // Totals by bill date
    const billDateMap = {};
    data.forEach((row) => {
      const bd = row.dateOfBill ? row.dateOfBill.substring(0, 10) : "Unknown";
      if (!billDateMap[bd]) billDateMap[bd] = { claimPrefund: 0, specificStopLoss: 0, aggregateStopLoss: 0, adminFee: 0 };
      billDateMap[bd].claimPrefund += row.claimPrefund || 0;
      billDateMap[bd].specificStopLoss += row.specificStopLoss || 0;
      billDateMap[bd].aggregateStopLoss += row.aggregateStopLoss || 0;
      billDateMap[bd].adminFee += row.adminFee || 0;
    });
    const billDates = Object.keys(billDateMap).sort();
    const billDateTotals = {
      billDates,
      claimPrefund: billDates.map((d) => Math.round(billDateMap[d].claimPrefund)),
      specificStopLoss: billDates.map((d) => Math.round(billDateMap[d].specificStopLoss)),
      aggregateStopLoss: billDates.map((d) => Math.round(billDateMap[d].aggregateStopLoss)),
      adminFee: billDates.map((d) => Math.round(billDateMap[d].adminFee)),
    };

    // Totals by year (same shape, grouped coarser)
    const yearMap = {};
    data.forEach((row) => {
      const yr = row.dateOfBill ? row.dateOfBill.substring(0, 4) : "Unknown";
      if (!yearMap[yr]) yearMap[yr] = { claimPrefund: 0, specificStopLoss: 0, aggregateStopLoss: 0, adminFee: 0 };
      yearMap[yr].claimPrefund += row.claimPrefund || 0;
      yearMap[yr].specificStopLoss += row.specificStopLoss || 0;
      yearMap[yr].aggregateStopLoss += row.aggregateStopLoss || 0;
      yearMap[yr].adminFee += row.adminFee || 0;
    });
    const years = Object.keys(yearMap).sort();
    const yearTotals = {
      years,
      claimPrefund: years.map((y) => Math.round(yearMap[y].claimPrefund)),
      specificStopLoss: years.map((y) => Math.round(yearMap[y].specificStopLoss)),
      aggregateStopLoss: years.map((y) => Math.round(yearMap[y].aggregateStopLoss)),
      adminFee: years.map((y) => Math.round(yearMap[y].adminFee)),
    };

    // Cost composition (overall)
    const totalClaimPrefund = data.reduce((sum, r) => sum + (r.claimPrefund || 0), 0);
    const totalSpecificStopLoss = data.reduce((sum, r) => sum + (r.specificStopLoss || 0), 0);
    const totalAggregateStopLoss = data.reduce((sum, r) => sum + (r.aggregateStopLoss || 0), 0);
    const totalAdminFee = data.reduce((sum, r) => sum + (r.adminFee || 0), 0);
    const costBreakdownLabels = ["Claim Prefund", "Specific Stop Loss", "Aggregate Stop Loss", "Admin Fee"];
    const costBreakdownValues = [
      Math.round(totalClaimPrefund),
      Math.round(totalSpecificStopLoss),
      Math.round(totalAggregateStopLoss),
      Math.round(totalAdminFee),
    ];

    const totalBilled = data.reduce((sum, r) => sum + (r.total || 0), 0);
    const employeeIds = new Set(data.map((r) => r.employeeId ?? r.employeeName));

    setChartData({
      totalBilled,
      totalClaimPrefund,
      employeeCount: employeeIds.size,
      costBreakdownLabels,
      costBreakdownValues,
      billDateTotals,
      yearTotals,
      employeeCountByMonth,
    });
  };

  // Chart configs — grouped by either exact bill date or by year, per the toggle.
  const groupedTotals = billDateGroupBy === "year" ? chartData.yearTotals : chartData.billDateTotals;
  const allBillDates = billDateGroupBy === "year" ? groupedTotals.years : groupedTotals.billDates;
  const visibleCount = 6;
  const totalDates = allBillDates.length;
  const startIdx = Math.max(0, totalDates - visibleCount - billDateOffset);
  const endIdx = Math.max(visibleCount, totalDates - billDateOffset);
  const visibleDates = allBillDates.slice(startIdx, endIdx);
  const visibleTotals = {
    claimPrefund: groupedTotals.claimPrefund.slice(startIdx, endIdx),
    specificStopLoss: groupedTotals.specificStopLoss.slice(startIdx, endIdx),
    aggregateStopLoss: groupedTotals.aggregateStopLoss.slice(startIdx, endIdx),
    adminFee: groupedTotals.adminFee.slice(startIdx, endIdx),
  };

  const billDateBarOptions = {
    chart: { type: "bar", toolbar: { show: false }, stacked: false },
    plotOptions: { bar: { borderRadius: 3, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    colors: ["#63abfd", "#6bcbe2", "#f8aa4e", "#e697ff"],
    xaxis: {
      categories: visibleDates,
      labels: { style: { fontSize: "11px" }, rotate: -30 },
      title: { text: billDateGroupBy === "year" ? "Year" : "Bill Date" },
    },
    yaxis: { show: false },
    legend: { position: "top", fontSize: "12px" },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
    title: {
      text: billDateGroupBy === "year" ? "Insurance Costs by Year" : "Insurance Costs by Bill Date",
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
    title: { text: "Employees Covered by Month", align: "center", style: { fontSize: "13px" } },
  };

  const costBreakdownOptions = {
    chart: { type: "donut" },
    labels: chartData.costBreakdownLabels,
    colors: ["#63abfd", "#6bcbe2", "#f8aa4e", "#e697ff"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "12px" },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
    title: { text: "Cost Composition", align: "center", style: { fontSize: "13px" } },
  };

  if (employeeId) {
    return <HealthInsuranceDetails rowData={rowData} onRefresh={fetchData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "auto", paddingBottom: 16 }}>

      {/* Summary KPI Cards */}
      <Row gutter={16} style={{ margin: "12px 12px 0" }}>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#63abfd,#3a7bd5)", color: "#fff", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#e8f4ff" }}>Total Billed</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{formatCurrency(chartData.totalBilled)}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: "linear-gradient(135deg,#e697ff,#a855f7)", color: "#fff", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#f5e6ff" }}>Total Claim Prefund</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{formatCurrency(chartData.totalClaimPrefund)}</div>
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
            <div style={{ fontSize: 13, color: "#fff3e0" }}>Employees Covered</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>{chartData.employeeCount}</div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Collapse
        defaultActiveKey={["charts"]}
        onChange={(keys) => setChartsOpen(keys.includes("charts"))}
        style={{ margin: "12px 12px 0", transition: "all 0.3s ease-in-out" }}
      >
        <Panel header="Health Insurance Overview Charts" key="charts">
          <Row gutter={16}>
            <Col span={12}>
              <Card bodyStyle={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Radio.Group
                    size="small"
                    value={billDateGroupBy}
                    onChange={(e) => {
                      setBillDateGroupBy(e.target.value);
                      setBillDateOffset(0); // reset paging — bucket count changes between date/year views
                    }}
                  >
                    <Radio.Button value="date">By Bill Date</Radio.Button>
                    <Radio.Button value="year">By Year</Radio.Button>
                  </Radio.Group>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      size="small"
                      onClick={() => setBillDateOffset((o) => Math.min(o + 1, totalDates - visibleCount))}
                      disabled={billDateOffset >= totalDates - visibleCount}
                    >← Older</Button>
                    <Button
                      size="small"
                      onClick={() => setBillDateOffset((o) => Math.max(o - 1, 0))}
                      disabled={billDateOffset <= 0}
                    >Newer →</Button>
                  </div>
                </div>
                <ReactApexChart
                  options={billDateBarOptions}
                  series={[
                    { name: "Claim Prefund", data: visibleTotals.claimPrefund },
                    { name: "Specific Stop Loss", data: visibleTotals.specificStopLoss },
                    { name: "Aggregate Stop Loss", data: visibleTotals.aggregateStopLoss },
                    { name: "Admin Fee", data: visibleTotals.adminFee },
                  ]}
                  type="bar"
                  height={220}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: "12px", height: "100%" }}>
                {chartData.costBreakdownValues.length > 0 && (
                  <ReactApexChart
                    options={costBreakdownOptions}
                    series={chartData.costBreakdownValues}
                    type="donut"
                    height={300}
                  />
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
        <HealthInsuranceDetails
          rowData={rowData}
          onRefresh={fetchData}
          gridHeight={chartsOpen ? "calc(100vh - 720px)" : "calc(100vh - 400px)"}
        />
      </div>
    </div>
  );
};

export default HealthInsuranceSummary;
