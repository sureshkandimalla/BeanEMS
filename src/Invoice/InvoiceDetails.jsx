import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Card, Row, Col, Button, Flex, Drawer, Space, Tag } from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "./Invoice.css";
import NewInvoice from './NewInvoice';


const InvoiceDetails = () => {
    
  const [searchText, setSearchText] = useState('');
  const [rowData, setRowData] = useState();
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
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    axios.get('http://localhost:8080/api/v1/invoice/getAllInvoices', {
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
                       { headerName: 'Invoice Id', field: 'invoiceId', sortable: isSortable },
                       { headerName: 'Project Id', field: 'projectId',sortable: isSortable},
                       { headerName: 'InvoiceMonth', field: 'invoiceMonth', sortable: isSortable},
                       { headerName: 'Billing', field: 'billing', sortable: isSortable},
                       { headerName: 'Hours', field: 'hours', sortable: isSortable},
                       { headerName: 'Total', field: 'total', sortable: isSortable},
                       { headerName: 'Invoice PaidAmount', field: 'invoicePaidAmount', sortable: isSortable},
                       { headerName: 'Start Date', field: 'startDate', sortable: isSortable},
                       { headerName: 'End Date', field: 'endDate', sortable: isSortable},
                       //{ headerName: 'Invoice Date', field: 'invoiceDate', sortable: isSortable},
                       { headerName: 'status', field: 'status', sortable: isSortable},
                       
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

  const [open, setOpen] = useState(false);

  const addNewInvoice = () => {
      setOpen(true);
  };
  const onClose = () => {
      setOpen(false);
  };

  return (

      
      <div className="ag-theme-alpine employee-List-grid" >
          <Drawer
              title={`Generate New Invoice`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
              <NewInvoice />

          </Drawer>
          <div class="container">
                  <input
                      type="text"
                      placeholder="Search..."
                      value={searchText}
                      onChange={handleSearchInputChange}
                  />
                  <button type="primary" className='search-button' onClick={filterData}>Search</button>
                  <Button type='primary' className='button-vendor' onClick={addNewInvoice}><PlusOutlined /> Add New Invoice</Button>
              </div>
          <AgGridReact rowData={filterData()} columnDefs={getColumnsDefList(true)} gridOptions={gridOptions}
              defaultColDef={{
                  flex: 1,
                  minWidth: 150,
                  resizable: true,
                  filter: false,
                  floatingFilter: false
              }}/>
      </div>
  )
}

export default InvoiceDetails;