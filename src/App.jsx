import React,{useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout, Menu ,Button,Col, Row,Dropdown,Space,Flex} from 'antd';
import Header from './Header/Header';
import LeftTabs from './LeftTabs/LeftTabs';
import Dashboard from './Dashboard/Dashboard';
import WorkForce from './WorkForce/WorkForce';
import EmployeeOnboard from './EmployeeOnboard/EmployeeOnboard';
import VendorDetails from './Vendor/VendorDetails';
import InvoiceDetails from './Invoice/InvoiceDetails';
import EmployeeFullDetailsComponent from './EmployeeDetailsComponent/EmployeeFullDetailsComponent';
import EmployeeDetailDashboard from './EmployeeDetailDashboard/EmployeeDetailDashboard';
import ProjectDashboard from './Project/ProjectDashboard';
import ProjectOnBoardingForm from './OnBoardingComponent/ProjectOnBoarding';




const {Content } = Layout;

const App = () => {
  return (
    <Router>
    <Layout>
<Header/>
      <Layout>
      <Row>
      <Col span={2}>
        <LeftTabs/>
      </Col>
          <Col span={22}>
        <Layout
          style={{
            padding: '10px 24px 10px 0px',
          }}
        >
          <Content
            style={{
              padding: 0,
              margin: 0,
              minHeight: 280
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workforce" element={<WorkForce />} />
              <Route path="/employeeonboard" element={<EmployeeOnboard />} />
              <Route path="/vendordetails" element={<VendorDetails />} />
              <Route path="/invoicedetails" element={<InvoiceDetails />} />
              <Route path="/employeeFullDetails" element={<EmployeeFullDetailsComponent />} />
              <Route path="/employeeDetailDashboard" element={<EmployeeDetailDashboard />} />
              <Route path="/ProjectOnBoardingForm" element={<ProjectOnBoardingForm />} />
              <Route path="/projects" element={<ProjectDashboard />} />
              {/* Add more routes here */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
        </Col>
        </Row>
      </Layout>
    </Layout>
    </Router>
  );
};
export default App;