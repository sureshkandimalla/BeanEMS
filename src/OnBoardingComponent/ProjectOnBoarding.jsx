import React, { useState } from 'react';
import axios from 'axios';
import { Modal ,Input, Form, Row, Col, Card, Radio, Button, DatePicker } from 'antd';
import { validateEmail } from '../utils';
//import Sidebar from '../../Commons/Sidebar/Sidebar';
//import './EmployeeOnBoarding.scss';
import moment from 'moment';
//import React, { useState, useEffect } from "react";
//import { useLocation, useHistory } from 'react-router-dom'

const ProjectOnBoardingForm = () => {

    const [form] = Form.useForm();
    const [rowData, setRowData] = useState();

   // const history = useHistory();
    //const location = useLocation();
    //const { rowData } = location.state;
    console.log(rowData.employeeId);
    const [generalDetails, setGeneralDetails] = useState({ projectId: '', vendorId: '', employeeId: '', client: '', status: '', projectName: '', startDate: '', endDate: '', invoiceTerm: '', paymentTerm: '' });

    const handleFormSubmit = (generalDetails) => {
        //api should be called here

        axios.post('http://localhost:8080/api/v1/projects/saveOnBoardProject', generalDetails)
            .then(response => {
                if (response && response.status === 200) {
                    console.log("response.data: "+response.data);
                    Modal.success({
                        content: 'Data saved successfully',
                        onOk: () => history.push('/projectDetails', { rowData: rowData })
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

    const handleClear= () => {
        form.resetFields();
        setGeneralDetails({
            projectId: '', vendorId: '', employeeId: '', client: '', status: '', projectName: '', startDate: '', endDate: '', invoiceTerm: '', paymentTerm: ''
          });
    }
    const handleCancel = () => {
        history.push('/project')

    }

    const handleSubmit = () => {
        // Validate the form data
        if (!generalDetails.vendorId || !generalDetails.client || !generalDetails.projectName || !generalDetails.status ) {
          alert('Please fill in all mandatory fields');
          return;
        }
        alert(rowData.employeeId);
        alert(generalDetails.employeeId);
        if(rowData.employeeId !== undefined){
        if( rowData.employeeId != generalDetails.employeeId ){
            alert("Please enter correct EmployeeId");
            return;
        }
    }
        
    console.log("generalDetails: "+generalDetails);
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
                                <Form.Item label="Project Id" name="Project Id" rules={[{ required: true }]}>
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'projectId')} value={generalDetails.projectId} />
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Employee Id" name="Employee Id" rules={[{ required: true }]}>
                                    {/* <Input onChange={(e) => handleGeneralData(e.target.value, 'employeeId')} value={rowData && rowData.employeeId !== undefined ? rowData.employeeId : generalDetails.employeeId} disabled={rowData && rowData.employeeId !== undefined} /> */}                               
                                   < Input onChange={(e) => handleGeneralData(e.target.value, 'employeeId')} value={generalDetails.employeeId} /> 
                                </Form.Item>
                            </Col>
                            <Col span={8} className='form-row'>
                                <Form.Item label="Vendor Id" name="Vendor Id" rules={[{ required: true }]}>
                                    <Input onChange={(e) => handleGeneralData(e.target.value, 'vendorId')} value={generalDetails.vendorId} />
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
