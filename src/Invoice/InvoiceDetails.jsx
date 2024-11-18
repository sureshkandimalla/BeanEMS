import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Drawer } from 'antd';
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



const InvoiceDetails = () => {
    
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rowData, setRowData] = useState();
  const navigate = useNavigate();
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);


//  const columnsList = ['Customer Id', 'Company Name', 'Email Id', 'Phone', 'Status', 'ein', 'Website','startDate','endDate' ];
  const isInitialRender = useRef(true);

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
    const formattedDate = today.toISOString().split('T')[0];
    axios.get('http://localhost:8080/api/v1/invoice/getAllInvoices', {
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

  const handleDateChange = date => {
    setSelectedDate(date);
    //alert(date.toISOString().split('T')[0]);
    const formttedDate = date.toISOString().split('T')[0]; //yyyy-mm-dd
    fetchData(formttedDate);
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
                       { headerName: 'Billing', field: 'billing', sortable: isSortable,  valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                       { headerName: 'Hours', field: 'hours', sortable: isSortable},
                       { headerName: 'Total', field: 'total', sortable: isSortable,  valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                       { headerName: 'Invoice PaidAmount', field: 'invoicePaidAmount', sortable: isSortable,   valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                       { headerName: 'Start Date', field: 'startDate', sortable: isSortable},
                       { headerName: 'End Date', field: 'endDate', sortable: isSortable},
                       //{ headerName: 'Invoice Date', field: 'invoiceDate', sortable: isSortable},
                       { headerName: 'status', field: 'status', sortable: isSortable},
                      //  {
                      //   headerName: 'Timesheet',
                      //   field: 'timesheet',
                      //   cellRenderer: (params) => (
                      //     <Button
                      //       variant="contained"
                      //       color="primary"
                      //       startIcon={<AccessTimeIcon />}
                      //       onClick={() => handleOpenTimesheet(params.data)}
                      //     >
                      //       Timesheet
                      //     </Button>
                      //   ),
                      // },
                       
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
      setPinnedBottomRowData([
        {
          invoiceId: "Total",
          billing: rowData.reduce((sum, row) => sum + (row.billing || 0), 0),
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          total: rowData.reduce((sum, row) => sum + (row.total || 0), 0),
          invoicePaidAmount: rowData.reduce((sum, row) => sum + (row.invoicePaidAmount || 0), 0), // Summing billRate values
        },
      ]);
      console.log(pinnedBottomRowData)
    }
  }, [rowData]);


  const generateInvoice = () => {
    // Any additional logic can go here
    navigate('/generateInvoice', { state: { selectedDate: selectedDate.toString() } });
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
              title={`Generate New Invoice`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
              <NewInvoice />

          </Drawer>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
        />
        <button type="primary" className="search-button" onClick={filterData}>
            Search
        </button>
    </div>
    <Button type="primary" className="button-vendor" onClick={addNewInvoice}>
        <PlusOutlined /> Add New Invoice
    </Button>
</div>
                  <div style={{ marginTop: "0px" }}>
                    <label style={{ marginTop: "5px" }}> Select Date: &nbsp;</label>
                    <DatePicker class ="left-panel"  selected={selectedDate} onChange={handleDateChange} dateFormat="MM/yyyy" placeholderText="Select"  showMonthYearPicker/>
                    <Button type='primary'style={{ marginLeft: "10px" }} className='button-vendor' disabled={!selectedDate} onClick={generateInvoice}><PlusOutlined /> Generate Invoice</Button>
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
            pinnedTopRowData={pinnedBottomRowData}  // Set pinned bottom row data here                
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