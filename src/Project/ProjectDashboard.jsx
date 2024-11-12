import React, { useState, useEffect,useRef } from "react";
//import TextField from '@material-ui/core/TextField';
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import './ProjectGrid.css';
import {DesktopOutlined,RiseOutlined,PlusOutlined} from '@ant-design/icons';
import RevenueCharts from '../RevenueCharts/RevenueCharts';
import { Col, Row ,Card, Button, Flex, Drawer  } from 'antd';
import { Link } from 'react-router-dom';
import ProjectOnBoardingForm from '../OnBoardingComponent/ProjectOnBoarding';
import './ProjectGrid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";

const ProjectDashboard = () => {

  //  const [rowData, setRowData] = useState();
  const [rowData, setRowData] = useState();
  const [searchText, setSearchText] = useState('');
  const projectsSize = rowData ? rowData.length : 0
  const thisMonthData = [50000, 43000, 60000, 70000, 55000];
  const lastMonthData = [25000, 28000, 20000, 15000, 50000];

  const isInitialRender = useRef(true);

  const addNewProject = () => {
    setOpen(true);
  };

const onClose = () => {
  setOpen(false);
};

const [open, setOpen] = useState(false);

useEffect(() => {
  const fetchData = async () => {
      if (!isInitialRender.current) {
          try {
            const response = await fetch('http://localhost:8080/api/v1/getProjects');
              const data = await response.json();
              const flattendData = getFlattenedData(data)
              setRowData(flattendData); 
              console.log(flattendData)                     
          } catch (error) {
              console.error('Error fetching data:', error);
          }
      } else {
          isInitialRender.current = false;
      }
  };

  fetchData();
}, []);

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
                   { headerName: 'Project Name', field: 'projectName',cellRenderer: (params) => {const rowData = params.data;
                    return ( <Link to='/projectFullDetais'state= {{ rowData }} > {rowData.projectName}</Link>)}, sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Employee Name', field: 'employeeName', cellRenderer: (params) => { const rowData = params.data;
                        return (<Link to={{  pathname: '/employeeProjectDetails', state: { rowData }, }} > {rowData.employeeName} </Link> );}, sortable: isSortable, editable: false, filter: 'agTextColumnFilter' },
                    { headerName: 'Bill Rate', field: 'billRate', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Bean Net Internal', field: 'net', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Employee pay Rate', field: 'employeePay', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'External', field: 'expenseExternal', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Internal', field: 'expenseInternal', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Bean Net', field: 'net', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                   
                    { headerName: 'Status', field: 'status', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Project Id', field: 'projectId', sortable: isSortable, editable: false, filter: 'agTextColumnFilter' },
                  //  { headerName: 'Employee Id', field: 'employeeId', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                     //{ headerName: 'Employee Name', field: 'employeeName', valueGetter(params) { return  params.data.firstName + ' ' + params.data.lastName ;},sortable: isSortable, editable: false, filter: 'agTextColumnFilter' },
                    { headerName: 'Client', field: 'clientName',sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Vendor', field: 'vendorName', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                     { headerName: 'Project Start Date', field: 'startDate', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Project End Date', field: 'endDate', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                     { headerName: 'Invoice Terms', field: 'invoiceTerm', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                    { headerName: 'Invoice Terms', field: 'invoiceTerm', sortable: isSortable, editable: true, filter: 'agTextColumnFilter' },
                  ]
    return columns;
}



return (
  <>  
            <>
                <Row gutter={16}>
                    <Col span={7}>
                        <Card className='totalProjectsCard'>
                            <Row className='mrgTop15'>
                                <Col><DesktopOutlined/> <span className='totalProjectLabel'>Total Active Projects</span></Col>
                            </Row>
                            <Row justify="space-between" className='mrgtop145'>
                                <Col><span className='totalProjectsCount'>{projectsSize}</span></Col>
                                {/* should add icon dynamicall based on logic */}
                                <Col className='projectStatcol'><RiseOutlined className='riseIcon'/> <span> vs Last Month</span></Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={17}>
                        <div>
                            <Card className='totalRevenceCard'>
                                <>
                                <span className='totalRevenueLabel'>Total Revenue</span>
                                <span className='totalRevenueCount'>$66,143.00</span>
                                </>
                                <RevenueCharts thisMonthData={thisMonthData} lastMonthData={lastMonthData} />
                            </Card>
                        </div>
                    </Col>
                </Row>

            </>
    <div className="ag-theme-alpine employee-List-grid" >
    <div class="container">      
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />
        <Drawer
              title={`Create New Project`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
              <ProjectOnBoardingForm onClose={onClose} />

          </Drawer>
            <button type="primary" className='search-button' onClick={filterData}>Search</button>
            <Button type='primary' className='button-vendor' onClick={addNewProject}><PlusOutlined /> Add New Project</Button>
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

export default ProjectDashboard;

