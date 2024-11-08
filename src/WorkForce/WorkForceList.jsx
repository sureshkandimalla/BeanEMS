import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Link } from 'react-router-dom';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './WorkForce.css';

const WorkForceList = () => {
    
    const [searchText, setSearchText] = useState('');
    const [rowData, setRowData] = useState();
    const columnsList = ['Employee Id','First Name', 'Last Name', 'Email Id', 'Phone', 'DOB', 'Designation', 'status','startDate','endDate'
        ,'Employment Type', 'SSN', 'Gender','Primary Skills'];

    useEffect(() => {
        const storedData = localStorage.getItem('employeeData');

        if (storedData) {
            // Use data from localStorage if available
            setRowData(JSON.parse(storedData));
        } else {
        fetch('http://localhost:8080/api/v1/employees/getAllEmployees')
            .then(response => response.json())
            .then(data => {
                const flattenedData = getFlattenedData(data);
                
                // Save flattened data to localStorage
                localStorage.setItem('employeeData', JSON.stringify(flattenedData));
                
                // Update state with flattened data
                setRowData(flattenedData);               
            })
            .catch(error => console.error('Error fetching data:', error));
        }const handleBeforeUnload = () => {
            localStorage.removeItem('employeeData');
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
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
                    filter: 'agTextColumnFilter',
                    tooltipValueGetter: (params) => params.value, 
                    cellRenderer: (params) => {
                        if (column === 'First Name' || column === 'Last Name') {
                            return (
                                <Link to="/employeeFullDetails" state={{ rowData: params.data }}>
                                    {params.value}
                                </Link>
                            );
                        } else {
                            return params.value;
                        }
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
                sideBar={{
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: {
                                suppressRowGroups: true,
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
                paginationPageSize={20} />
        </div>
    )
}

export default WorkForceList;