import React, { useContext, useState } from "react";
import {
  HomeOutlined,
  ProfileOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  BlockOutlined,
  ShopOutlined,
  BoxPlotOutlined,
  HistoryOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  DollarOutlined,
  BankOutlined,
  AuditOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import ProjectDashboard from "../Project/ProjectDashboard";
import AuthContext from "../Authentication/Context/AuthContext";
import { canAccess } from "../Utils/roleAccess";
import "./LeftTabs.css";

function getItem(tabName, key, icon, iconClass, children, type) {
  return {
    key,
    icon: <span className={`left-tab-icon ${iconClass}`}>{icon}</span>,
    children,
    label: <Link to={key}>{tabName}</Link>,
    type,
  };
}
//Left Tab names
const leftTabNames = [
  getItem("Home", "/home", <HomeOutlined />, "icon-home"),
  getItem("Dashboard", "/dashboard", <ProfileOutlined />, "icon-dashboard"),
  getItem("Team", "/workforce", <UserOutlined />, "icon-team"),
  getItem("Customer", "/customerdetails", <BlockOutlined />, "icon-customer"),
  getItem("Vendor", "/vendordetails", <ShopOutlined />, "icon-vendor"),
  getItem("Invoice", "/invoicedetails", <FileTextOutlined />, "icon-invoice"),
  getItem("Expenses", "/expensedetails", <DollarOutlined />, "icon-expenses"),
  getItem("Projects", "/projects", <ProjectOutlined />, "icon-projects"),
  getItem("Potential Employees", "/potentialEmployees", <UserOutlined />, "icon-potential"),
  getItem("Visa Employees", "/visaEmployees", <UsergroupAddOutlined />, "icon-visa"),
  getItem("LCA Details", "/lcaDetails", <FileTextOutlined />, "icon-lca"),
  getItem("Visa Details", "/visaDetails", <FileTextOutlined />, "icon-visadetails"),
  getItem("Payroll Summary", "/payrollsummary", <BoxPlotOutlined />, "icon-payroll"),
  getItem("Payroll Eligibility", "/payrolleligibility", <AuditOutlined />, "icon-eligibility"),
  getItem("Health Insurance", "/healthinsurance", <MedicineBoxOutlined />, "icon-insurance"),
  getItem("Time", "/timesheets", <ClockCircleOutlined />, "icon-time"),
  getItem("Monthly Timesheets", "/monthlytimesheets", <ClockCircleOutlined />, "icon-monthlytime"),
  getItem("Hours Report", "/hoursreport", <FileSearchOutlined />, "icon-hoursreport"),
  getItem("Company Report", "/companyreport", <BankOutlined />, "icon-report"),
  getItem("Master Data Load", "/masterdataload", <CloudUploadOutlined />, "icon-masterdata"),
  getItem("User Access", "/userAccess", <SafetyCertificateOutlined />, "icon-useraccess"),
];
const LeftTabs = () => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const visibleTabs = leftTabNames.filter((item) => canAccess(user?.role, item.key));
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  return (
    <>
      {/*un comment this for toggle menu  */}
      {/* <Button
        type="primary"
        onClick={toggleCollapsed}
        style={{
          marginBottom: 16,
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button> */}
      <Menu
        className="bean-left-nav"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{
          height: "100%",
          borderRight: 0,
          overflowY: "auto",
          overflowX: "hidden",
        }}
        inlineCollapsed={collapsed}
        items={visibleTabs}
      />
    </>
  );
};
export default LeftTabs;
