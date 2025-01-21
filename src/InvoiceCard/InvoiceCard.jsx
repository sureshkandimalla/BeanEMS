// InvoiceCard.js
import React, { useState, useEffect, useRef } from 'react';
import { Row, Input, Space, Radio } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import CustomHeader from '../CustomHeader/CustomHeader';
import './InvoiceCard.css';
const { Search } = Input;

const InvoiceCard = () => {
  const gridApi = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [invoiceStatus, setInvoiceStatus] = useState('viewAll');
  const isInitialRender = useRef(true);
  const [searchText, setSearchText] = useState('');
  const columnsList = ['Invoice Id', 'Project Id', 'InvoiceMonth',  'Billing' , 'Hours', 'Total', 'Invoice PaidAmount', 'Invoice Date', 'status'];

  // Custom filter function for the search input
  const handleFilterChange = (value) => {
    gridApi.current.setQuickFilter(value);  
  };
  const onChange = (e) => {
    console.log(`radio checked:${e.target.value}`);
    setInvoiceStatus(e.target.value);
  };

  useEffect(() => {
    if (!isInitialRender.current) {
        fetchData();
    } else {
        isInitialRender.current = false;
    }
}, [invoiceStatus]);

const fetchData = () => {
  //default status =viewAll
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  axios.get('http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/invoice/getAllInvoices', {
    //params: {
      //selectedDate:'2023-11-01',//formattedDate,
      //status: invoiceStatus
   // }
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
      return { ...dataObj }
  });
  return updatedData || [];
}

const getColumnsDefList = (columnsList, isSortable, isEditable, hasFilter) => {
  let columns = columnsList.map((column) => {
      let fieldValue = column.split(' ').join('')
      fieldValue = fieldValue[0].toLowerCase() + fieldValue.slice(1);
      if (fieldValue.toLowerCase() === 'dob') {
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
                      return params.value;                
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
  // Grid column definitions

  return (
    <>
    <div className='invoiceCardFilters'>
    <Row justify="space-between">
    <Radio.Group onChange={onChange} defaultValue="viewAll" size="large">
      <Radio.Button value="viewAll">View All</Radio.Button>
      <Radio.Button value="pending">Pending</Radio.Button>
      <Radio.Button value="upcoming">Upcoming</Radio.Button>
      <Radio.Button value="overdue">Over Due</Radio.Button>
    </Radio.Group>
    <Space>
    <Space.Compact size="large">
      <Input  addonBefore={<SearchOutlined />}  placeholder="Search..." value={searchText} onChange={handleSearchInputChange} />
    </Space.Compact>
    </Space>
   
    </Row>
    </div>
    <div className="ag-theme-alpine employee-List-grid" >
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
                paginationPageSize={8} />
        </div>
    </>
  );
};

export default InvoiceCard;
