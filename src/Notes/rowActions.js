import { message } from "antd";
import axios from "axios";
import API_ENDPOINTS from "../config";

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const isAdmin = () => getLoggedInUser().role === "ADMIN";

// Non-admin click on Archive/Delete — instead of performing the action,
// files a request an admin can approve from the Pending Requests page.
// entityType/entityId/entityLabel identify the row the same way
// Note.type/entityId and <NotesModal entityType/entityId> already do.
const requestAction = ({ entityType, entityId, entityLabel, action }) => {
  const user = getLoggedInUser();
  axios
    .post(API_ENDPOINTS.createActionRequest, {
      type: entityType,
      entityId,
      entityLabel,
      action,
      requestedBy: user.name || user.email || "Unknown",
    })
    .then(() => message.success(`${action === "ARCHIVE" ? "Archive" : "Delete"} request sent to an admin for approval`))
    .catch(() => message.error("Failed to send the request. Please try again."));
};

// Shared "Archive"/"Delete" row actions — every grid using
// NotesActionButton gets the same two entries in the same order with the
// same labels, so the menu looks and behaves identically everywhere.
// Archive/Delete themselves are entity-specific (different endpoint, and
// "archive" usually means "set this entity's own status field"), so each
// grid supplies its own onArchive/onDelete handlers; `extra` appends any
// additional actions specific to that one grid.
//
// Role-gated: only an ADMIN can actually run onArchive/onDelete directly.
// Everyone else gets "Request Archive"/"Request Delete", which files a
// pending request instead — see PendingRequests.jsx for the admin side.
// This check is frontend-only (matches every other role check in this
// app, since the backend has no concept of roles at all today) — it
// hides the direct action from the UI, it does not block the underlying
// API call itself.
export const buildRowActions = ({ onArchive, onDelete, entityType, entityId, entityLabel, extra = [] }) => {
  if (isAdmin()) {
    return [
      { key: "archive", label: "Archive", onClick: onArchive },
      { key: "delete", label: "Delete", danger: true, onClick: onDelete },
      ...extra,
    ];
  }
  return [
    {
      key: "archive",
      label: "Request Archive",
      onClick: () => requestAction({ entityType, entityId, entityLabel, action: "ARCHIVE" }),
    },
    {
      key: "delete",
      label: "Request Delete",
      danger: true,
      onClick: () => requestAction({ entityType, entityId, entityLabel, action: "DELETE" }),
    },
    ...extra,
  ];
};
