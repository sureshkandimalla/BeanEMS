// Shared "Archive"/"Delete" row actions — every grid using
// NotesActionButton gets the same two entries in the same order with the
// same labels, so the menu looks and behaves identically everywhere.
// Archive/Delete themselves are entity-specific (different endpoint, and
// "archive" usually means "set this entity's own status field"), so each
// grid supplies its own onArchive/onDelete handlers; `extra` appends any
// additional actions specific to that one grid (e.g. a future per-type
// action) after the two common ones.
export const buildRowActions = ({ onArchive, onDelete, extra = [] }) => [
  { key: "archive", label: "Archive", onClick: onArchive },
  { key: "delete", label: "Delete", danger: true, onClick: onDelete },
  ...extra,
];
