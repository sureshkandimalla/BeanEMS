import React from "react";

// Companion legend for PieCharts rendered with showLegend={false} — used
// whenever the donut needs the built-in ApexCharts legend disabled to get
// full size, with a custom legend placed beside it instead. Callers should
// build `slices` with colors from getPieColors(count) so the dots always
// match the chart.
const PieLegend = ({ slices, valueFormatter, fontSize = 15, rowGap = 10 }) => (
  <>
    {slices.map((s) => (
      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: rowGap }}>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: s.color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize }}>
          {s.label}: {valueFormatter ? valueFormatter(s.value) : s.value}
        </span>
      </div>
    ))}
  </>
);

export default PieLegend;
