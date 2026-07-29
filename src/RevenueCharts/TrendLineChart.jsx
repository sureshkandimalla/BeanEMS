import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

// A single-series area/line trend chart — used where a bar-per-category
// chart (RevenueCharts) would overstate a plain month-over-month trend
// with only a handful of points (e.g. invoice count by month). Scrollable
// by default, same as RevenueCharts: a fixed pixel width sized off the
// category count, auto-scrolled to the right (most recent) edge, so a long
// history stays scannable at a fixed zoom level instead of squeezing every
// point into the card's width.
// `chartRef`, when given, is attached straight to the underlying
// ReactApexChart instance — see RevenueCharts for why (PNG export).
const TrendLineChart = React.forwardRef(({
  data,
  categories,
  seriesName = "Count",
  valueFormatter = (value) => value,
  color = "#63abfd",
  scrollable = true,
  visibleCategories = 12,
  pxPerCategory = 70,
  height = 250,
}, chartRef) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollable && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [scrollable, categories.length]);

  // See RevenueCharts for why the scrollbar needs its own reserved slice of
  // the wrapper's height instead of sharing the chart's own height exactly.
  const scrollbarReserve = scrollable ? 20 : 0;
  const chartHeight = Math.max(height - scrollbarReserve, 100);

  const chartOptions = {
    chart: {
      type: "area",
      height: chartHeight,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [color],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      hover: { size: 7 },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => valueFormatter(value),
      style: { fontSize: "11px" },
      offsetY: -8,
    },
    xaxis: {
      categories,
      labels: {
        rotate: 0,
        trim: false,
      },
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (value) => valueFormatter(value),
      },
    },
    grid: {
      strokeDashArray: 4,
    },
  };

  const chart = (
    <ReactApexChart
      ref={chartRef}
      options={chartOptions}
      series={[{ name: seriesName, data }]}
      type="area"
      height={chartHeight}
      width={scrollable ? Math.max(categories.length, visibleCategories) * pxPerCategory : "100%"}
    />
  );

  if (!scrollable) return chart;

  return (
    <div ref={scrollRef} style={{ width: "100%", height, overflowX: "auto", overflowY: "hidden" }}>
      {chart}
    </div>
  );
});

export default TrendLineChart;
