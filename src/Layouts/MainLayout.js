import React, { useContext, useState } from "react";
import { Layout, Row, Col, Drawer, Grid } from "antd";
import Header from "../Header/Header";
import LeftTabs from "../LeftTabs/LeftTabs";
import MobileNav from "../LeftTabs/MobileNav";
import { Outlet, useLocation } from "react-router-dom";
import AuthContext from "../Authentication/Context/AuthContext";
import AccessDenied from "../Authentication/pages/AccessDenied";
import { canAccess } from "../Utils/roleAccess";

const { Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const allowed = canAccess(user?.role, location.pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // AntD's own responsive hook (md breakpoint = 768px) — below it the icon
  // rail (fixed 76px wide, see LeftTabs.css) doesn't fit, so it's replaced
  // by a hamburger-triggered Drawer instead of shrinking in place.
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header onMenuClick={() => setMobileNavOpen(true)} showMenuButton={isMobile} />
      <Layout style={{ flex: 1, overflow: "hidden" }}>
        <Row style={{ height: "100%", flexWrap: "nowrap" }}>
          {!isMobile && (
            // Fixed-pixel basis, not a percentage span — LeftTabs' own
            // rail is a fixed 76px, so sizing this column by percentage
            // let it go narrower than 76px (and get silently clipped by
            // this Col's own overflow:hidden) on anything under ~900px
            // wide. Pinning both sides to the same 76px keeps them in
            // sync at every width down to the mobile breakpoint above.
            <Col flex="0 0 76px" style={{ height: "100%", overflow: "hidden" }}>
              <LeftTabs />
            </Col>
          )}
          <Col flex="1 1 auto" style={{ height: "100%", overflow: "hidden", minWidth: 0 }}>
            <Layout
              style={{
                padding: isMobile ? "10px 12px" : "10px 24px 10px 0px",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Content
                style={{
                  padding: 0,
                  margin: 0,
                  height: "100%",
                  overflowY: "auto",
                  overflowX: "auto",
                }}
              >
                {allowed ? <Outlet /> : <AccessDenied />}
              </Content>
            </Layout>
          </Col>
        </Row>
      </Layout>

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          width={280}
          title="Menu"
          styles={{ body: { padding: 0 } }}
        >
          <MobileNav onNavigate={() => setMobileNavOpen(false)} />
        </Drawer>
      )}
    </Layout>
  );
};

export default MainLayout;
