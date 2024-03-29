import React from 'react';
import { UserOutlined,SettingOutlined ,BellOutlined} from '@ant-design/icons';
import { Button,Col, Row,Dropdown,Space,Flex} from 'antd';
import logo from '../bean-logo.png';
const items = [
    {
      key: '1',
      label: 'Suresh',
    },
    {
      key: '2',
      label: (
        <a  href="javascript:void(0)">
          Logout
        </a>
      ),
    }
  ];
const Header = () => {

    return (
        <>
           <div className="headerDiv">
        <Row justify="end">
        <Col flex="400px"><div className='headerLogo'><img src={logo}/><b>Bean</b> Info Systems</div></Col>
        <Col flex="auto">
      <Flex gap="small" vertical align='end'>
      <Flex gap="small"  wrap="wrap">
      <Space>
        <Dropdown
        menu={{
          items
        }}
        placement="bottomRight"
      >
        <Button 
          icon={<SettingOutlined />}/>
      </Dropdown>
      </Space>
      <Space>
      <Button 
          icon={<BellOutlined />}/>
      </Space>
      <Space>
        <Dropdown
        menu={{
          items
        }}
        placement="bottomRight"
      >
        <Button 
          icon={<UserOutlined />}/>
      </Dropdown>
      </Space>
        </Flex>
        </Flex>
      </Col>
    </Row>
    </div>
        </>
    );
};

export default Header;
