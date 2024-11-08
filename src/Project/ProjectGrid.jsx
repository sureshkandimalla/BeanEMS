import React, { useState,useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import './ProjectGrid.css';

const ProjectGrid = ({employeeId}) => {
    
    const [searchText, setSearchText] = useState('');
    const [rowData, setRowData] = useState();
    const columnDefs = [
        {
            headerName: 'Employee Name',
            field: 'employee.firstName',
            valueGetter: (params) =>           
                `${params.data.firstName || ''} ${params.data.lastName || ''}`
        },
        { headerName: 'Client Name', 
            field: 'client',
             cellRenderer: (params) => params.data?.customerCompanyName },
        {
            headerName: 'Bill Rate',
            field: 'billRates',
            cellRenderer: (params) => params.data?.wage || 'N/A'
        },
        { headerName: 'Status', field: 'status' },
        { headerName: 'EmailId', field: 'emailId'},
        { headerName: 'phone',  field:'phone'},   
        {headerName: 'SSN', field: 'ssn'},
        {headerName: 'ReferredBy', field: 'referredBy'},     
        { headerName: 'Start Date', field: 'startDate' },
        { headerName: 'End Date', field: 'endDate' },
        { headerName: 'Project Id', field: 'projectId' },
        { headerName: 'Project Name', field: 'projectName' },
        { headerName: 'Invoice Term', field: 'invoiceTerm' },
        { headerName: 'Payment Term', field: 'paymentTerm' },
        {headerName: 'VisaType', field:'visa'},
    ];

    useEffect(() => {
        fetch(`http://localhost:8080/api/v1/projects?employeeId=${employeeId}`)
            .then(response => response.json())
            .then(data => {
                const transformedData = Array.isArray(data)
                ? data?.map(item => flattenObject(item)) // Each flattened object wrapped in an array
                : [];
            setRowData(transformedData);
            console.log(transformedData)
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);    

    const flattenObject = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {            
    
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    // Flatten only the first item in the array and skip the index prefix
                    acc = { ...acc, ...flattenObject(obj[key][0] || {}) };
                } else {
                    // Recurse into nested objects
                    acc = { ...acc, ...flattenObject(obj[key]) };
                }
            } else {
                // Directly assign values if not an object or array
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    };
    
    // const getColumnsDefList = (columnsList, isSortable, isEditable, hasFilter) => {
    //     let columns = columnsList.map((column) => {
    //         let fieldValue = column.split(' ').join('')
    //         fieldValue = fieldValue[0].toLowerCase() + fieldValue.slice(1);
    //         if (fieldValue.toLowerCase() === 'ssn' || fieldValue.toLowerCase() === 'dob') {
    //             fieldValue = fieldValue.toLowerCase();
    //         }

    //         let updatedColumn = column === 'DOB' ? 'Date of Birth' : column
    //         updatedColumn = column
    //        /* if(column == 'startDate' )
    //             updatedColumn='Employment Start Date';
    //         else if(column == 'endDate')
    //             updatedColumn='Employment End Date';*/
   
    //             return {
    //                 headerName: updatedColumn,
    //                 field: fieldValue,
    //                 sortable: isSortable,
    //                 editable: true,
    //                 cellStyle: { 'text-align': 'left' },
    //                 filter: 'agTextColumnFilter',
    //                 tooltipValueGetter: (params) => params.value, 
    //                 cellRenderer: (params) => {
    //                     if (column === 'Employee Name' || column === 'Last Name') {
    //                         return (
    //                             <Link to="/employeeFullDetails" state={{ rowData: params.data }}>
    //                                 {params.value}
    //                             </Link>
    //                         );
    //                     } else {
    //                         return params.value;
    //                     }
    //                 },
    //                 valueFormatter: (params) => {
    //                     return typeof params.value === 'float' ?  params.value.toLocaleString():'';
    //                   },
    //                 //tooltipComponent: 'customTooltip',
    //                 tooltipShowDelay: 0,
    //             };
    //         });
    //         return columns;
    //     };

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
            // const gridOptions = {
            //     onGridReady: (params) => {
            //       // Automatically size all columns to fit content on grid load
            //       const allColumnIds = [];
            //       params.columnApi.getAllColumns().forEach((column) => {
            //         allColumnIds.push(column.getColId());
            //       });
            //       params.columnApi.autoSizeColumns(allColumnIds); // Auto-size columns to content
            //     }
            //   };
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
            <AgGridReact rowData={filterData()} frameworkComponents={{ customTooltip: CustomTooltip }} columnDefs={columnDefs}
                
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
                paginationPageSize={100} 
                gridOptions />
                
        </div>
    )
}

export default ProjectGrid;