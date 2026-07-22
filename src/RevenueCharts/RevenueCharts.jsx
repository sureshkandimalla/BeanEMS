// src/RevenueChart.js
import React from "react";
import ReactApexChart from "react-apexcharts";

// Whole-dollar formatting for on-bar labels — the shared formatCurrency
// always shows cents, which is too noisy printed vertically inside a bar.
const formatWholeCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const RevenueCharts = ({
  thisMonthData,
  lastMonthData,
  categories = ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"],
  series1Name = "This Month",
  series2Name = "Last Month",
}) => {
  const chartOptions = {
    options: {
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: 30,
          dataLabels: {
            orientation: "vertical",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value) => formatWholeCurrency(value),
        style: {
          fontSize: "10px",
        },
      },
      colors: ["#63abfd", "#e697ff"],
      chart: {
        type: "bar",
        height: 250,
      },
      xaxis: {
        categories,
      },
      yaxis: {
        show: false,
      },
      legend: {
        position: "top",
      },
    },
    series: [
      {
        name: series1Name,
        data: thisMonthData,
      },
      {
        name: series2Name,
        data: lastMonthData,
      },
    ],
  };

  return (
    <ReactApexChart
      options={chartOptions?.options}
      series={chartOptions?.series}
      type="bar"
      height={250}
    />
  );
};

export default RevenueCharts;
