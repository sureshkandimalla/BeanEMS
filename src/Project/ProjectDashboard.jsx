import React, { useState, useEffect } from "react";
//import TextField from '@material-ui/core/TextField';
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

//import Sidebar from "../../Commons/Sidebar/Sidebar";
import { Col, Row ,Card, Tabs  } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined  } from '@ant-design/icons';
import { useLocation, useHistory } from 'react-router-dom';
//import bigInt from 'big-integer';
import EmployeeAddProject from './ProjectDashboard';
import { Link } from 'react-router-dom';



//const style: React.CSSProperties = { background: '#A9A9A9', padding: '8px 0' ,paddingLeft: '8px 0'};

const ProjectDashboard = ({rowData}) => {

  //  const [rowData, setRowData] = useState();
    console.log("suresh");

    console.log(rowData);
     const revenue = () => {
        let total = 0;
        rowData.forEach(item => {
          total += item.billRate;
        });
        return total;
      };
      const expense = () => {
              let total = 0;
              rowData.forEach(item => {
                total += item.expenseExternal;
              });
              return total;
            };
             const net = () => {
      return revenue()-expense();}
    /*{rowData.map(row => ( console.log({row.billRate});)};*/
    /*const calculateTotalSalary = (rowData) => {
        return rowData.reduce((total, row) => total + row.billRate, 0);
      };
     console.log(calculateTotalSalary(rowData));*/
     if(!rowData)
         return <div>Loading...</div>;
      else
     return (
            <div  style={{ background: '#f0f0f0', padding: '0px' }}>
               <div className="card">
                       <div className="card-content">
                        <span style={{ color: 'blue', fontSize: '20px'}}>{rowData.length }</span>
                        <span style={{ fontSize: '15px' }}> Active projects </span>
                       </div>
                    </div>
                    <div className="card">
                            <div className="card-content">
                             <span style={{ color: 'green', fontSize: '20px'}}>$ {revenue()} </span>
                             <span style={{ fontSize: '15px' }}> Total Revenue </span>
                            </div>
                     </div>

                    <div className="card">
                            <div className="card-content">
                            <span style={{ color: 'red', fontSize: '20px'}}>{expense()}  </span>
                             <span style={{ fontSize: '15px' }}> Total Cost </span>
                            </div>
                     </div>
                    <div className="card">
                            <div className="card-content">
                            <span style={{ color: 'blue', fontSize: '20px'}}>${net()}  </span>
                             <span style={{ fontSize: '15px' }}>Bean Net</span>
                            </div>
                     </div>
          </div>
        );

      };



export default ProjectDashboard;

