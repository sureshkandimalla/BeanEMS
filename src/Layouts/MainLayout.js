import React, { useContext } from "react";
import { Layout, Row, Col } from "antd";
import Header from "../Header/Header";
import LeftTabs from "../LeftTabs/LeftTabs";
import { Outlet, useLocation } from "react-router-dom";
import AuthContext from "../Authentication/Context/AuthContext";
import AccessDenied from "../Authentication/pages/AccessDenied";
import { canAccess } from "../Utils/roleAccess";

const { Content } = Layout;

const MainLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const allowed = canAccess(user?.role, location.pathname);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header />
      <Layout style={{ flex: 1, overflow: "hidden" }}>
        <Row style={{ height: "100%", flexWrap: "nowrap" }}>
          <Col span={2} style={{ height: "100%", overflow: "hidden" }}>
            <LeftTabs />
          </Col>
          <Col span={22} style={{ height: "100%", overflow: "hidden" }}>
            <Layout
              style={{
                padding: "10px 24px 10px 0px",
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
    </Layout>
  );
};

export default MainLayout;
