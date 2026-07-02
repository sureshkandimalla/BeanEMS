import React, { useState } from "react";
import {
  ProfileOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  BlockOutlined,
  BoxPlotOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import ProjectDashboard from "../Project/ProjectDashboard";
function getItem(tabName, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label: <Link to={key}>{tabName}</Link>,
    type,
  };
}
//Left Tab names
const leftTabNames = [
  getItem("Dashboard", "/dashboard", <ProfileOutlined />),
  getItem("Work Force", "/workforce", <UserOutlined />),
  getItem("Employee Onboarding", "/employeeonboard", <UsergroupAddOutlined />),
  getItem("Vendor", "/vendordetails", <BlockOutlined />),
  getItem("Invoice", "/invoicedetails", <FileTextOutlined />),
  getItem("Projects", "/projects", <ProjectOutlined />),
  getItem("Potential Employees", "/potentialEmployees", <UserOutlined />),
  getItem("Visa Employees", "/visaEmployees", <UsergroupAddOutlined />),
  getItem("Payroll Summary", "/payrollsummary", <BoxPlotOutlined />),
];
const LeftTabs = () => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
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
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{
          height: "100%",
          borderRight: 0,
        }}
        inlineCollapsed={collapsed}
        items={leftTabNames}
      />
    </>
  );
};
export default LeftTabs;
