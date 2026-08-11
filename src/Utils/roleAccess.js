export const ROLES = {
  ADMIN: "ADMIN",
  IMMIGRATION: "IMMIGRATION",
  HR: "HR",
  ACCOUNTING: "ACCOUNTING",
};

// path -> roles allowed to see it, besides ADMIN (which can always access
// everything). Paths not listed here are treated as accessible to any
// authenticated (role-assigned) user — keeps shared/utility routes like
// /generateInvoice, reached from multiple entry points, from being
// accidentally locked out by an omission.
export const ROUTE_ROLES = {
  "/workforce": [ROLES.HR],
  "/employeeonboard": [ROLES.HR],
  "/potentialEmployees": [ROLES.HR],
  "/employeeFullDetails": [ROLES.HR, ROLES.IMMIGRATION],
  "/employeeDetailDashboard": [ROLES.HR],
  "/healthinsurance": [ROLES.HR],
  "/ProjectOnBoardingForm": [ROLES.HR],

  "/visaEmployees": [ROLES.IMMIGRATION],
  "/lcaDetails": [ROLES.IMMIGRATION],
  "/visaDetails": [ROLES.IMMIGRATION],

  "/customerdetails": [ROLES.ACCOUNTING],
  "/vendordetails": [ROLES.ACCOUNTING],
  "/invoicedetails": [ROLES.ACCOUNTING],
  "/expensedetails": [ROLES.ACCOUNTING],
  "/companyreport": [ROLES.ACCOUNTING],
  "/payrollsummary": [ROLES.ACCOUNTING],
  "/payrolleligibility": [ROLES.ACCOUNTING],
  "/timesheets": [ROLES.ACCOUNTING],
  "/monthlytimesheets": [ROLES.ACCOUNTING],
  "/hoursreport": [ROLES.ACCOUNTING],
  "/projects": [ROLES.ACCOUNTING],
  "/projectFullDetails": [ROLES.ACCOUNTING],
  "/generateInvoice": [ROLES.ACCOUNTING],
  "/adjustmentDetails": [ROLES.ACCOUNTING],

  "/masterdataload": [], // Admin only
  "/userAccess": [], // Admin only
};

export function canAccess(userRole, path) {
  if (!userRole) return false; // no role assigned yet = no access
  if (userRole === ROLES.ADMIN) return true;
  const allowed = ROUTE_ROLES[path];
  return !allowed || allowed.includes(userRole);
}
