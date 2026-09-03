import React, { useContext } from "react";
import { UserOutlined, SettingOutlined, BellOutlined, ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import { Button, Col, Row, Dropdown, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Authentication/Context/AuthContext";
import { getCurrentTenantBranding } from "../Utils/tenantBranding";

// onMenuClick/showMenuButton are only passed on mobile widths (see
// MainLayout.js) — desktop renders exactly as before, no hamburger button
// in the DOM at all.
const Header = ({ onMenuClick, showMenuButton }) => {
  const { logout } = useContext(AuthContext); // Get logout function from context
  const navigate = useNavigate();
  const branding = getCurrentTenantBranding();

  // logout() itself clears the Google session, all app localStorage keys,
  // and does a hard redirect to "/" — nothing left to do here.
  const handleLogout = () => {
    logout();
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
        <Row justify="end" align="middle" wrap={false}>
          <Col flex="400px" className="header-logo-col">
            <Flex gap="small" align="center">
              {showMenuButton && (
                <Button
                  type="text"
                  className="header-menu-btn"
                  icon={<MenuOutlined />}
                  onClick={onMenuClick}
                  aria-label="Open navigation menu"
                />
              )}
              <div className="headerLogo">
                <img src={branding.logo} alt={branding.name} />
              </div>
            </Flex>
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <Flex gap="small" vertical align="end">
              <Flex gap="small" wrap="wrap" className="header-actions">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="header-back-btn">
                  <span className="header-back-btn-label">Back</span>
                </Button>
                <Dropdown menu={{ items }} placement="bottomRight">
                  <Button icon={<SettingOutlined />} />
                </Dropdown>
                <Button icon={<BellOutlined />} />
                <Dropdown menu={{ items }} placement="bottomRight">
                  <Button icon={<UserOutlined />} />
                </Dropdown>
              </Flex>
            </Flex>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Header;
