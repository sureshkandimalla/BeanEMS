import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-datepicker/dist/react-datepicker.css';



const PayrollDetails = ({employeeId}) => {
    
  const [searchText, setSearchText] = useState('');
  const [rowData, setRowData] = useState();
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
    axios.get(`http://localhost:8080/api/v1/payroll/getPayrollsForEmp?employeeId=${employeeId}`, {
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
                       { headerName: 'Payroll Id', field: 'payrollId', sortable: isSortable,valueFormatter: (params) => {
                        // Check if this row is the pinned bottom row and show "Total"
                        return params.node.rowPinned === 'bottom' ? "Total" : params.value;
                      } },
                       { headerName: 'PayCycleStartDate', field: 'payCycleStartDate',sortable: isSortable},
                       { headerName: 'PayCycleEndDate', field: 'payCycleEndDate', sortable: isSortable},                       
                       { headerName: 'Hours', field: 'hours', sortable: isSortable},
                       { headerName: 'TotalPaid', field: 'totalPaid', sortable: isSortable,  valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                       { headerName: 'TaxWithheld', field: 'taxWithheld', sortable: isSortable,   valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}` // Format with dollar sign
                      },
                       { headerName: 'Deductions', field: 'deductions', sortable: isSortable,valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}`},
                       { headerName: 'NetPay', field: 'netPay', sortable: isSortable, valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}`},
                       { headerName: 'EmployerLiability', field: 'employerLiability', sortable: isSortable, valueFormatter: (params) => `$${params.value ? params.value.toFixed(2) : '0.00'}`}                                         
                       
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
          payrollId: "Total",
          totalPaid: rowData.reduce((sum, row) => sum + (row.totalPaid || 0), 0),
          hours: rowData.reduce((sum, row) => sum + (row.hours || 0), 0),
          taxWithheld: rowData.reduce((sum, row) => sum + (row.taxWithheld || 0), 0),
          deductions: rowData.reduce((sum, row) => sum + (row.deductions || 0), 0), // Summing billRate values
          netPay: rowData.reduce((sum, row) => sum + (row.netPay || 0), 0),
          employerLiability: rowData.reduce((sum, row) => sum + (row.employerLiability || 0), 0),
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
            pinnedTopRowData={pinnedBottomRowData}  // Set pinned bottom row data here                
            getRowStyle={getRowStyle}
              />              
      </div>
  )
}

export default PayrollDetails;