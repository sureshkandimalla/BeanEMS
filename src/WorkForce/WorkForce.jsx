import React, { useState, useMemo } from "react";
import { Tabs, Card, Row, Col, Button, Drawer, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import Newemployee from "../Newemployee/Newemployee";
import WorkForceList from "./WorkForceList";
import PieCharts from "../PieCharts/PieCharts";

// Utility functions for API calls
const fetchEmployees = async () => {
  const response = await fetch(
    "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/employees/getAllEmployees",
  );
  return response.json();
};

const fetchWorkforceChartData = async () => {
  const response = await fetch(
    "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/employees/employeesCountByStatus",
  );
  return response.json();
};

const fetchInvoicesChartData = async () => {
  const response = await fetch(
    "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/invoice/invoicesCountByStatus",
  );
  return response.json();
};

const WorkForceContent = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: employeeData,
    isLoading: isEmployeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    // staleTime: 5 * 60 * 1000,
    // cacheTime: 10 * 60 * 1000,
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

  const processedData = useMemo(() => {
    if (!employeeData) return {};
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

  const workforceChartLabels =
    workforceChartData?.map((item) => item.status) || [];
  const workforceChartValues =
    workforceChartData?.map((item) => item.count) || [];
  const invoicesChartLabels =
    invoicesChartData?.map((item) => item.status) || [];
  const invoicesChartValues =
    invoicesChartData?.map((item) => item.count) || [];

  const items = [
    {
      key: "0",
      label: "USA",
      children: <WorkForceList employees={processedData.usa} />,
    },
    // { key: '1', label: 'USA', children: <WorkForceList employees={processedData.usa} /> },
    {
      key: "2",
      label: "India",
      children: <WorkForceList employees={processedData.india} />,
    },
    {
      key: "3",
      label: "Billable Employees",
      children: <WorkForceList employees={processedData.billable} />,
    },
    {
      key: "4",
      label: "Workforce",
      children: <WorkForceList employees={paginatedData} />,
    },
    {
      key: "5",
      label: "Active Employees",
      children: <WorkForceList employees={processedData.active} />,
    },
    {
      key: "6",
      label: "Onboarding",
      children: <WorkForceList employees={processedData.onboarding} />,
    },
    {
      key: "7",
      label: "Fulltime",
      children: <WorkForceList employees={processedData.terminated} />,
    },
    {
      key: "8",
      label: "Corp to Corp",
      children: <WorkForceList employees={processedData.terminated} />,
    },
    {
      key: "9",
      label: "Terminated",
      children: <WorkForceList employees={processedData.terminated} />,
    },
  ];

  const handleAddNewEmployee = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  if (employeesError || workforceError || invoicesError) {
    message.error("Error fetching data. Please try again later.");
  }

  return (
    <>
      <Drawer
        title="Employee Onboarding"
        placement="right"
        size="large"
        onClose={handleDrawerClose}
        open={open}
      >
        <Newemployee />
      </Drawer>

      <Row gutter={[16, 16]} justify="center">
      <Col xs={24} sm={24} md={8} lg={8}>
        <Card className="billingCard">
          <span className="invoiceCardTitle">Billing</span>
          {isInvoicesLoading ? (
            <Spin />
          ) : (
            <PieCharts chartData={invoicesChartValues} chartLabels={invoicesChartLabels} />
          )}
        </Card>
      </Col>
      
      <Col xs={24} sm={24} md={8} lg={8}>
        <Card className="totalworkForceCard1">
          <span className="invoiceCardTitle">Workforce Status</span> {/* Ensure title is consistent */}
          {isWorkforceLoading ? (
            <Spin />
          ) : (
            <PieCharts chartData={workforceChartValues} chartLabels={workforceChartLabels} />
          )}
        </Card>
      </Col>

      <Col xs={24} sm={24} md={8} lg={8}>
        <Card className="invoiceStatusCard1">
          <span className="invoiceCardTitle">Invoice Status</span>
          {isInvoicesLoading ? (
            <Spin />
          ) : (
            <PieCharts chartData={invoicesChartValues} chartLabels={invoicesChartLabels} />
          )}
        </Card>
      </Col>
    </Row>

      {isEmployeesLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "top",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Card>
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
      )}
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
