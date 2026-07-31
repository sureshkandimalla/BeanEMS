import React, { useContext } from "react";
import { UserOutlined, SettingOutlined, BellOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Row, Dropdown, Space, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Authentication/Context/AuthContext";
import { getCurrentTenantBranding } from "../Utils/tenantBranding";

const Header = () => {
  const { logout } = useContext(AuthContext); // Get logout function from context
  const navigate = useNavigate();
  const branding = getCurrentTenantBranding();

  // Define logout handler
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    localStorage.removeItem("user"); // Remove user data from localStorage (Optional)
  };

  // Define dropdown items
  const items = [
    {
      key: "1",
      label: JSON.parse(localStorage.getItem("user"))?.name || "User",
    },
    {
      key: "2",
      label: (
        <a href="javascript:void(0)" onClick={handleLogout}>
          Logout
        </a>
      ),
    },
  ];

  return (
    <>
      <div className="headerDiv">
        <Row justify="end" align="middle">
          <Col flex="400px">
            <div className="headerLogo">
              <img src={branding.logo} alt="logo" />
              <b>{branding.name}</b>
            </div>
          </Col>
          <Col flex="auto">
            <Flex gap="small" vertical align="end">
              <Flex gap="small" wrap="wrap">
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </Space>
                <Space>
                  <Dropdown menu={{ items }} placement="bottomRight">
                    <Button icon={<SettingOutlined />} />
                  </Dropdown>
                </Space>
                <Space>
                  <Button icon={<BellOutlined />} />
                </Space>
                <Space>
                  <Dropdown menu={{ items }} placement="bottomRight">
                    <Button icon={<UserOutlined />} />
                  </Dropdown>
                </Space>
              </Flex>
            </Flex>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Header;
