import React, { useState, useEffect,useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Drawer } from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-datepicker/dist/react-datepicker.css';
import AdjustmentForm from './AdjustmentForm'
import { formatCurrency } from "../Utils/CurrencyFormatter";



const AdjustementDetails = ({employeeId}) => {
    
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [rowData, setRowData] = useState();
  const navigate = useNavigate();
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
    //default status =viewAll
    setRowData([])
    const today = new Date();   
    axios.get(`http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/adjustment/findAdjustmentsByEmployeeId?id=${employeeId}`, {
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
                       { headerName: 'Adjustment Id', field: 'adjustmentId', sortable: isSortable,valueFormatter: (params) => {
                        // Check if this row is the pinned bottom row and show "Total"
                        return params.node.rowPinned === 'bottom' ? "Total" : params.value;
                      } },
                       { headerName: 'FromName', field: 'fromName',sortable: isSortable},
                       { headerName: 'ToName', field: 'toName', sortable: isSortable},
                       { headerName: 'Amount', field: 'amount', sortable: isSortable,  valueFormatter: (params) => formatCurrency(params.value), // Format with dollar sign
                      },
                       { headerName: 'AdjustmentType', field: 'adjustmentType', sortable: isSortable, filter:true},
                       { headerName: 'Notes', field: 'notes', sortable: isSortable,  width: 550 },                       
                       { headerName: 'AdjustmentDate', field: 'adjustmentDate', sortable: isSortable, filter:true}                                                                                     
                       
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
  const onClose = (action) => {
      setOpen(false);
      if (action === 'submit') {
        fetchData(); // Fetch data if submit
      }
  };

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData)
      setPinnedBottomRowData([
        {
          adjustmentId: "Total",
          amount: rowData.reduce((sum, row) => sum + (row.amount || 0), 0),
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
          <Drawer
              title={`Add Adjustments`}
              placement="right"
              size="large"
              onClose={onClose}
              open={open}
          >
               <AdjustmentForm onClose={onClose}/> 

          </Drawer>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchInputChange}
        />  
         <Button  style={{marginLeft:"20px"}}type="primary" className="button-vendor" onClick={addNewInvoice}>
        <PlusOutlined /> Add New Adjustment
    </Button>      
    </div>
    <div style={{ display: "flex", alignItems: "center", marginTop: "0px" }}> 
</div>
   
</div>
                  

          <AgGridReact rowData={filterData()} columnDefs={getColumnsDefList(true)} gridOptions={gridOptions}
              defaultColDef={{                                  
                  filter: true,
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

export default AdjustementDetails;