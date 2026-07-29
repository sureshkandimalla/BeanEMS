import React, { useState, useRef } from "react";
import { Collapse, Checkbox, Popover } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "re-resizable";
import ChartCard from "./ChartCard";

const { Panel } = Collapse;

// One chart's box in the drag-to-reorder, resizable area. Sits in a
// flex-wrap container (not Ant's 24-col grid, which fights free-form
// resize) — Resizable controls its actual pixel width/height directly, and
// only the ChartCard's own grab handle (dragHandleProps) is draggable, not
// the whole box, so clicks on the chart/buttons inside still work.
// overflow:hidden on the Resizable box keeps a chart's own internal
// horizontal-scroll content from bleeding out past the card and forcing
// the whole page to scroll.
const SortableChartBox = ({ id, size, onResizeStop, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <Resizable
        size={size}
        onResizeStop={onResizeStop}
        minWidth={320}
        minHeight={220}
        style={{ overflow: "hidden" }}
        enable={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
      >
        {React.cloneElement(children, { dragHandleProps: { ...attributes, ...listeners } })}
      </Resizable>
    </div>
  );
};

// The shared behavior behind every Overview-style chart area in the app:
// show/hide (gear-icon checklist), drag-to-reorder, drag-to-resize (corner
///edge handles), and per-chart PNG download. Exposed as a hook so a page
// with its own outer Collapse/layout (e.g. ProjectDashboard, whose Collapse
// also drives the project-list panel's height) can compose `settingsContent`
// into its own Panel `extra` and drop `contentNode` into its own Panel body,
// instead of getting a second, nested Collapse from <ChartOverviewPanel>.
//
// charts: [{ key, label, title, filename, defaultSize: {width,height}, render: (innerHeight, setChartRef) => ReactNode }]
// - label: shown in the gear-icon show/hide checklist
// - title: shown in the ChartCard header (defaults to label)
// - filename: base filename for PNG download; omit to hide the download button
// - render: build the chart JSX; call setChartRef(el) on the actual
//   ApexCharts-wrapping component (RevenueCharts/TrendLineChart/PieCharts
//   all forward refs) if this chart should be downloadable
export const useChartOverview = (charts) => {
  const [visibleCharts, setVisibleCharts] = useState(() => Object.fromEntries(charts.map((c) => [c.key, true])));
  const [chartOrder, setChartOrder] = useState(() => charts.map((c) => c.key));
  const [chartSizes, setChartSizes] = useState(() =>
    Object.fromEntries(charts.map((c) => [c.key, c.defaultSize || { width: 600, height: 340 }])),
  );
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const chartRefs = useRef({});

  const chartsByKey = Object.fromEntries(charts.map((c) => [c.key, c]));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setChartOrder((order) => arrayMove(order, order.indexOf(active.id), order.indexOf(over.id)));
  };

  const updateChartSize = (key) => (event, direction, ref) => {
    setChartSizes((prev) => ({ ...prev, [key]: { width: ref.offsetWidth, height: ref.offsetHeight } }));
  };

  // The card header (title/icons row) eats a fixed slice of the box's own
  // height — the actual chart gets the rest.
  const chartInnerHeight = (key) => Math.max(chartSizes[key].height - 60, 120);

  const handleDownload = (key, filename) => () => {
    const instance = chartRefs.current[key];
    if (!instance?.chart) return;
    instance.chart.dataURI().then(({ imgURI }) => {
      const link = document.createElement("a");
      link.href = imgURI;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const settingsContent = (
    <Checkbox.Group
      style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}
      value={charts.filter((c) => visibleCharts[c.key]).map((c) => c.key)}
      onChange={(checkedKeys) =>
        setVisibleCharts(Object.fromEntries(charts.map((c) => [c.key, checkedKeys.includes(c.key)])))
      }
    >
      {charts.map((c) => (
        <Checkbox key={c.key} value={c.key}>
          {c.label}
        </Checkbox>
      ))}
    </Checkbox.Group>
  );

  const contentNode = (
    <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={chartOrder.filter((k) => visibleCharts[k])} strategy={rectSortingStrategy}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {chartOrder
            .filter((key) => visibleCharts[key])
            .map((key) => {
              const chart = chartsByKey[key];
              return (
                <SortableChartBox key={key} id={key} size={chartSizes[key]} onResizeStop={updateChartSize(key)}>
                  <ChartCard
                    title={chart.title ?? chart.label}
                    onDownload={chart.filename ? handleDownload(key, chart.filename) : undefined}
                  >
                    {chart.render(chartInnerHeight(key), (el) => (chartRefs.current[key] = el))}
                  </ChartCard>
                </SortableChartBox>
              );
            })}
        </div>
      </SortableContext>
    </DndContext>
  );

  return { settingsContent, contentNode };
};

// Gear icon + "Charts to show" popover — the piece every Overview panel's
// header puts next to its alert bells. Split out so a page with its own
// Panel `extra` (see useChartOverview's doc comment) can compose it in.
export const ChartSettingsIcon = ({ settingsContent }) => (
  <Popover content={settingsContent} title="Charts to show" trigger="click" placement="bottomRight">
    <SettingOutlined />
  </Popover>
);

// Convenience wrapper for the common case: a standalone Overview panel with
// no other layout tied to its own collapse/expand.
const ChartOverviewPanel = ({ panelTitle, alerts, charts, panelKey = "1" }) => {
  const { settingsContent, contentNode } = useChartOverview(charts);

  return (
    <Collapse style={{ marginBottom: 10 }}>
      <Panel
        header={panelTitle}
        key={panelKey}
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 16 }} onClick={(e) => e.stopPropagation()}>
            {alerts}
            <ChartSettingsIcon settingsContent={settingsContent} />
          </div>
        }
      >
        {contentNode}
      </Panel>
    </Collapse>
  );
};

export default ChartOverviewPanel;
