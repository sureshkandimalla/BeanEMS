import React, { useState, useMemo } from "react";
import { Tabs, Card,Typography,Collapse, Row, Col, Button, Drawer, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import Newemployee from "../Newemployee/Newemployee";
import WorkForceList from "./WorkForceList";
import WorkForceReconcileList from "./WorkForceReconcileList"
import PieCharts from "../PieCharts/PieCharts";
import "../WorkForce/WorkForce.css"
import API_ENDPOINTS from "../config";

const fetchEmployees = async () => {  
  const response = await fetch(API_ENDPOINTS.getAllEmployees);
  return response.json();
};
const fetchReconcileRecords = async () => {
  const response = await fetch(API_ENDPOINTS.reconcileRecords);
  return response.json();
};

const fetchWorkforceChartData = async () => {
  const response = await fetch(API_ENDPOINTS.employeesCountByStatus);
  return response.json();
};

const fetchInvoicesChartData = async () => {
  const response = await fetch(API_ENDPOINTS.invoicesCountByStatus);
  return response.json();
};

const { Panel } = Collapse;

const WorkForceContent = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
 const pageSize = 10;

  const {
    data: reconcileData,
    isLoading: isreconcileDatasLoading,
    error: reconcileDataError,
  } = useQuery({
    queryKey: ["reconcileData"],
    queryFn: fetchReconcileRecords,
     staleTime: 5 * 60 * 1000,
     cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const {
    data: employeeData,
    isLoading: isEmployeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: workforceChartData,
    isLoading: isWorkforceLoading,
    error: workforceError,
  } = useQuery({
    queryKey: ["workforceChartData"],
    queryFn: fetchWorkforceChartData,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: invoicesChartData,
    isLoading: isInvoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoicesChartData"],
    queryFn: fetchInvoicesChartData,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleCollapseChange = () => {
    setIsCollapsed((prev) => !prev);
  };

  const processedData = useMemo(() => {
    if (!Array.isArray(employeeData)) {
      return {
        all: [],
        usa: [],
        india: [],
        active: [],
        onboarding: [],
        approved: [],
        terminated: [],
        billable: [],
        fulltime: [],
        corpData: [],
      };
    }
    return {
      all: employeeData,
      usa: employeeData.filter(({ workCountry }) => workCountry === "USA"),
      india: employeeData.filter(({ workCountry }) => workCountry === "India"),
      active: employeeData.filter(({ status }) => status === "Active"),
      onboarding: employeeData.filter(({ status }) => status === "Onboarding"),
      approved: employeeData.filter(({ status }) => status === "Approved"),
      terminated: employeeData.filter(({ status }) => status !== "Active"),
      billable: employeeData.filter(
        ({ resourceType }) => resourceType === "Billable",
      ),
      fulltime: employeeData.filter(({ employmentType }) =>
        ["W2", "Full-Time"].includes(employmentType),
      ),
      corpData: employeeData.filter(({ employmentType }) =>
        ["1099", "C2C"].includes(employmentType),
      ),
    };
  }, [employeeData]);

  const paginatedData = processedData.all
    ? processedData.all.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      )
    : [];

  const workforceChartLabels = Array.isArray(workforceChartData)
    ? workforceChartData.map((item) => item.status)
    : [];
  const workforceChartValues = Array.isArray(workforceChartData)
    ? workforceChartData.map((item) => item.count)
    : [];
  const invoicesChartLabels = Array.isArray(invoicesChartData)
    ? invoicesChartData.map((item) => item.status)
    : [];
  const invoicesChartValues = Array.isArray(invoicesChartData)
    ? invoicesChartData.map((item) => item.count)
    : [];

  const items = [
    {
      key: "0",
      label: "USA",
      children: <WorkForceList employees={processedData.usa} isCollapsed={isCollapsed}  />,
    },
    // { key: '1', label: 'USA', children: <WorkForceList employees={processedData.usa} /> },
    {
      key: "2",
      label: "India",
      children: <WorkForceList employees={processedData.india}  isCollapsed={isCollapsed} />,
    },
    {
      key: "3",
      label: "Billable Employees",
      children: <WorkForceList employees={processedData.billable} isCollapsed={isCollapsed}  />,
    },
    {
      key: "4",
      label: "Workforce",
      children: <WorkForceList employees={paginatedData}  isCollapsed={isCollapsed} />,
    },
    {
      key: "5",
      label: "Active Employees",
      children: <WorkForceList employees={processedData.active} isCollapsed={isCollapsed}  />,
    },
    {
      key: "6",
      label: "Onboarding",
      children: <WorkForceList employees={processedData.onboarding} isCollapsed={isCollapsed}  />,
    },
    {
      key: "7",
      label: "Fulltime",
      children: <WorkForceList employees={processedData.terminated} isCollapsed={isCollapsed} />,
    },
    {
      key: "8",
      label: "Corp to Corp",
      children: <WorkForceList employees={processedData.terminated} isCollapsed={isCollapsed} />,
    },
    {
      key: "9",
      label: "Terminated",
      children: <WorkForceList employees={processedData.terminated} isCollapsed={isCollapsed} />,
    },
    {
      key: "10",
      label: "Reconcile",
      children: <WorkForceReconcileList employees={Array.isArray(reconcileData) ? reconcileData : []} isCollapsed={isCollapsed} />,
    },
  ];

  const handleAddNewEmployee = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  if (employeesError || workforceError || invoicesError || reconcileDataError) {
    message.error("Error fetching data. Please try again later.");
  }

  return (
    <>
    {/* Drawer for Adding Employee */}
    <Drawer title="Employee Onboarding" placement="right" size="large" onClose={handleDrawerClose} open={open}>
        <Newemployee />
      </Drawer>

    <div style={{
          height: "100vh", // Full viewport height
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Prevents unwanted scroll
        }}>
      {/* Collapsible Section (Takes 30% Height) */}
<Collapse
  onChange={handleCollapseChange}
  style={{
    flex: isCollapsed ? "0 0 22%":"0 0 5%", /* Hide when collapsed */
    marginBottom: "10px",
    transition: "flex 0.3s ease-in-out", /* Smooth transition */
  }}
>
  <Panel header="Company Overview" key="1">
    <Row gutter={[16, 16]} justify="center">
      {/* Billing Card */}
      <Col xs={24} sm={8}>
        <Card className="billingCard">
          <Typography.Text className="invoiceCardTitle">Billing</Typography.Text>
          {isInvoicesLoading ? <Spin /> : <PieCharts chartData={invoicesChartValues} chartLabels={invoicesChartLabels} />}
        </Card>
      </Col>

      {/* Workforce Status Card */}
      <Col xs={24} sm={8}>
        <Card className="totalworkForceCard1" style={{ height: 370, minHeight: 370, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              {isWorkforceLoading ? <Spin /> : <PieCharts chartData={workforceChartValues} chartLabels={workforceChartLabels} />}
            </div>
            <div style={{ marginLeft: 40, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
              <Typography.Text className="invoiceCardTitle" style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Workforce Status</Typography.Text>
              {workforceChartLabels.map((label, idx) => (
                <div key={label} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#E9A94B", display: "inline-block", marginRight: 10 }}></span>
                  <span style={{ fontSize: 18 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Col>

      {/* Invoice Status Card */}
      <Col xs={24} sm={8}>
        <Card className="invoiceStatusCard1" style={{ height: 370, minHeight: 370, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              {isInvoicesLoading ? <Spin /> : <PieCharts chartData={invoicesChartValues} chartLabels={invoicesChartLabels} />}
            </div>
            <div style={{ marginLeft: 40, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
              <Typography.Text className="invoiceCardTitle" style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Invoice Status</Typography.Text>
              {invoicesChartLabels.map((label, idx) => (
                <div key={label} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#E9A94B", display: "inline-block", marginRight: 10 }}></span>
                  <span style={{ fontSize: 18 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </Panel>
</Collapse>


<div className={`workforce-c ${isCollapsed ? "expanded" : "collapsed"}`}>
  <Card className="employeeTableCard" style={{ height: "100%" }}>
    <Tabs
      className="bean-home-tabs"
      defaultActiveKey="1"
      items={items}
      tabBarExtraContent={
        <Button type="primary" onClick={handleAddNewEmployee}>
        <PlusOutlined /> Add New Employee
      </Button>
      }
    />
  </Card>
</div>

    </div>
  </>
  );
};

const WorkForce = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => queryClient.resumePausedMutations()}
    >
      <WorkForceContent />
    </PersistQueryClientProvider>
  );
};

export default WorkForce;
