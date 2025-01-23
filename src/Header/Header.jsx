import React, { useContext } from 'react';
import { UserOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { Button, Col, Row, Dropdown, Space, Flex } from 'antd';
import logo from '../bean-logo.png';
import AuthContext from '../Authentication/Context/AuthContext';

const Header = () => {
    const { logout } = useContext(AuthContext); // Get logout function from context

    // Define logout handler
    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        localStorage.removeItem("user"); // Remove user data from localStorage (Optional)
    };

    // Define dropdown items
    const items = [
        {
            key: '1',
            label: JSON.parse(localStorage.getItem("user"))?.name || "User",
        },
        {
            key: '2',
            label: (
                <a href="javascript:void(0)" onClick={handleLogout}>
                    Logout
                </a>
            ),
        }
    ];

    return (
        <>
            <div className="headerDiv">
                <Row justify="end">
                    <Col flex="400px">
                        <div className='headerLogo'>
                            <img src={logo} alt="logo" />
                            <b>Bean Infosystems</b>
                        </div>
                    </Col>
                    <Col flex="auto">
                        <Flex gap="small" vertical align='end'>
                            <Flex gap="small" wrap="wrap">
                                <Space>
                                    <Dropdown menu={{ items }} placement="bottomRight">
                                        <Button icon={<SettingOutlined />} />
                                    </Dropdown>
                                </Space>
                                <Space>
                                    <Button icon={<BellOutlined />} />
                                </Space>
                                <Space>
                                    <Dropdown menu={{ items }} placement="bottomRight">
                                        <Button icon={<UserOutlined />} />
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
