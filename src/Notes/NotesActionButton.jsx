import React from "react";
import { Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

// The clickable "Notes" cell for a grid row — always opens the notes
// popup on click. `extraActions` is optional: pass grid-specific actions
// (e.g. LCA's Archive/Delete) as [{ key, label, danger?, onClick }] to get
// a split button (arrow opens the rest); omit it for a plain button when
// a grid only needs Notes.
const NotesActionButton = ({ onOpenNotes, extraActions = [] }) => {
  if (extraActions.length === 0) {
    return (
      <Button type="link" onClick={onOpenNotes}>
        Notes
      </Button>
    );
  }

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
