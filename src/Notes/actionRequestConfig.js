import API_ENDPOINTS from "../config";

// Per-entity-type wiring for actually performing an approved Archive/
// Delete request (PendingRequests.jsx) — how to fetch the current record
// (Archive is a PUT of the whole row with its status field changed, so
// the current row has to be read first), which field holds status, and
// how to delete. Keys match the `type` used everywhere else (Note.type,
// ActionRequest.type, each grid's <NotesModal entityType="...">).
//
// Most types have a real single-entity GET at the same URL as their
// update endpoint; Immigration Intake and Potential Employee don't, so
// they fall back to fetching the whole list and finding the row by id
// (getAllUrl/idField instead of getUrl).
export const ACTION_REQUEST_CONFIG = {
  Employee: {
    getUrl: (id) => API_ENDPOINTS.employeeById(id),
    updateUrl: (id) => API_ENDPOINTS.updateEmployee(id),
    deleteUrl: (id) => API_ENDPOINTS.deleteEmployee(id),
    statusField: "status",
  },
  Customer: {
    getUrl: (id) => API_ENDPOINTS.customersById(id),
    updateUrl: (id) => API_ENDPOINTS.customersById(id),
    deleteUrl: (id) => API_ENDPOINTS.deleteCustomer(id),
    statusField: "customerStatus",
  },
  Vendor: {
    getUrl: (id) => API_ENDPOINTS.vendorsById(id),
    updateUrl: (id) => API_ENDPOINTS.vendorsById(id),
    deleteUrl: (id) => API_ENDPOINTS.deleteVendor(id),
    statusField: "vendorStatus",
  },
  LCA: {
    getUrl: (id) => API_ENDPOINTS.getLCAById(id),
    // saveLCA is a POST upsert keyed by lcaId in the body, not a PUT.
    updateUrl: () => API_ENDPOINTS.saveLCA,
    updateMethod: "post",
    deleteUrl: (id) => API_ENDPOINTS.deleteLCA(id),
    statusField: "status",
  },
  Visa: {
    getUrl: (id) => API_ENDPOINTS.updateVisa(id), // same URL as update, just GET
    updateUrl: (id) => API_ENDPOINTS.updateVisa(id),
    deleteUrl: (id) => API_ENDPOINTS.deleteVisa(id),
    statusField: "status",
  },
  Project: {
    getUrl: (id) => API_ENDPOINTS.projectsById(id),
    updateUrl: (id) => API_ENDPOINTS.projectsById(id),
    deleteUrl: (id) => API_ENDPOINTS.projectsById(id),
    statusField: "status",
  },
  Invoice: {
    getUrl: (id) => API_ENDPOINTS.invoiceById(id),
    updateUrl: (id) => API_ENDPOINTS.invoiceById(id),
    deleteUrl: (id) => API_ENDPOINTS.invoiceById(id),
    statusField: "status",
  },
  ImmigrationIntake: {
    getAllUrl: API_ENDPOINTS.getAllImmiIntakes,
    idField: "intakeId",
    updateUrl: (id) => API_ENDPOINTS.updateImmiIntake(id),
    deleteUrl: (id) => API_ENDPOINTS.deleteImmiIntake(id),
    statusField: "applicationStatus",
  },
  COI: {
    getUrl: (id) => API_ENDPOINTS.coiById(id),
    updateUrl: (id) => API_ENDPOINTS.coiById(id),
    deleteUrl: (id) => API_ENDPOINTS.coiById(id),
    statusField: "status",
  },
  Expense: {
    getUrl: (id) => API_ENDPOINTS.expenseById(id),
    updateUrl: (id) => API_ENDPOINTS.expenseById(id),
    deleteUrl: (id) => API_ENDPOINTS.deleteExpense(id),
    statusField: "status",
  },
  PotentialEmployee: {
    getAllUrl: API_ENDPOINTS.getAllPotentialEmployees,
    idField: "peId",
    // savePotentialEmployees is a bulk POST accepting a list, not a
    // single-row PUT.
    updateUrl: () => API_ENDPOINTS.savePotentialEmployees,
    updateMethod: "post-list",
    deleteUrl: (id) => API_ENDPOINTS.deletePotentialEmployee(id),
    statusField: "status",
  },
};
