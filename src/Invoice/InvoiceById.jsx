import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-datepicker/dist/react-datepicker.css';



const InvoiceById = ({url}) => {
    
  const [searchText, setSearchText] = useState('');
  const [rowData, setRowData] = useState();  
  const [pinnedTopRowData, setPinnedTopRowData] = useState([]);


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
    console.log(url)  
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

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { backgroundColor: "#d3f4ff", fontWeight: "bold" }; // Custom inline style for pinned rows
    }
    return null;
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
                       { headerName: 'Invoice Id', field: 'invoiceId', sortable: isSortable,valueFormatter: (params) => {
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
                       {
                        headerName: "Status",
                        field: "status"
                      },                   
                       
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
      setPinnedTopRowData([
        {
          invoiceId: "Total",
          billing: rowData.reduce((sum, row) => sum + (row.billing || 0), 0),
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          total: rowData.reduce((sum, row) => sum + (row.total || 0), 0),
          invoicePaidAmount: rowData.reduce((sum, row) => sum + (row.invoicePaidAmount || 0), 0), // Summing billRate values
          actions:null
        },
      ]);
      console.log(pinnedTopRowData)
    }
  }, [rowData]);

  

  return (
      <div className="ag-theme-alpine employee-List-grid" >  
       <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
        />                  
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
      </div>
  )
}

export default InvoiceById;