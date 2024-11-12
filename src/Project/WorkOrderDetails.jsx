import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import './ProjectGrid.css';
import { PlusOutlined} from '@ant-design/icons';
import { Button, Drawer  } from 'antd';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import WorkOrderForm from "./WorkOrderForm";
const WorkOrderDetails = ({rowData}) => {
 console.log(rowData)
  //  const [rowData, setRowData] = useState();
  const [responseData, setResponseData] = useState();
  const [searchText, setSearchText] = useState('');

  const addNewProject = () => {
    setOpen(true);
  };

const onClose = () => {
  setOpen(false);
};

const [open, setOpen] = useState(false);

useEffect(() => {
    console.log('rowData:', rowData);
    setResponseData(rowData);
}, [rowData]);

const getFlattenedData = (data) => {

    let updatedData = data.map((dataObj) => {
    return { ...dataObj}

       // return { ...dataObj,...dataObj.assignments[0],...dataObj.employee.firstName.value, ...dataObj.employee.employeeAssignments[0],...dataObj.customer,...dataObj.billRates[0] }
    });
    console.log(updatedData)
    return updatedData || [];
}



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

const getColumnsDefList = ( isSortable, isEditable, hasFilter) => {
/// const columnsList = ['Project Name', 'Project Id ','Employee Id', 'Employee Name', 'Client', 'Vendor','Bill Rate', 'Invoice Terms','startDate','endDate','Status','Employee Pay','Expenses','Bean Expenses','Bean Net','Total Hours';
   var columns = [
                   { headerName: 'Wage Id', field: 'wageId'},
                   { headerName: 'Wage Type', field: 'wageType', sortable: isSortable, editable: false, filter: 'agTextColumnFilter' },
                   { headerName: 'Bill Rate', field: 'wage', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                   { headerName: 'Project Start Date', field: 'startDate', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                   { headerName: 'Project End Date', field: 'endDate', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                  // { headerName: 'Wage', field: 'wage', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                ]
    return columns;
}



return (
  <> 
    <div className="ag-theme-alpine employee-List-grid" >
    <div class="container">      
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />
        <Drawer
              title={`Create New WorkOrder`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
              <WorkOrderForm onClose={onClose} />

          </Drawer>
            <button type="primary" className='search-button' onClick={filterData}>Search</button>
            <Button type='primary' className='button-vendor' onClick={addNewProject}><PlusOutlined /> Add New WorkOrder</Button>
            </div>
            <AgGridReact rowData={filterData()} columnDefs={getColumnsDefList( true, false)} 
            domLayout="autoHeight"
            defaultColDef={{
                flex: 1,
                minWidth: 150,
                resizable: true,
                filter: false,
                floatingFilter: false
            }}
            hiddenByDefault={false}
            rowGroupPanelShow='never'
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
            paginationPageSize={15} />
    </div>
    </>
)
}

export default WorkOrderDetails;

