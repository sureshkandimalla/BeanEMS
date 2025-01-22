import React from "react";
import { Layout, Row, Col } from "antd";
import Header from "../Header/Header";
import LeftTabs from "../LeftTabs/LeftTabs";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout>
      <Header />
      <Layout>
        <Row>
          <Col span={2}>
            <LeftTabs />
          </Col>
          <Col span={22}>
            <Layout
              style={{
                padding: "10px 24px 10px 0px",
              }}
            >
              <Content
                style={{
                  padding: 0,
                  margin: 0,
                  minHeight: 280,
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
