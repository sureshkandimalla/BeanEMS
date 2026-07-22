export const usCountryTelList = [
  { value: "USA", label: "USA" },
  { value: "IN", label: "IN" },
];

export const taxTermsList = [
  { value: "W2", label: "W2" },
  { value: "1099", label: "1099" },
  { value: "C2C", label: "C2C" },
  { value: "Other", label: "Other" },

];

export const employementTypeList = [
  { value: "Full-Time", label: "Full-Time" },
  { value: "C2C", label: "C2C" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Hourly", label: "Hourly" },
  
];

export const workingStatusList = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Bench", label: "Bench" },
  { value: "OnBoarding", label: "On-Boarding" },
  { value: "NewHires", label: "New Hires" },
];
export const workAuthorizationList = [
  { value: "H1B", label: "H1B" },
  { value: "OPT", label: "OPT" },
  { value: "OPT EAD", label: "OPT EAD" },
  { value: "STEM EAD", label: "STEM EAD" },
  { value: "H4 EAD", label: "H4 EAD" },
  { value: "Citizen", label: "Citizen" },
  { value: "GC", label: "GC" },
  { value: "L1", label: "L1" },
  { value: "E3", label: "E3" },

];

export const everifyStatusList = [
  { value: "Completed", label: "Completed" },
  { value: "In Process", label: "In Process" },
  { value: "Removed", label: "Removed" },
  { value: "Not Completed", label: "Not Completed" },
  { value: "Drafted", label: "Drafted" },
];
export const i9StatusList = [
  { value: "Completed", label: "Completed" },
  { value: "In Process", label: "In Process" },
  { value: "Rehire", label: "Rehire" },
  { value: "Reverified", label: "Reverified" },
];

export const invoiceStatusList = [
  { value: "Submitted", label: "Submitted" },
  { value: "Created", label: "Created" },
  { value: "Paid", label: "Paid" },
  { value: "Partially Paid", label: "Partially Paid" },
];

export const expenseStatusList = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Reimbursed", label: "Reimbursed" },
];

export const expenseTypeList = [
  { value: "Attorney Fee", label: "Attorney Fee" },
  { value: "USCIS Fee", label: "USCIS Fee" },
  { value: "Employee Reimbursement", label: "Employee Reimbursement" },
  { value: "Green Card Fee", label: "Green Card Fee" },
  { value: "Mail Service", label: "Mail Service" },
  { value: "Other", label: "Other" },
];

export const visaStatusList = [
  { value: "Submitted",   label: "Submitted" },
  { value: "RFE",         label: "RFE" },
  { value: "Approved",    label: "Approved" },
  { value: "In Progress", label: "In Progress" },
  { value: "Expired",     label: "Expired" },
  { value: "Revoked",     label: "Revoked" },
];
// src/config.js
// Centralized config for API endpoints

export const API_BASE_URL = "http://localhost:8080/api/v1";

