import React from "react";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

// The clickable "Notes" cell for a grid row — always opens the notes
// popup on click, and always shows the dropdown arrow (even with just the
// shared Archive/Delete — see rowActions.js) so the control looks the same
// on every grid whether or not a given row has extra type-specific
// actions. `extraActions`: [{ key, label, danger?, onClick }].
const NotesActionButton = ({ onOpenNotes, extraActions = [] }) => {
  return (
    <Dropdown.Button
      type="link"
      trigger={["click"]}
      icon={<DownOutlined />}
      onClick={onOpenNotes}
      menu={{
        items: extraActions.map(({ onClick, ...item }) => item),
        onClick: ({ key }) => extraActions.find((a) => a.key === key)?.onClick(),
      }}
    >
      Notes
    </Dropdown.Button>
  );
};

export default NotesActionButton;
