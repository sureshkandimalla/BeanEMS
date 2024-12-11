import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Drawer } from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-datepicker/dist/react-datepicker.css';



const BillingDetails = ({url}) => {
    
  const [searchText, setSearchText] = useState('');
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
    setRowData([])
    const today = new Date();   
    axios.get(url, {
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

  const getColumnsDefList = ( isSortable, isEditable, hasFilter) => {
      var columns = [
                      /* { headerName: 'Invoice Id', field: 'invoiceId', sortable: isSortable,valueFormatter: (params) => {
                        // Check if this row is the pinned bottom row and show "Total"
                        return params.node.rowPinned === 'bottom' ? "Total" : params.value;
                      } },*/
                      { headerName: 'Description', field: 'billType',sortable: isSortable},
                       { headerName: 'InvoiceMonth', field: 'invoiceMonth',sortable: isSortable},
                       //{ headerName: 'EmployeeName', field: 'employeeName', sortable: isSortable},
                       { headerName: 'Billing', field: 'billing', sortable: isSortable,  valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                      { headerName: 'Hours', field: 'hours', sortable: isSortable},
                       { headerName: 'Total', field: 'total', sortable: isSortable,  valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                       { headerName: 'Bill PaidAmount', field: 'billPaidAmount', sortable: isSortable,   valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                      { headerName: 'billDate', field: 'billDate', sortable: isSortable},
                       { headerName: 'Start Date', field: 'startDate', sortable: isSortable},
                       { headerName: 'End Date', field: 'endDate', sortable: isSortable},
                       { headerName: 'Payment Date', field: 'paymentDate', sortable: isSortable},
                       { headerName: 'Status', field: 'status', sortable: isSortable}                       
                         
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

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData)
      setPinnedBottomRowData([
        {
          invoiceId: "Total",
          billing: rowData.reduce((sum, row) => sum + (row.billing || 0), 0),
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          total: rowData.reduce((sum, row) => sum + (row.total || 0), 0),
          billPaidAmount: rowData.reduce((sum, row) => sum + (row.billPaidAmount || 0), 0), // Summing billRate values
      
        },
      ]);
      console.log(pinnedBottomRowData)
    }
  }, [rowData]);


  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" }; // Custom inline style for pinned rows
    }
    return null;
  };

  return (

      
      <div className="ag-theme-alpine employee-List-grid" >          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
        />                 
    </div>
    <div style={{ display: "flex", alignItems: "center", marginTop: "0px" }}> 
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
            pinnedTopRowData={pinnedBottomRowData}  // Set pinned bottom row data here                
            getRowStyle={getRowStyle}
              />
      </div>
  )
}

export default BillingDetails;