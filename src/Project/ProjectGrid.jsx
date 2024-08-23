import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Link } from 'react-router-dom';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ProjectGrid.css';

const ProjectGrid = () => {
    
    const [searchText, setSearchText] = useState('');
    const [rowData, setRowData] = useState();
    const columnsList = ['Employee Name', 'Vendor Name', 'Client Name', 'Bill Rate', 'Net','Employee Pay', 
        'status','startDate','endDate','Project Id','Project Name', 
        'Expense Internal','Expense External','Invoice Term','Payment Term','Hours'];

    useEffect(() => {
        fetch('http://localhost:8080/api/v1/getProjects')
            .then(response => response.json())
            .then(data => {
                setRowData(getFlattenedData(data));
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const getFlattenedData = (data) => {
        let updatedData = data.map((dataObj) => {
            //return { ...dataObj, ...dataObj.employeeAddress[0], ...dataObj.employeeAssignments[0] }
            return { ...dataObj }
        });
        return updatedData || [];
    }
    
    const getColumnsDefList = (columnsList, isSortable, isEditable, hasFilter) => {
        let columns = columnsList.map((column) => {
            let fieldValue = column.split(' ').join('')
            fieldValue = fieldValue[0].toLowerCase() + fieldValue.slice(1);
            if (fieldValue.toLowerCase() === 'ssn' || fieldValue.toLowerCase() === 'dob') {
                fieldValue = fieldValue.toLowerCase();
            }

            let updatedColumn = column === 'DOB' ? 'Date of Birth' : column
            updatedColumn = column
           /* if(column == 'startDate' )
                updatedColumn='Employment Start Date';
            else if(column == 'endDate')
                updatedColumn='Employment End Date';*/
   
                return {
                    headerName: updatedColumn,
                    field: fieldValue,
                    sortable: isSortable,
                    editable: true,
                    cellStyle: { 'text-align': 'left' },
                    filter: 'agTextColumnFilter',
                    tooltipValueGetter: (params) => params.value, 
                    cellRenderer: (params) => {
                        if (column === 'Employee Name' || column === 'Last Name') {
                            return (
                                <Link to="/employeeFullDetails" state={{ rowData: params.data }}>
                                    {params.value}
                                </Link>
                            );
                        } else {
                            return params.value;
                        }
                    },
                    valueFormatter: (params) => {
                        return typeof params.value === 'float' ?  params.value.toLocaleString():'';
                      },
                    //tooltipComponent: 'customTooltip',
                    tooltipShowDelay: 0,
                };
            });
            return columns;
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

            const CustomTooltip = (props) => {
                return <div style={{ color: 'red', background: 'yellow', padding: '5px' }}>{props.value}</div>;
            };
            const gridOptions = {
                onGridReady: (params) => {
                  // Automatically size all columns to fit content on grid load
                  const allColumnIds = [];
                  params.columnApi.getAllColumns().forEach((column) => {
                    allColumnIds.push(column.getColId());
                  });
                  params.columnApi.autoSizeColumns(allColumnIds); // Auto-size columns to content
                }
              };
    return (
        <div className="ag-theme-alpine employee-List-grid" >
            <div class="container">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={handleSearchInputChange}
                    />
                    <button type="primary" className='search-button' onClick={filterData}>Search</button>
                </div>
            <AgGridReact rowData={filterData()} frameworkComponents={{ customTooltip: CustomTooltip }} columnDefs={getColumnsDefList(columnsList, true, false)}
                
                domLayout="autoHeight"
                defaultColDef={{
                    flex: 1,
                    minWidth: 150,
                    resizable: true,
                    filter: false,
                    floatingFilter: false
                }}
                hiddenByDefault={false}
                rowGroupPanelShow='always'
                pivotPanelShow='always'
                sortable={true}
                defaultToolPanel='columns'
                pagination={true}
                paginationPageSize={100} 
                gridOptions />
                
        </div>
    )
}

export default ProjectGrid;