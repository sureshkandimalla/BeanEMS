import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
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
                      { headerName: 'Description', field: 'billType',sortable: isSortable, filter: true},
                       { headerName: 'InvoiceMonth', field: 'invoiceMonth',sortable: isSortable, filter: true,valueFormatter: (params) => {
                        if (!params.value) return ''; // Handle empty or undefined values
                        const date = new Date(params.value);
                        return date.toLocaleDateString('en-US', {
                          month: 'short', // Short month format (e.g., Mar)
                          day: 'numeric', // Numeric day format
                          year: 'numeric', // Full year format
                        });
                      }},
                      {
                        headerName: 'Billing',
                        field: 'billing',
                        sortable: isSortable,
                        valueFormatter: (params) => {
                          // Check if this is a pinned row
                          if (params.node.rowPinned) {
                            return params.value; // Return the raw value without formatting
                          }
                      
                          // Apply formatting for non-pinned rows
                          return `$${params.value ? params.value.toFixed(2) : '0.00'}`;
                        }
                      },
                      { headerName: 'Hours', field: 'hours', sortable: isSortable, filter: true},
                       { headerName: 'Total', field: 'total', sortable: isSortable,  valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}`, filter: true // Format with dollar sign
                      },
                       { headerName: 'Bill PaidAmount', field: 'billPaidAmount', sortable: isSortable,   valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}`, filter: true // Format with dollar sign
                      },
                      { headerName: 'BillDate', field: 'billDate', sortable: isSortable, filter: true},
                       { headerName: 'Start Date', field: 'startDate', sortable: isSortable, filter: true},
                       { headerName: 'End Date', field: 'endDate', sortable: isSortable, filter: true},
                       { headerName: 'Payment Date', field: 'paymentDate', sortable: isSortable, filter: true},
                       { headerName: 'Status', field: 'status', sortable: isSortable, filter: true}                       
                         
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