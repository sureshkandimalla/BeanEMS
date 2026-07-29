import React, { useState } from "react";
import { Card, Modal, Button, Space } from "antd";
import { MinusOutlined, PlusOutlined, ExpandAltOutlined } from "@ant-design/icons";

// Wraps a chart in a Card with minimize/expand controls next to its title —
// minimize collapses the card down to just its header, expand opens the
// same chart full-size in a modal. `extra` renders between the title and
// the icons (e.g. an alert bell). Reused across every Overview-panel chart
// card so the behavior stays consistent.
const ChartCard = ({ title, extra, children, className = "totalRevenceCard" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card className={className}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="totalRevenueLabel">{title}</span>
          <Space size={4}>
            {extra}
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
