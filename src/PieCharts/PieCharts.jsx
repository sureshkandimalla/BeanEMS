import React from "react";
import ReactApexChart from "react-apexcharts";
import '../PieCharts/Piecharts.css'

// Kept in sync with the slice order below so a caller building its own
// legend (e.g. a two-column layout with the donut on one side and a custom
// legend on the other) can reuse the exact same swatch colors. Cycles past
// the end for datasets with more slices than colors.
const PIE_PALETTE = ["#f8aa4e", "#6bcbe2", "#78a0ed", "#596b4e", "#e07a5f", "#3d5a80", "#ee6c4d", "#98c1d9"];
export const getPieColors = (count) =>
  Array.from({ length: count || 0 }, (_, i) => PIE_PALETTE[i % PIE_PALETTE.length]);

// `chartRef`, when given, is attached straight to the underlying
// ReactApexChart instance — see RevenueCharts for why (PNG export).
const PieCharts = React.forwardRef(
  ({ chartData, chartLabels, valueFormatter, legendPosition = "right", showLegend = true }, chartRef) => {
    const labels = chartLabels;
    const series = chartData;
    const colors = getPieColors(chartData?.length);

    const chartOptions = {
      chart: {
        type: "donut",
        width: "100%",
        height: "100%", // Ensure it respects parent height
      },
      labels: labels,
      colors: colors,
      dataLabels: {
        enabled: false,
      },
      // A single-slice donut (e.g. every invoice being "Paid", nothing else)
      // otherwise renders as only a half circle in ApexCharts — the arc math
      // that normally sweeps 0-360deg across multiple slices degenerates
      // with just one. Pinning the full sweep explicitly makes a one-slice
      // donut a complete ring, same as every multi-slice one already is.
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
        },
      },
      legend: {
        show: showLegend,
        position: legendPosition,
        fontSize: "14px",
        formatter: (seriesName, opts) => {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `${seriesName}: ${valueFormatter ? valueFormatter(value) : value}`;
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: {
              width: "100%",
              height: "100%",
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
              height: "100%",
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
              height: "100%",
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
      <div className="pie-chart-container">
        <ReactApexChart
          ref={chartRef}
          options={chartOptions}
          series={series}
          type="donut"
          width="100%"
          height="100%" // Ensure height is fully contained
        />
      </div>
    );
  },
);

export default PieCharts;
