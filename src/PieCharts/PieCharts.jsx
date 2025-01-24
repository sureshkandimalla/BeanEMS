import React from "react";
import ReactApexChart from "react-apexcharts";

const PieCharts = ({ chartData, chartLabels }) => {
  let labels = chartLabels;
  let series = chartData;
  let colors = ["#f8aa4e", "#6bcbe2", "#78a0ed"];

  if (chartData?.length === 4) {
    labels = chartLabels.slice(0, 4);
    series = chartData.slice(0, 4);
    colors.push("#596b4e");
  }

  const chartOptions = {
    chart: {
      type: "donut",
      width: "100%",
      height: "auto",
    },
    labels: labels,
    colors: colors,
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "right",
      fontSize: "14px",
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            width: "100%",
            height: "auto",
          },
          legend: {
            position: "bottom",
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            width: "100%",
            height: "auto",
          },
          legend: {
            position: "bottom",
            fontSize: "12px",
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
            height: "auto",
          },
          legend: {
            position: "bottom",
            fontSize: "10px",
          },
        },
      },
    ],
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px", // Increase max-width for better responsiveness
        margin: "0 auto",
        padding: "10px",
      }}
    >
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="donut"
        width="100%"
      />
    </div>
  );
};

export default PieCharts;
