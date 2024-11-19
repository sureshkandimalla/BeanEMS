import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button } from 'antd';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "./Invoice.css";
import NewInvoice from './NewInvoice';
import MonthlyTimesheetDialog from "../Project/TimeSheet/MonthlyTimeSheetModal";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {IconButton } from '@mui/material';
import EditHoursInvoiceModal from "./EditHoursInvoiceModel";
import { red } from "@mui/material/colors";
import './GenerateInvoiceDetails.css'




const GenerateInvoiceDetails = () => {
  const location = useLocation();
  const { selectedDate } = location.state || {};
  const [editingRow, setEditingRow] = useState(null); // Track currently editing ro
  const [searchText, setSearchText] = useState('');
  const [rowData, setRowData] = useState();
  const [editingRowData, setEditingRowData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invalidRows, setInvalidRows] = useState([]); // Track invalid rows
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);


//  const columnsList = ['Customer Id', 'Company Name', 'Email Id', 'Phone', 'Status', 'ein', 'Website','startDate','endDate' ];
  const isInitialRender = useRef(true);
  const formattedDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : null;
  const gridRef = useRef();

  useEffect(() => {
    if (!isInitialRender.current) {
        fetchData();
    } else {
        isInitialRender.current = false;
    }
  }, []);

  const fetchData = () => {
    //default status =viewAll
    const today = new Date();
    const endDate =  new Date().toISOString().split('T')[0];
    const encodedEndDate = encodeURIComponent(endDate);
    console.log(selectedDate);    
    const encodedFormatSelectedDate = encodeURIComponent(formattedDate);
    axios.get(`http://localhost:8080/api/v1/activeProjects?endDate=${encodedEndDate}&selectedDate=${encodedFormatSelectedDate}`, {
      params: {
       // selectedDate: '2023-11-01',//formattedDate,
        //status: 'viewAll'
      }
    })
      .then(response => {
        console.log(response.data);
        setLoading(false);
        setRowData(getFlattenedData(response.data));
      })
      .catch(error => {
        console.error(error);
      })
      .finally(x=>{
        setLoading(false);
      });
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ""; // Required for showing the browser alert
      }
    };
    const handlePopState = (event) => {
      if (hasUnsavedChanges) {
        const confirm = window.confirm(
          "You have unsaved changes. Do you still want to leave this page?"
        );
        if (!confirm) {
          // Push back to current page if the user cancels
          window.history.pushState(null, null, window.location.pathname);
          
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const getFlattenedData = (data) => {
      let updatedData = data.map((dataObj) => {
          //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
          return { ...dataObj }
      });
      return updatedData || [];
  }

//   const handleEdit = (params) => {
//     setEditingRow(params.node.id);
//     params.api.startEditingCell({ rowIndex: params.node.rowIndex, colKey: 'hours' });
//   };

const handleEdit = (params) => {
    setEditingRowData(params.data);
    setIsModalOpen(true);
  };


  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);

  const handleOpenTimesheet = (employee) => {
    setSelectedEmployee(employee);
    setIsTimesheetOpen(true);
  };

  const handleSaveTimesheet = (totalHours) => {
    setRowData((prevData) =>
      prevData.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, hours: totalHours } : emp
      )
    );
    setIsTimesheetOpen(false);
  };

  const handleSaveModal = async (updatedData) => {
    const updatedRow = { ...editingRowData, ...updatedData };
    updatedRow.total = updatedRow.hours * updatedRow.billRate;
    console.log(updatedRow);
    //setRowData(updatedRow)
    setIsModalOpen(false);        

    const updatedDataToSave = [{
        ...updatedRow, // Spread the existing properties
        formatSelectedDate: formattedDate, // Add the new property
      }];

      fetch('http://localhost:8080/api/v1/invoice/addInvoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDataToSave),
      })
        .then(response => response.json())
        .then((data) => {
          console.log("API Response:", data);
          setLoading(true); // Turn on loading before fetchData
          fetchData();
        })
        .catch(error => console.error('API Error:', error));
  };

  const handleSave = () => {
    const invalidRowsIds = [];
    let isAllValid = true;

    // Validate each row
    const updatedRowData = rowData.map((row) => {
      const isRowValid = (row.hours == 0 && row.invoiceId == 0) || (row.hours > 0 && row.invoiceId > 0);
      if (!isRowValid) {
        isAllValid = false;
        invalidRowsIds.push(row.projectId); 
      }
      return row;
    });    
    setInvalidRows(invalidRowsIds);    

    if (!isAllValid) {
      alert("Some rows are invalid. Please fix the highlighted errors.");
    } else {   
      setHasUnsavedChanges(false);   
      const updatedDataToSave = rowData.map(item => ({
        ...item, // Spread the existing properties
        formatSelectedDate: formattedDate, // Add the new property
      }));
      console.log(updatedDataToSave);
      fetch('http://localhost:8080/api/v1/invoice/addInvoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDataToSave),
      })
        .then(response => response.text())
        .then((data) => {
          console.log("API Response:", data);
          setLoading(true); // Turn on loading before fetchData
          fetchData();
        })
        .catch(error => console.error('API Error:', error));
    }
  };

 

  const getColumnsDefList = ( isSortable, isEditable, hasFilter) => {
      var columns = [
        { headerName: 'Employee Id', field: 'employeeId', sortable: true },
        { headerName: 'Employee Name', field: 'employeeName', sortable: true },
        { headerName: 'Client', field: 'clientName', sortable: true },
        { headerName: 'Vendor', field: 'vendorName', sortable: true, editable: false },
        { headerName: 'Bill Rate', field: 'billRate', sortable: true, editable: false,valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` },
        { headerName: 'Hours', field: 'hours', sortable: true, editable: true},
        { headerName: 'Invoice ID', field: 'invoiceId', sortable: true, editable: true},
        { headerName: 'Total', field: 'total', sortable: true, editable: false,valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}`},
        {
            headerName: 'Timesheet',
            field: 'timesheet',
            cellRenderer: (params) => (
            <Button
                variant="contained"
                color="primary"
                startIcon={<AccessTimeIcon />}
                onClick={() => handleOpenTimesheet(params.data)}
                >
                Timesheet
                </Button>
                ),
        },
        {
            headerName: 'Actions',
            field: 'actions',
            cellRenderer: (params) => 
                <>
                  <IconButton color="primary" onClick={() => handleEdit(params)}>
                    <EditIcon />
                  </IconButton>
                </>
          }]
       return columns;
   }

   const onCellValueChanged = (params) => { 
    console.log(params)
    if (params.column.colId === 'hours') {
      const hours = params.data.hours || 0;
      const billRate = params.data.billRate || 0;
      if(hours>0){
        setHasUnsavedChanges(true);
      }
      params.data.total = hours * billRate;
      if(params.data.hours>0 && params.data.invoiceId>0){
        setInvalidRows((prevInvalidRows) => {
          console.log(prevInvalidRows)
          const updatedInvalidRows = prevInvalidRows.filter(
            (row) => row !== params.data.projectId
          );
          console.log("Updated Invalid Rows:", updatedInvalidRows);
          return updatedInvalidRows;
        });
      }
      params.api.refreshCells({ rowNodes: [params.node], columns: ['total'] }); // Refresh total column
    }
    console.log(params);
    if(params.column.colId === 'invoiceId'){
      if(params.data.invoiceId>0){
        setHasUnsavedChanges(true);
      }
      if(params.data.hours>0 && params.data.invoiceId>0){
        console.log(params.data.projectId);
        console.log([...invalidRows])
        setInvalidRows((prevInvalidRows) => {
          const updatedInvalidRows = prevInvalidRows.filter(
            (row) => row !== params.data.projectId
          );
          console.log("Updated Invalid Rows:", updatedInvalidRows);
          return updatedInvalidRows;
        });
    }
  };
}
 
  const gridOptions = {
      pagination: true,
      paginationPageSize: 10, // Number of rows to show per page
      domLayout: 'autoHeight',
      columnDefs: getColumnsDefList(true, true, true),
      onCellValueChanged: onCellValueChanged,
  };

  const handleSearchInputChange = (event) => {
      setSearchText(event.target.value);
  };
    
  const filterData = () => {
      if (!searchText) {
          return rowData;
      }

      return rowData.filter((row) =>
          Object.values(row).some((value) =>
              String(value).toLowerCase().includes(searchText.toLowerCase())
          )
      );
  };

  const [open, setOpen] = useState(false);

  const onClose = () => {
      setOpen(false);
  };

  const rowClassRules = {
    "invalid-row": (params) => invalidRows.includes(params.data.projectId), // Highlight rows if their ID is in invalidRows
  };

  return (

      
    <div className="ag-theme-alpine employee-List-grid">
    {loading ? (
      <div>Loading...</div> // Display loading indicator
    ) : (
      <>
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchInputChange}
              style={{ marginRight: '10px' }} // Add space between input and Search button
            />           
          </div>
          <Button key="save" type="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
  
        <AgGridReact
          rowData={filterData()}
          columnDefs={getColumnsDefList(true)}
          gridOptions={gridOptions}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            resizable: true,
            filter: false,
            floatingFilter: false,
          }}
          ref={gridRef}
          sideBar={{
            toolPanels: [
              {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                  suppressRowGroups: false,
                  suppressValues: true,
                  suppressPivots: false,
                  suppressPivotMode: true,
                  suppressColumnFilter: true,
                  suppressColumnSelectAll: true,
                  suppressColumnExpandAll: true,
                },
              },
            ],
          }}
          rowClassRules={rowClassRules}
          sortable={true}
          defaultToolPanel="columns"
          pagination={true}
          paginationPageSize={15}          
        />
  
        {isModalOpen && (
          <EditHoursInvoiceModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveModal}
            initialData={editingRowData}            
          />
        )}
      </>
    )}
  </div>
  )  
}

export default GenerateInvoiceDetails;