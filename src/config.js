// src/config.js
// Centralized config for API endpoints

const API_BASE_URL = "http://localhost:8080/api/v1";

export const API_ENDPOINTS = {
  employeesCountByStatus: `${API_BASE_URL}/employees/employeesCountByStatus`,
  invoicesCountByStatus: `${API_BASE_URL}/invoice/invoicesCountByStatus`,
  getProjects: `${API_BASE_URL}/getProjects`,
  getEmployees: `${API_BASE_URL}/employees/getEmployees`,
  getAllEmployees: `${API_BASE_URL}/employees/getAllEmployees`,
  getAllCustomers: `${API_BASE_URL}/customers/getAllCustomers`,
  assignmentsForProject: (projectId) => `${API_BASE_URL}/assignmentsForProject?projectId=${projectId}`,
  projectsById: (projectId) => `${API_BASE_URL}/projects/${projectId}`,
  employeeById: (employeeId) => `${API_BASE_URL}/employees/employee/${employeeId}`,
  projectsByEmployeeId: (employeeId) => `${API_BASE_URL}/projects?employeeId=${employeeId}`,
  getAllPotentialEmployees: `${API_BASE_URL}/visa/getAllPotentialEmployees`,
  savePotentialEmployees: `${API_BASE_URL}/visa/savePotentialEmployees`,
  addInvoices: `${API_BASE_URL}/invoice/addInvoices`,
  reconcileRecords: `${API_BASE_URL}/reconcile/getReconcileRecords`,
};

export default API_ENDPOINTS;
