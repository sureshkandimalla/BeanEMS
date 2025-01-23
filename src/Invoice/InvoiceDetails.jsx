import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Drawer } from 'antd';
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import {PlusOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "./Invoice.css";
import NewInvoice from './NewInvoice';
import MonthlyTimesheetDialog from "../Project/TimeSheet/MonthlyTimeSheetModal";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatCurrency } from "../Utils/CurrencyFormatter";



const InvoiceDetails = () => {
    
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [rowData, setRowData] = useState();
  const navigate = useNavigate();
  const [pinnedTopRowData, setPinnedTopRowData] = useState([]);


//  const columnsList = ['Customer Id', 'Company Name', 'Email Id', 'Phone', 'Status', 'ein', 'Website','startDate','endDate' ];
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
        fetchData();
    } else {
        isInitialRender.current = false;
    }
  }, []);

  const fetchData = () => {
    //default status =viewAll
    setRowData([])    
    axios.get('http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/invoice/getAllInvoices', {
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

  const [editRowId, setEditRowId] = useState(null);
  const [originalStatus, setOriginalStatus] = useState(null);

  const handleEdit = (params) => {
    setEditRowId(params.data.invoiceId);
    setOriginalStatus(params.data.status); // Store the original status
  };

  const handleSave = (params) => {
    const updatedRow = params.data;
    console.log(updatedRow);
    // Call the PUT API to update the row
    axios
      .put(`http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/invoice/invoices/${updatedRow.invoiceId}`, updatedRow)
      .then((response) => {
        console.log("Invoice updated successfully:", response.data);
        fetchData();
        setEditRowId(null); // Exit edit mode
      })
      .catch((error) => {
        console.error("Error updating invoice:", error);
      });
  };

  const handleCancel = (params) => {
    setRowData((prevData) =>
      prevData.map((row) =>
        row.invoiceId === editRowId ? { ...row, status: originalStatus } : row
      )
    );
    setEditRowId(null); // Exit edit mode
  };

  const handleStatusChange = (params, newValue) => {
    setRowData((prevData) =>
      prevData.map((row) =>
        row.invoiceId === params.data.invoiceId ? { ...row, status: newValue } : row
      )
    );
  };
  const handleDateChange = date => {
    setSelectedDate(date);
    // //alert(date.toISOString().split('T')[0]);
    // const formttedDate = date.toISOString().split('T')[0]; //yyyy-mm-dd
    // fetchData(formttedDate);
  };

  const getFlattenedData = (data) => {
      let updatedData = data.map((dataObj) => {
          //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
          return { ...dataObj }
      });
      return updatedData || [];
  }

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

  const getColumnsDefList = ( isSortable, isEditable, hasFilter) => {
      var columns = [
                       { headerName: 'Invoice Id', field: 'invoiceId', sortable: isSortable,valueFormatter: (params) => {
                        // Check if this row is the pinned bottom row and show "Total"
                        return params.node.rowPinned === 'bottom' ? "Total" : params.value;
                      } },
                       { headerName: 'Project Id', field: 'projectId',sortable: isSortable},
                       { headerName: 'InvoiceMonth', field: 'invoiceMonth', sortable: isSortable},
                       { headerName: 'Billing', field: 'billing', sortable: isSortable,  valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
                      },
                       { headerName: 'Hours', field: 'hours', sortable: isSortable},
                       { headerName: 'InvoiceAmount', field: 'total', sortable: isSortable,  valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
                      },
                       { headerName: 'Invoice PaidAmount', field: 'invoicePaidAmount', sortable: isSortable,   valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
                      },
                       { headerName: 'Start Date', field: 'startDate', sortable: isSortable},
                       { headerName: 'End Date', field: 'endDate', sortable: isSortable},
                       //{ headerName: 'Invoice Date', field: 'invoiceDate', sortable: isSortable},
                       {
                        headerName: "Status",
                        field: "status",
                        cellRenderer: (params) => {
                          if (params.data.invoiceId === editRowId) {
                            return (
                              <select
                                value={params.data.status}
                                onChange={(e) => handleStatusChange(params, e.target.value)}
                              >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                              </select>
                            );
                          }
                          return params.value;
                        },
                      },
                      {
                        headerName: "Actions",
                        field: "actions",
                        cellRenderer: (params) => {
                          if (params.node.rowPinned) {
                            // Return null or custom content for pinned rows
                            return null;
                          }

                          if (params.data.invoiceId === editRowId) {
                            return (
                              <>
                                <IconButton color="primary" onClick={() => handleSave(params)}>
                                  <SaveIcon />
                                </IconButton>
                                <IconButton color="secondary" onClick={() => handleCancel(params)}>
                                  <CancelIcon />
                                </IconButton>
                              </>
                            );
                          }
                          return (
                            <IconButton color="primary" onClick={() => handleEdit(params)}>
                              <EditIcon />
                            </IconButton>
                          );
                        },
                      }
                       
                   ]
       return columns;
   }
 
  const gridOptions = {
      pagination: true,
      paginationPageSize: 10, // Number of rows to show per page
      domLayout: 'autoHeight',
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

  const addNewInvoice = () => {
      setOpen(true);
  };
  const onClose = () => {
      setOpen(false);
  };

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData)
      setPinnedTopRowData([
        {
          invoiceId: "Total",
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          total: rowData.reduce((sum, row) => sum + (row.total || 0), 0),
          invoicePaidAmount: rowData.reduce((sum, row) => sum + (row.invoicePaidAmount || 0), 0), // Summing billRate values
          actions:null
        },
      ]);
      console.log(pinnedTopRowData)
    }
  }, [rowData]);


  const generateInvoice = () => {
    const formattedDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : null;
    const month = formattedDate
    ? new Date(selectedDate).toLocaleString('default', { month: 'long' }) // Use 'short' for abbreviated month
    : null;
    const endDate =  new Date().toISOString().split('T')[0];
    const encodedEndDate = encodeURIComponent(endDate);
    const encodedFormatSelectedDate = encodeURIComponent(formattedDate);
    // Any additional logic can go here
    navigate('/generateInvoice', { state: { 
      url: `http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/activeProjects?endDate=${encodedEndDate}&selectedDate=${encodedFormatSelectedDate}`,
      month: month
    }
    });
  };

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" }; // Custom inline style for pinned rows
    }
    return null;
  };

  return (

      
      <div className="ag-theme-alpine employee-List-grid" >
          <Drawer
              title={`Add New Invoice`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
              <NewInvoice onClose={onClose}/>

          </Drawer>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
        />  
         <Button  style={{marginLeft:"20px"}}type="primary" className="button-vendor" onClick={addNewInvoice}>
        <PlusOutlined /> Add New Invoice
    </Button>      
    </div>
    <div style={{ display: "flex", alignItems: "center", marginTop: "0px" }}>
  <label style={{ marginTop: "5px" }}>Invoice Date: &nbsp;</label>
  <DatePicker
    className="left-panel"
    selected={selectedDate}
    onChange={handleDateChange}
    dateFormat="MM/yyyy"
    placeholderText="Select the date"
    showMonthYearPicker
    style={{ width: "150px" }} // Add a fixed width
  />
  <Button
    type="primary"
    style={{ marginLeft: "10px" }}
    className="button-vendor"
    disabled={!selectedDate}
    onClick={generateInvoice}
  >
    <PlusOutlined /> Generate Invoice
  </Button>
</div>
   
</div>
                  

          <AgGridReact rowData={filterData()} columnDefs={getColumnsDefList(true)} gridOptions={gridOptions}
              defaultColDef={{
                  flex: 1,
                  minWidth: 150,
                  resizable: true,
                  filter: false,
                  floatingFilter: false
              }}
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
                            suppressPivots: false, suppressPivotMode: true,
                            suppressColumnFilter: true,
                            suppressColumnSelectAll: true,
                            suppressColumnExpandAll: true,
                        }
                    }
                ]
            }}
            sortable={true}
            defaultToolPanel='columns'
            pagination={true}
            paginationPageSize={15}
            pinnedTopRowData={pinnedTopRowData}  // Set pinned bottom row data here                
            getRowStyle={getRowStyle}
              />
              {isTimesheetOpen && (
  <MonthlyTimesheetDialog
    open={isTimesheetOpen}
    onClose={() => setIsTimesheetOpen(false)}
    onSave={handleSaveTimesheet}
    initialData={Array(30).fill(0)}
  />
)}
      </div>
  )
}

export default InvoiceDetails;