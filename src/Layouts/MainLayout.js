import React from "react";
import { Layout, Row, Col } from "antd";
import Header from "../Header/Header";
import LeftTabs from "../LeftTabs/LeftTabs";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const MainLayout = () => {
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
                  overflowX: "hidden",
                }}
              >
                <Outlet />
              </Content>
            </Layout>
          </Col>
        </Row>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
