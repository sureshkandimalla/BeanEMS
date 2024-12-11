import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal ,Input, Form, Row, Col, Card, Radio, Button, DatePicker, Select, Spin } from 'antd';
import { validateEmail } from '../utils';
//import Sidebar from '../../Commons/Sidebar/Sidebar';
//import './EmployeeOnBoarding.scss';
import moment from 'moment';
//import React, { useState, useEffect } from "react";
//import { useLocation } from 'react-router-dom'

const ProjectOnBoardingForm = ({ onClose }) => {
    const { Option } = Select;
    const [form] = Form.useForm();
    const [rowData, setRowData] = useState();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState();
    const [selectedVendorId, setSelectedVendorId] = useState();
    const [employees, setEmployeesData] = useState()
    const [vendors, setVendorsData] = useState();
    const [loading, setLoading] = useState(true);


    const fetchEmployeesAndVendors = async () => {
        try {
            const [employeesData, vendorsData] = await Promise.all([
                fetch('http://localhost:8080/api/v1/employees/getEmployees').then(response => response.json()),
                fetch('http://localhost:8080/api/v1/customers/getAllCustomers').then(response => response.json())
            ]);
            
            setEmployeesData(getFlattenedData(employeesData));
            setVendorsData(getFlattenedData(vendorsData));
        } catch (error) {
            console.error('Error fetching data:', error);
            Modal.error({
                content: 'Error fetching employees or customers. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Call fetchEmployeesAndCustomers when the component mounts
    useEffect(() => {
        fetchEmployeesAndVendors();
    }, []);
    console.log(employees);
    console.log(vendors);
    const handleEmployeeChange = (value) => {
        setSelectedEmployeeId(value);
      };
    
      const handleVendorChange = (value) => {
        setSelectedVendorId(value);
      };

    //const history = useHistory();
    //const location = useLocation();
    //const { rowData } = location.state;
    const [generalDetails, setGeneralDetails] = useState({
        projectId: null,
        projectName: "",
        employeeId: null,
        employeeName: "",
        vendorName: "",
        vendorId: null,
        clientName: "",
        client: "",
        clientId: null,
        startDate: "", // ISO string format
        endDate: "",   // ISO string format
        billRate: 0,
        employeePay: 0,
        expenseInternal: 0,
        expenseExternal: 0,
        net: 0,
        status: "",
        invoiceTerm: "",
        paymentTerm: "",
        hours: 0,
        invoiceId: 0,
        Billing: 0,
        total: 0
    });

    const handleFormSubmit = (generalDetails) => {
        //api should be called here

        axios.post('http://localhost:8080/api/v1/saveOnBoardProject', generalDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
                if (response && response.status === 200) {
                    console.log("response.data: "+response.data);
                    Modal.success({
                        content: 'Data saved successfully',
                        onOk: onClose
                    });
                } else {
                    // Handle other cases
                    console.log('Response data does not have expected value');
                }
            })
            .catch(error => {
                console.error('Error posting data:', error);
                // Display error message
                Modal.error({
                    content: 'Error posting data. Please try again later.'
                });
            });
    }

    const getFlattenedData = (data) => {

        let updatedData = data.map((dataObj) => {
        return { ...dataObj}
    
           // return { ...dataObj,...dataObj.assignments[0],...dataObj.employee.firstName.value, ...dataObj.employee.employeeAssignments[0],...dataObj.customer,...dataObj.billRates[0] }
        });
        console.log(updatedData)
        return updatedData || [];
    }

    const handleClear= () => {
        form.resetFields();
        setGeneralDetails({
            projectId: null,
            projectName: "",
            employeeId: null,
            employeeName: "",
            vendorName: "",
            vendorId: null,
            clientName: "",
            client: "",
            clientId: null,
            startDate: "", // ISO string format
            endDate: "",   // ISO string format
            billRate: 0,
            employeePay: 0,
            expenseInternal: 0,
            expenseExternal: 0,
            net: 0,
            status: "",
            invoiceTerm: "",
            paymentTerm: "",
            hours: 0,
            invoiceId: 0,
            Billing: 0,
            total: 0
        });
    }
    const handleCancel = () => {
        //history.push('/project')
        Modal.warning({
            content: 'Are you sure you want to cancel?',
            onOk: onClose
        });

    }

    const handleSubmit = () => {

        if(selectedEmployeeId && selectedVendorId){
            generalDetails.employeeId = selectedEmployeeId;
            generalDetails.vendorId = selectedVendorId;
        }
        // Validate the form data
        if ( !generalDetails.vendorId || !generalDetails.vendorId || !generalDetails.client || !generalDetails.projectName || !generalDetails.status || !generalDetails.billRate ) {
          alert('Please fill in all mandatory fields');
          return;
        }
    //     alert(rowData.employeeId);
    //     alert(generalDetails.employeeId);
    //     if(rowData.employeeId !== undefined){
    //     if( rowData.employeeId != generalDetails.employeeId ){
    //         alert("Please enter correct EmployeeId");
    //         return;
    //     }
    // }
        
    //console.log("generalDetails: "+generalDetails);
        // Make API call with formData
        handleFormSubmit(generalDetails);
    
        // Clear the form after submission
        //handleClear();
      };

    const handleGeneralData = (value, field) => {
        setGeneralDetails(prevState => ({
            ...prevState,
            [field]: value
        }));
    }
console.log(loading);
if (loading) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh' // Full viewport height
        }}>
            <Spin size="large" />
        </div>
    );
}

    return (
        
            <div className='employee-onboarding-form'>
                <h3 className='header'>Onboard Project(s)</h3>
                <Card className='employee-onboard-card'>
                <Form form={form}>
                        <Row className='card-header-section'>
                            <Col>
                                <h4 className='header'>Project Details</h4>
                            </Col>
                            <Col>
                                <span>Mandatory Fields are marked with <span className='asterisk'>*</span></span>
                            </Col>
                        </Row>
                        <Row gutter={30}>
                            <Col span={8} className='form-row'>
                            <Form.Item label="Employee" name="employeeId" rules={[{ required: true, message: 'Please select an employee' }]}>
        <Select showSearch value={selectedEmployeeId} onChange={handleEmployeeChange} filterOption={(input, option) =>
      option?.children?.toLowerCase().includes(input.toLowerCase())
    }>
          {employees.map((employee) => (
            <Option key={employee.employeeId} value={employee.employeeId}>
              {employee.name}
            </Option>
          ))}
          
        </Select>
      </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                            <Form.Item label="Vendor" name="vendorId" rules={[{ required: true, message: 'Please select a vendor' }]}>
        <Select showSearch value={selectedVendorId} onChange={handleVendorChange} filterOption={(input, option) =>
      option?.children?.toLowerCase().includes(input.toLowerCase())
    }>
          {vendors.map((vendor) => (
            <Option key={vendor.customerId} value={vendor.customerId}>
              {vendor.customerCompanyName}
            </Option>
          ))}
        </Select>
      </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Bill Rate" name="Bill Rate" rules={[{ required: true }]}>
                                    <Input  type="number" onChange={(e) => handleGeneralData(Number(e.target.value), 'billRate')}  value={generalDetails.billRate} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={30}>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Client" name="Client" rules={[{ required: true }]}>
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'client')} value={generalDetails.client} />
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Project Name" name="project Name" rules={[{ required: true }]}>
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'projectName')} value={generalDetails.projectName} />
                                </Form.Item>
                            </Col>
                            {/* <Col span={8} className='form-row'>
                                <Form.Item label="WebSite" name="webSite" >
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'webSite')} value={generalDetails.webSite} />
                                </Form.Item>
                            </Col>   */}
                        </Row>
                        <Row gutter={30}>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Start Date">
                                <DatePicker
                                    onChange={(date, dateString) => handleGeneralData(dateString, 'startDate')}
                                    className='dobDatepicker'
                                    value={generalDetails.startDate ? moment(generalDetails.startDate) : null}
                                    //disabledDate={current => current && current < moment().startOf('day')}
                                />
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="End Date">
                                <DatePicker
                                    onChange={(date, dateString) => handleGeneralData(dateString, 'endDate')}
                                    className='dobDatepicker'
                                    value={generalDetails.endDate ? moment(generalDetails.endDate) : null}
                                    //disabledDate={current => current && current < moment().startOf('day')}
                                />
                                </Form.Item>
                            </Col>   
                        </Row>
                        <Row gutter={30}>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Invoice Term" name="Invoice Term" >
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'invoiceTerm')} value={generalDetails.invoiceTerm} />
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Payment Term" name="Payment Term" >
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'paymentTerm')} value={generalDetails.paymentTerm} />
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Status" name="Status" rules={[{ required: true }]}>
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'status')} value={generalDetails.status} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <hr />
                        <section>
                        <Row gutter={30}>
                            <Col span={8} className='form-row'>
                                <Form.Item>
                                    <Button type="primary" onClick={handleClear}>Clear</Button>
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item>
                                    <Button type="primary" onClick={handleCancel}>Cancel</Button>
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" onClick={handleSubmit}>Onboard</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                        </section>
                   
                        </Form>
                </Card>
            </div>
       
    )
}

export default ProjectOnBoardingForm;
