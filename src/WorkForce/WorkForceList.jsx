import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Link } from 'react-router-dom';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './WorkForce.css';

const WorkForceList = ({employees}) => {
    //console.log(employees)
    const [searchText, setSearchText] = useState('');
    const [rowData, setRowData] = useState();
    const columnsList = ['First Name', 'Last Name', 'Visa','status','Annual Pay','Designation', 'startDate','Primary Skills','Work City','Work Country','Email Id', 'Phone', 'DOB','endDate'
        ,'Employment Type', 'SSN', 'Gender','Employee Id'];

    useEffect(() => {
        setRowData(employees)
    }, []);

    const getColumnsDefList = (columnsList, isSortable) => {
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