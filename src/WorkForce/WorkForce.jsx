import React, { useState, useMemo } from "react";
import { Tabs, Card, Collapse, Row, Col, Button, Drawer, Spin, message, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import Newemployee from "../Newemployee/Newemployee";
import WorkForceList from "./WorkForceList";
import WorkForceReconcileList from "./WorkForceReconcileList"
import PieCharts, { getPieColors } from "../PieCharts/PieCharts";
import PieLegend from "../PieCharts/PieLegend";
import { useChartOverview, ChartSettingsIcon } from "../Utils/ChartOverviewPanel";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNewHires, setShowNewHires] = useState(false);

  const {
    data: reconcileData,
    isLoading: isreconcileDatasLoading,
    error: reconcileDataError,
    refetch: refetchReconcileData,
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
    refetch: refetchEmployees,
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
    const visibleEmployees = showNewHires
      ? employeeData
      : employeeData.filter(({ status }) => status !== "NewHires");

    return {
      all: visibleEmployees,
      usa: visibleEmployees.filter(({ workCountry }) => ["USA", "US"].includes((workCountry || "").toUpperCase())),
      india: visibleEmployees.filter(({ workCountry }) => ["INDIA", "IN"].includes((workCountry || "").toUpperCase())),
      active: visibleEmployees.filter(({ status }) => status === "Active"),
      onboarding: visibleEmployees.filter(({ status }) => status === "Onboarding"),
      approved: visibleEmployees.filter(({ status }) => status === "Approved"),
      terminated: visibleEmployees.filter(({ status }) => status !== "Active"),
      billable: visibleEmployees.filter(
        ({ resourceType }) => resourceType === "Billable",
      ),
      fulltime: visibleEmployees.filter(({ employmentType }) =>
        ["W2", "Full-Time"].includes(employmentType),
      ),
      corpData: visibleEmployees.filter(({ employmentType }) =>
        ["1099", "C2C"].includes(employmentType),
      ),
    };
  }, [employeeData, showNewHires]);

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

  // Same slice order/values feed both the donut (via PieCharts, legend
  // hidden) and the custom legend beside it, so colors always match.
  const workforceSlices = workforceChartLabels.map((label, i) => ({
    label,
    value: workforceChartValues[i] || 0,
    color: getPieColors(workforceChartLabels.length)[i],
  }));
  const invoicesSlices = invoicesChartLabels.map((label, i) => ({
    label,
    value: invoicesChartValues[i] || 0,
    color: getPieColors(invoicesChartLabels.length)[i],
  }));

  // Chart definitions for the Company Overview area — useChartOverview
  // handles show/hide, drag-to-reorder, drag-to-resize, and PNG download
  // generically from this list.
  const companyOverviewCharts = [
    {
      key: "billing",
      label: "Billing",
      filename: "billing",
      defaultSize: { width: 480, height: 370 },
      render: (innerHeight, setChartRef) =>
        isInvoicesLoading ? (
          <Spin />
        ) : (
          <Row align="middle">
            <Col span={14}>
              <div style={{ width: "100%", height: innerHeight }}>
                <PieCharts ref={setChartRef} chartData={invoicesChartValues} chartLabels={invoicesChartLabels} showLegend={false} />
              </div>
            </Col>
            <Col span={10}>
              <PieLegend slices={invoicesSlices} />
            </Col>
          </Row>
        ),
    },
    {
      key: "workforceStatus",
      label: "Workforce Status",
      filename: "workforce-status",
      defaultSize: { width: 480, height: 370 },
      render: (innerHeight, setChartRef) =>
        isWorkforceLoading ? (
          <Spin />
        ) : (
          <Row align="middle">
            <Col span={14}>
              <div style={{ width: "100%", height: innerHeight }}>
                <PieCharts ref={setChartRef} chartData={workforceChartValues} chartLabels={workforceChartLabels} showLegend={false} />
              </div>
            </Col>
            <Col span={10}>
              <PieLegend slices={workforceSlices} fontSize={18} />
            </Col>
          </Row>
        ),
    },
    {
      key: "invoiceStatus",
      label: "Invoice Status",
      filename: "invoice-status",
      defaultSize: { width: 480, height: 370 },
      render: (innerHeight, setChartRef) =>
        isInvoicesLoading ? (
          <Spin />
        ) : (
          <Row align="middle">
            <Col span={14}>
              <div style={{ width: "100%", height: innerHeight }}>
                <PieCharts ref={setChartRef} chartData={invoicesChartValues} chartLabels={invoicesChartLabels} showLegend={false} />
              </div>
            </Col>
            <Col span={10}>
              <PieLegend slices={invoicesSlices} fontSize={18} />
            </Col>
          </Row>
        ),
    },
  ];
  const { settingsContent, contentNode } = useChartOverview(companyOverviewCharts);

  const items = [
    {
      key: "0",
      label: "USA",
      children: <WorkForceList employees={processedData.usa} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    // { key: '1', label: 'USA', children: <WorkForceList employees={processedData.usa} /> },
    {
      key: "2",
      label: "India",
      children: <WorkForceList employees={processedData.india} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "3",
      label: "Billable Employees",
      children: <WorkForceList employees={processedData.billable} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "4",
      label: "Workforce",
      children: <WorkForceList employees={processedData.all} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "5",
      label: "Active Employees",
      children: <WorkForceList employees={processedData.active} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "6",
      label: "Onboarding",
      children: <WorkForceList employees={processedData.onboarding} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "7",
      label: "Fulltime",
      children: <WorkForceList employees={processedData.terminated} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "8",
      label: "Corp to Corp",
      children: <WorkForceList employees={processedData.terminated} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "9",
      label: "Terminated",
      children: <WorkForceList employees={processedData.terminated} isCollapsed={isCollapsed} onRefresh={refetchEmployees} />,
    },
    {
      key: "10",
      label: "Reconcile",
      children: <WorkForceReconcileList employees={Array.isArray(reconcileData) ? reconcileData : []} isCollapsed={isCollapsed} onRefresh={refetchReconcileData} />,
    },
  ];

  const handleAddNewEmployee = () => setOpen(true);
  const handleDrawerClose = (action) => {
    setOpen(false);
    if (action === "submit") refetchEmployees();
  };

  if (employeesError || workforceError || invoicesError || reconcileDataError) {
    message.error("Error fetching data. Please try again later.");
  }

  return (
    <>
    {/* Drawer for Adding Employee */}
    <Drawer title="Employee Onboarding" placement="right" size="large" onClose={handleDrawerClose} open={open}>
        <Newemployee onClose={handleDrawerClose} />
      </Drawer>

    <div style={{
          height: "100%",
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
  <Panel
    header="Company Overview"
    key="1"
    extra={
      <div onClick={(e) => e.stopPropagation()}>
        <ChartSettingsIcon settingsContent={settingsContent} />
      </div>
    }
  >
    {contentNode}
  </Panel>
</Collapse>


<div className={`workforce-c ${isCollapsed ? "expanded" : "collapsed"}`}>
  <Card className="employeeTableCard" style={{ height: "100%" }}>
    <Tabs
      className="bean-home-tabs"
      defaultActiveKey="4"
      items={items}
      tabBarExtraContent={
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Checkbox
            checked={showNewHires}
            onChange={(e) => setShowNewHires(e.target.checked)}
          >
            Show New Hires
          </Checkbox>
          <Button type="primary" onClick={handleAddNewEmployee}>
            <PlusOutlined /> Add New Employee
          </Button>
        </span>
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
