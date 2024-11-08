import React, {useState} from 'react';
import { ProfileOutlined, UserOutlined, UsergroupAddOutlined,BlockOutlined,BoxPlotOutlined,HistoryOutlined,FileTextOutlined,SettingOutlined , MenuFoldOutlined,
  MenuUnfoldOutlined,ProjectOutlined} from '@ant-design/icons';
  import {  Menu } from 'antd';
import ProjectDashboard from '../Project/ProjectDashboard';
function getItem(tabName, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label: (
      <a href={key}>
        {tabName}
      </a>
    ),
    type,
  };
}
//Left Tab names
const leftTabNames = [
  getItem('Dashboard', 'dashboard', <ProfileOutlined />),
  getItem('Work Force', 'workforce', <UserOutlined />),
  getItem('Employee Onboarding', 'employeeonboard', <UsergroupAddOutlined />),
  getItem('Vendor', 'vendordetails', <BlockOutlined />),
  getItem('Invoice', 'invoicedetails', <FileTextOutlined />),
  getItem('Projects', 'projects', <ProjectOutlined  />),
  getItem('Option 6', '6', <HistoryOutlined />),
  getItem('Option 8', '8', <SettingOutlined />),
  
];
const LeftTabs = () => {
  const [collapsed, setCollapsed] = useState(true);
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
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{
              height: '100%',
              borderRight: 0,
            }}
            inlineCollapsed={collapsed}
            items={leftTabNames}
          />
        
      </>
    );
}
export default LeftTabs;
