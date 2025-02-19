import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Layout, Col, Row } from "antd";
import Header from "./Header/Header";
import LeftTabs from "./LeftTabs/LeftTabs";
import Dashboard from "./Dashboard/Dashboard";
import WorkForce from "./WorkForce/WorkForce";
import EmployeeOnboard from "./EmployeeOnboard/EmployeeOnboard";
import VendorDetails from "./Vendor/VendorDetails";
import InvoiceDetails from "./Invoice/InvoiceDetails";
import EmployeeFullDetailsComponent from "./EmployeeDetailsComponent/EmployeeFullDetailsComponent";
import EmployeeDetailDashboard from "./EmployeeDetailDashboard/EmployeeDetailDashboard";
import ProjectDashboard from "./Project/ProjectDashboard";
import ProjectOnBoardingForm from "./OnBoardingComponent/ProjectOnBoarding";
import ProjectFullDetails from "./Project/ProjectFullDetails";
import GenerateInvoiceDetails from "./Invoice/GenerateInvoiceDetails";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./Authentication/Context/AuthContext";
import Login from "./Authentication/pages/Login";
import ProtectedRoute from "./Authentication/routes/ProtectedRoute";
import AuthLayout from "./Layouts/AuthLayout";
import MainLayout from "./Layouts/MainLayout";
import PotentialEmployees from "./PotentialEmployees/PotentialEmployees";

//const clientId = '206630439236-q0q2np2g72vf5rgodjk4hhv814i3q7ai.apps.googleusercontent.com';
const clientId = '357155611063-pdrk7703502da9f33osc2t28jueof67j.apps.googleusercontent.com';
const { Content } = Layout;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Authentication Layout (No Header, No Sidebar) */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Login />} />
            </Route>
            {/* Main Application Layout (Protected) */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/workforce" element={<WorkForce />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employeeonboard" element={<EmployeeOnboard />} />
              <Route path="/vendordetails" element={<VendorDetails />} />
              <Route path="/invoicedetails" element={<InvoiceDetails />} />
              <Route
                path="/employeeFullDetails"
                element={<EmployeeFullDetailsComponent />}
              />
              <Route
                path="/employeeDetailDashboard"
                element={<EmployeeDetailDashboard />}
              />
              <Route
                path="/ProjectOnBoardingForm"
                element={<ProjectOnBoardingForm />}
              />
              <Route path="/projects" element={<ProjectDashboard />} />
              <Route
                path="/projectFullDetails"
                element={<ProjectFullDetails />}
              />
              <Route
                path="/generateInvoice"
                element={<GenerateInvoiceDetails />}
              />
               <Route
                path="/potentialEmployees"
                element={<PotentialEmployees />}
              />

              {/* Redirect unknown routes to Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
