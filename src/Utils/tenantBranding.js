import beanLogo from "../bean-logo.png";
import intellanLogo from "../assets/intellan-logo.png";

// EmployeeHub serves multiple companies from one deployment (see
// AuthController's domain allowlist) — this is the one place their display
// name/logo differ; everything else in the app is shared.
export const TENANT_BRANDING = {
  bean: { name: "Bean Infosystems", logo: beanLogo },
  intellan: { name: "Intellan Technologies LLC", logo: intellanLogo },
};

export const getCurrentTenantBranding = () => {
  let tenant = null;
  try {
    tenant = JSON.parse(localStorage.getItem("user"))?.tenant || null;
  } catch {
    tenant = null;
  }
  return TENANT_BRANDING[tenant] || TENANT_BRANDING.intellan;
};
