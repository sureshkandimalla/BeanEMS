import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import axios from 'axios';


export default function ReconciliationDetails({employeeId}) {
  const [rowData, setRowData] = useState([]);  

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!isInitialRender.current) {
        fetchData();
    } else {
        isInitialRender.current = false;
    }
  }, []);

  const fetchData = () => {
    axios.get(`http://localhost:8080/api/v1/activeProjectsForInvoiceByEmployee?employeeId=${employeeId}`, {
      params: {
       // selectedDate: '2023-11-01',//formattedDate,
        //status: 'viewAll'
      }
    })
      .then(response => {
        console.log(response.data);
        setRowData(getFlattenedData(response.data));
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
        //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
        return { ...dataObj }
    });
    return updatedData || [];
}

  const columnDefs = [
    {
      field: "description",
      headerName: "Description",
      cellRenderer: "agGroupCellRenderer",
    },
    { field: "hours", headerName: "Hours" },
    { field: "projectBilling", headerName: "Project Billing" },
    { field: "wage", headerName: "Wage" },
    { field: "income", headerName: "Income" },
    { field: "expense", headerName: "Expense" },
    { field: "invoiceTotal", headerName: "Invoice Total" },
    { field: "invoicePaidAmount", headerName: "Invoice Paid Amount" },
    { field: "startDate", headerName: "Start Date" },
    { field: "endDate", headerName: "End Date" },
  ];

  const detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: "description", headerName: "Expense Description" },
        { field: "hours", headerName: "Hours" },
        { field: "expenseType", headerName: "Expense Type" },
        { field: "wage", headerName: "Wage" },
        { field: "total", headerName: "Total Expense" },
        { field: "employeeId", headerName: "Employee ID" },
        { field: "startDate", headerName: "Start Date" },
        { field: "endDate", headerName: "End Date" },
        { field: "status", headerName: "Status" },
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
