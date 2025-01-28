import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import axios from "axios";
import { formatCurrency } from "../Utils/CurrencyFormatter";

export default function ReconciliationDetails({ employeeId }) {
  const [rowData, setRowData] = useState([]);

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      fetchData();
    } else {
      isInitialRender.current = false;
    }
  }, []);

  const fetchData = () => {
    axios
      .get(
        `http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/reconcile/getReconcileRecords/${employeeId}`,
        {
          params: {
            // selectedDate: '2023-11-01',//formattedDate,
            //status: 'viewAll'
          },
        },
      )
      .then((response) => {
        console.log(response.data);
        setRowData(getFlattenedData(response.data));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
      //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
      return { ...dataObj };
    });
    return updatedData || [];
  };

  const columnDefs = [
    {
      field: "description",
      headerName: "Description",
      cellRenderer: "agGroupCellRenderer",
    },
    { field: "hours", headerName: "Hours", filter: true },
    {
      field: "income",
      headerName: "Income",
      valueFormatter: (params) => formatCurrency(params.value),
      filter: true,
    },
    {
      field: "expense",
      headerName: "Expense",
      valueFormatter: (params) => formatCurrency(params.value),
      filter: true,
    },
    {
      field: "invoiceTotal",
      headerName: "Invoice Total",
      valueFormatter: (params) => formatCurrency(params.value),
      filter: true,
    },
    {
      field: "invoicePaidAmount",
      headerName: "Invoice Paid Amount",
      valueFormatter: (params) => formatCurrency(params.value),
      filter: true,
    },
    {
      field: "projectBilling",
      headerName: "Project Billing",
      filter: true,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "wage",
      headerName: "Wage",
      valueFormatter: (params) => formatCurrency(params.value),
      filter: true,
    },
    
    { field: "startDate", headerName: "Start Date", filter: true },
    { field: "endDate", headerName: "End Date", filter: true },
  ];

  const detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        {
          field: "description",
          headerName: "Expense Description",
          filter: true,
        },
        { field: "hours", headerName: "Hours", filter: true },
        {
          field: "wage",
          headerName: "Wage",
          valueFormatter: (params) => formatCurrency(params.value),
          filter: true,
        },
        {
          field: "total",
          headerName: "Total Expense",
          valueFormatter: (params) => formatCurrency(params.value),
          filter: true,
        },
        { field: "expenseType", headerName: "Expense Type", filter: true },
        { field: "startDate", headerName: "Start Date", filter: true },
        { field: "endDate", headerName: "End Date", filter: true },
      ],
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.expenseRecords);
    },
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        masterDetail={true}
        detailCellRendererParams={detailCellRendererParams}
        animateRows={true}
      />
    </div>
  );
}
