import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Link } from 'react-router-dom';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './WorkForce.css';
import { formatCurrency } from "../Utils/CurrencyFormatter";


const WorkForceList = ({employees}) => {   
    const [searchText, setSearchText] = useState('');
    const [rowData, setRowData] = useState();
    const [gridApi, setGridApi] = useState(null);
    const columnsList = ['First Name', 'Last Name', 'Visa','Status','Annual Pay','Designation', 'StartDate','Primary Skills','Work City','Work Country','Email Id', 'Phone', 'DOB','EndDate'
        ,'Employment Type', 'SSN'];

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
            let columnFilter;
        if (column === 'Date of Birth' || column === 'startDate' || column === 'DOB' || column === 'endDate') {
            columnFilter = "agDateColumnFilter"; 
        } else if (column === 'Annual Pay'  || column === 'EmployeeId') {
            columnFilter = "agNumberColumnFilter";
        } else {
            columnFilter = "agSetColumnFilter";
        }
        const headerPadding = 20; // Extra space for better visibility       
        const maxDataLength = (rowData && rowData.length > 0) 
        ? rowData.reduce((max, row) => {        
        const valueLength = row[fieldValue] ? row[fieldValue].toString().length : 0;
        return Math.max(max, valueLength);
    }, column.length)
    : column.length; 

        const charWidth = 8; 
        const maxAllowedWidth = 25 * charWidth; 
        console.log(column.length)
        const autoWidth = Math.min((maxDataLength * charWidth) + 30, maxAllowedWidth);   
           /* if(column == 'startDate' )
                updatedColumn='Employment Start Date';
            else if(column == 'endDate')
                updatedColumn='Employment End Date';*/
   
                return {
                    headerName: updatedColumn,
                    field: fieldValue,
                    sortable: isSortable,
                    editable: true,
                    filter: columnFilter,
                    minWidth:  autoWidth,   
                    suppressSizeToFit: true,              
                    tooltipValueGetter: (params) => params.value, 
                    cellRenderer: (params) => {
                        if (column === 'First Name' || column === 'Last Name') {
                            return (
                                <Link to="/employeeFullDetails" state={{ rowData: params.data }}>
                                    {params.value}
                                </Link>
                            );
                        }else if (params.colDef.field === "annualPay") {                             
                            return formatCurrency(params.value); 
                        }
                         else {
                            return params.value;
                        }
                    },                    
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
                    resizable: true, 
                    floatingFilter: false,
                    filter: true
                }}
                
                hiddenByDefault={false}                
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
                pagination={true}
                paginationPageSize={20} />
        </div>
    )
}

export default WorkForceList;