export const API_ENDPOINTS = {
  saveEmployees: `${API_BASE_URL}/employees/saveEmployees`,
  employeesCountByStatus: `${API_BASE_URL}/employees/employeesCountByStatus`,
  invoicesCountByStatus: `${API_BASE_URL}/invoice/invoicesCountByStatus`,
  getProjects: `${API_BASE_URL}/getProjects`,
  wagesById: (wageId) => `${API_BASE_URL}/wages/${wageId}`,
  getEmployees: `${API_BASE_URL}/employees/getEmployees`,
  getAllEmployees: `${API_BASE_URL}/employees/getAllEmployees`,
  getAllCustomers: `${API_BASE_URL}/customers/getAllCustomers`,
  customersById: (customerId) => `${API_BASE_URL}/customers/customers/${customerId}`,
  assignmentsForProject: (projectId) => `${API_BASE_URL}/assignmentsForProject?projectId=${projectId}`,
  projectsById: (projectId) => `${API_BASE_URL}/projects/${projectId}`,
  employeeById: (employeeId) => `${API_BASE_URL}/employees/employee/${employeeId}`,
  updateEmployee: (employeeId) => `${API_BASE_URL}/employees/${employeeId}`,
  projectsByEmployeeId: (employeeId) => `${API_BASE_URL}/projects?employeeId=${employeeId}`,
  getAllPotentialEmployees: `${API_BASE_URL}/visa/getAllPotentialEmployees`,
  savePotentialEmployees: `${API_BASE_URL}/visa/savePotentialEmployees`,
  addInvoices: `${API_BASE_URL}/invoice/addInvoices`,
  getAllInvoices: `${API_BASE_URL}/invoice/getAllInvoices`,
  invoiceById: (invoiceId) => `${API_BASE_URL}/invoice/invoices/${invoiceId}`,
  reconcileRecords: `${API_BASE_URL}/reconcile/getReconcileRecords`,
  saveOnBoardDetails: `${API_BASE_URL}/employees/saveOnBoardDetails`,
  saveOnBoardDetailsVendor: `${API_BASE_URL}/customers/saveOnBoardDetails`,
  getInvoicesForProject: (projectId) => `${API_BASE_URL}/invoice/getInvoicesForProject?projectId=${projectId}`,
  getInvoicesForEmployee: `${API_BASE_URL}/invoice/getInvoicesForEmployee`,
  addExpense: `${API_BASE_URL}/expense/addExpense`,
  getAllExpenses: `${API_BASE_URL}/expense/getAllExpenses`,
  expenseById: (expenseId) => `${API_BASE_URL}/expense/expenses/${expenseId}`,
  getExpensesForEmployee: (employeeId) => `${API_BASE_URL}/expense/getExpensesForEmployee?employeeId=${employeeId}`,
  expensesCountByStatus: `${API_BASE_URL}/expense/expensesCountByStatus`,
  getBillsForProject: (projectId) => `${API_BASE_URL}/bills/getBillsForProject?projectId=${projectId}`,
  getBillsForEmployee: (employeeId) => `${API_BASE_URL}/bills/getBillsForEmployee?employeeId=${employeeId}`,
  assignments: `${API_BASE_URL}/assignments`,
  assignmentsById: (assignmentId) => `${API_BASE_URL}/assignments/${assignmentId}`,
  saveOnBoardProject: `${API_BASE_URL}/saveOnBoardProject`,
  getPayrollSummaryAll: `${API_BASE_URL}/payrollsummary/getAll`,
  getPayrollsForEmp: (employeeId) => `${API_BASE_URL}/payrollsummary/getByEmployeeId/${employeeId}`,
  createLCA: `${API_BASE_URL}/lca/createLCA`,
  getAllLCAs: `${API_BASE_URL}/lca`,
  saveLCA: `${API_BASE_URL}/lca/save`,
  getLCAById: (lcaId) => `${API_BASE_URL}/lca/${lcaId}`,
  getLCAByEmployee: (employeeId) => `${API_BASE_URL}/lca/employee/${employeeId}`,
  deleteLCA: (lcaId) => `${API_BASE_URL}/lca/${lcaId}`,
  getAllVisas: `${API_BASE_URL}/visa/getAllVisas`,
  createVisa: `${API_BASE_URL}/visa/createVisa`,
  updateVisa: (visaId) => `${API_BASE_URL}/visa/${visaId}`,
  getVisaById: (visaId) => `${API_BASE_URL}/visa/${visaId}`,
  getAllEmployeesImmigration: `${API_BASE_URL}/immigration/getAllEmployeesImmigration`,
  // Passport endpoints
  getAllPassports: `${API_BASE_URL}/passport/getAllPassports`,
  createPassport: `${API_BASE_URL}/passport/createPassport`,
  updatePassport: (id) => `${API_BASE_URL}/passport/${id}`,
  getPassportById: (id) => `${API_BASE_URL}/passport/${id}`,
  getPassportsByEmployee: (employeeId) => `${API_BASE_URL}/passport/employee/${employeeId}`,
  deletePassport: (id) => `${API_BASE_URL}/passport/${id}`,
  employeesListByStatus: `${API_BASE_URL}/employees/employeesListByStatus`,
  addAdjustment: `${API_BASE_URL}/adjustment/addAdjustment`,
  findAdjustmentsByEmployeeId: `${API_BASE_URL}/adjustment/findAdjustmentsByEmployeeId`,
  saveWage: `${API_BASE_URL}/wages/wage`,
  createPotentialEmployee: `${API_BASE_URL}/visa/potentialEmployees`,
  activeProjects: (endDate, selectedDate) => `${API_BASE_URL}/activeProjects?endDate=${endDate}&selectedDate=${selectedDate}`,
  activeProjectsForInvoiceByEmployee: (employeeId) => `${API_BASE_URL}/activeProjectsForInvoiceByEmployee?employeeId=${employeeId}`,
};

export const employeeTypeOptions = [
  { value: "W2", label: "W2" },
  { value: "1099", label: "1099" },
  { value: "C2C", label: "C2C" },
];

export const companyList = [
  { value: "Intellan Technologies LLC", label: "Intellan Technologies LLC" },
  { value: "Code9 LLC", label: "Code9 LLC" },
  { value: "Referral", label: "Referral" },
];

export const departmentList = [
  { value: "Intellan Technologies LLC", label: "Intellan Technologies LLC" },
  { value: "Code9 LLC", label: "Code9 LLC" },
  { value: "Referral", label: "Referral" },
];

export const projectStatus = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Hold", label: "Hold" },
  { value: "OnBoarding", label: "On-Boarding" },
];

// Backwards-compatible alias
export const projectEmployeeOnboardingStatus = projectStatus;

export default API_ENDPOINTS;
