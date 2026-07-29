// src/RevenueChart.js
import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

// Whole-dollar formatting for on-bar labels — the shared formatCurrency
// always shows cents, which is too noisy printed vertically inside a bar.
const formatWholeCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Truncates a long x-axis label to keep it on one straight (non-rotated)
// line — the tooltip still shows the full, untruncated category name since
// ApexCharts tooltips read from `categories` directly, not this formatter.
const truncateLabel = (value, maxLength) =>
  maxLength && value && value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

const RevenueCharts = ({
  thisMonthData,
  lastMonthData,
  categories = ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"],
  series1Name = "This Month",
  series2Name = "Last Month",
  xaxisLabelRotate = -45,
  maxLabelLength,
  dataLabelFormatter = formatWholeCurrency,
  // Default behavior for every bar chart built on this component: a fixed
  // pixel width sized off the category count (pxPerCategory each) instead
  // of stretching to 100% — combined with an overflow-x:auto wrapper, this
  // gives a horizontal scrollbar once there are more than
  // `visibleCategories` categories (scrolled to the right/most-recent end
  // by default), so a long history stays scannable at a fixed zoom level
  // instead of squeezing every bar into the card's width. Pass
  // scrollable={false} to opt out for a chart with few, fixed categories.
  scrollable = true,
  visibleCategories = 12,
  pxPerCategory = 70,
}) => {
  // Defaults the scroll position to the far right — the most recent
  // categories (e.g. latest months) — rather than the oldest, since that's
  // what's most relevant on load. Re-runs whenever the category count
  // changes (new data arriving after an async fetch).
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollable && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [scrollable, categories.length]);

  // lastMonthData is optional — omitted entirely, a single-series bar chart
  // (e.g. a plain monthly count) instead of the usual two-series comparison.
  const series = [{ name: series1Name, data: thisMonthData }];
  if (lastMonthData) series.push({ name: series2Name, data: lastMonthData });

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
        formatter: (value) => dataLabelFormatter(value),
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
        labels: {
          rotate: xaxisLabelRotate,
          trim: false,
          formatter: (value) => truncateLabel(value, maxLabelLength),
        },
      },
      yaxis: {
        show: false,
      },
      legend: {
        position: "top",
      },
    },
    series,
  };

  const chart = (
    <ReactApexChart
      options={chartOptions?.options}
      series={chartOptions?.series}
      type="bar"
      height={250}
      width={scrollable ? Math.max(categories.length, visibleCategories) * pxPerCategory : "100%"}
    />
  );

  if (!scrollable) return chart;

  return (
    <div ref={scrollRef} style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
      {chart}
    </div>
  );
};

export default RevenueCharts;
