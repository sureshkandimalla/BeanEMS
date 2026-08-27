// Standard filename for a Purchase Order upload, wherever it's uploaded
// from (Add New Project, Create New Work Order): PO_<employee>_<customer>_
// <workOrderStartDate>_<workOrderEndDate>.<original extension>. Renaming
// (rather than keeping whatever the user picked) is what lets anyone
// scanning the S3 bucket or a downloads folder tell POs apart at a glance.
const safe = (value) =>
  String(value || "Unknown").trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "");

export const buildPoFileName = ({ employeeName, customerName, startDate, endDate, originalFileName }) => {
  const extMatch = /\.[^.]+$/.exec(originalFileName || "");
  const ext = extMatch ? extMatch[0] : "";
  return `PO_${safe(employeeName)}_${safe(customerName)}_${safe(startDate)}_${safe(endDate)}${ext}`;
};
