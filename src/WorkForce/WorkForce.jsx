import React,{useState} from "react";
import { Tabs,Card, Row, Col, Button, Flex, Drawer, Menu } from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import Newemployee from "../Newemployee/Newemployee";
import Active from "./Active";
import WorkForceList from "./WorkForceList";


const WorkForce=()=>{

  const { TabPane } = Tabs;

  const toggleTabs = (e) => {
  }

  const items = [
    {
        key: 1,
        label: 'Employee List',
        children: <WorkForceList />
    },
    {
        key: 2,
        label: 'Invoices'
    },
]


    const [current, setCurrent] = useState('Active');
    const [open, setOpen] = useState(false);

    const addNewEmployee = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onClick = (e) => {
      console.log('click ', e);
      setCurrent(e.key);
    };
    return(
        <>
        
            <Drawer
                title={`Employee Onboarding`}
                placement="right"
                size="large"
                onClose={onClose}
                open={open}
            >
                <Newemployee />

            </Drawer>
           <Card>
          
           
            <Tabs className='bean-home-tabs' defaultActiveKey="1" onChange={toggleTabs} items={items}
                tabBarExtraContent={<Button type='primary' onClick={addNewEmployee}><PlusOutlined /> Add New Employee</Button>}>
            </Tabs>
       
            
            </Card> 
        </>
    );
}
export default WorkForce