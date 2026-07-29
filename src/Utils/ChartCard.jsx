import React, { useState } from "react";
import { Card, Modal, Button, Space } from "antd";
import { MinusOutlined, PlusOutlined, ExpandAltOutlined, HolderOutlined, DownloadOutlined } from "@ant-design/icons";

// Wraps a chart in a Card with minimize/expand/download controls next to
// its title — minimize collapses the card down to just its header, expand
// opens the same chart full-size in a modal, download (when `onDownload`
// is given) exports it as a PNG. `extra` renders between the title and the
// icons (e.g. an alert bell). `dragHandleProps` (from a dnd-kit
// useSortable call in the parent), when given, renders a small grab handle
// that alone is draggable — not the whole card, so clicks on the chart
// itself or the buttons here still work normally. Reused across every
// Overview-panel chart card so the behavior stays consistent.
const ChartCard = ({ title, extra, children, className = "totalRevenceCard", dragHandleProps, onDownload }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card className={className} style={{ height: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="totalRevenueLabel">
            {dragHandleProps && (
              <HolderOutlined {...dragHandleProps} style={{ cursor: "grab", marginRight: 8, color: "#999" }} />
            )}
            {title}
          </span>
          <Space size={4}>
            {extra}
            {onDownload && (
              <Button type="text" size="small" icon={<DownloadOutlined />} onClick={onDownload} title="Download" />
            )}
            <Button type="text" size="small" icon={<ExpandAltOutlined />} onClick={() => setExpanded(true)} title="Expand" />
            <Button
              type="text"
              size="small"
              icon={collapsed ? <PlusOutlined /> : <MinusOutlined />}
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Restore" : "Minimize"}
            />
          </Space>
        </div>
        {!collapsed && children}
      </Card>
      <Modal title={title} open={expanded} onCancel={() => setExpanded(false)} footer={null} width="90vw" destroyOnClose>
        {expanded && children}
      </Modal>
    </>
  );
};

export default ChartCard;
