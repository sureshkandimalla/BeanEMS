import React ,{useRef}from "react";
import { SearchOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CustomHeader from '../CustomHeader/CustomHeader';

const Active = ()=>{
    
  const gridApi = useRef(null);

  // Custom filter function for the search input
  const handleFilterChange = (value) => {
    gridApi.current.setQuickFilter(value);
  };
  const onChange = (e) => {
    console.log(`radio checked:${e.target.value}`);
  };
  // Grid column definitions
  const columnDefs = [
    {
      headerName: 'ID',
      field: 'id',
      sortable: true,
      filter: true
    },
    {
      headerName: 'Name',
      field: 'name',
      sortable: true,
      filter: true
    },
    {
      headerName: 'Position',
      field: 'position',
      sortable: true,
      filter: true
    },
    {
      headerName: 'Department',
      field: 'department',
      sortable: true,
      filter: true
    },
    {
      headerName: 'Employee Information',
      field: 'employeeInfo',
      sortable: true,
      filter: true,
      headerComponentFramework: CustomHeader // Custom header component
    }
  ];

  // Sample data for employees
  const employeeData = [
    { id: 1, name: 'John Doe', position: 'Software Engineer', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', position: 'Product Manager', department: 'Product' },
    { id: 3, name: 'Alice Johnson', position: 'UX Designer', department: 'Design' },
    { id: 4, name: 'Bob Brown', position: 'Data Scientist', department: 'Data Science' },
    { id: 5, name: 'Ella Davis', position: 'Marketing Specialist', department: 'Marketing' },
    // Add more sample data as needed
  ];
 return(
    <>
      <div className="ag-theme-alpine " style={{ height: '500px', width: '100%' }}>
      <AgGridReact
        rowData={employeeData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        onGridReady={(params) => (gridApi.current = params.api)}
      />
    </div>
  
    </>
 );
}
export default Active;