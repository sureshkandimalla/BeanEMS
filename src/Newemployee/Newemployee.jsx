import React, { useState }from "react";
import { Tag,Button, Form, Input, Radio,Row,Col,DatePicker,Select,Space,Modal } from 'antd';
import "./Newemployee.css";
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';

const onFinish = (values) => {
    console.log('Success:', values);
};
const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
};
const usCountryTelList=[
  //TODO later get from db/api call
  {
    value: 'US',
    label: 'US',
  },
  {
    value: 'IN',
    label: 'IN',
  },
]
const taxTermsList=[
  {
    value: 'W2',
    label: 'W2',
  },
]
const employementTypeList=[
  {
    value: 'C2C',
    label: 'C2C',
  },
  {
    value: 'W2',
    label: 'W2',
  },
  {
    value: 'Full-Time',
    label: 'Full-Time',
  },
  {
    value: '1099',
    label: '1099',
  },


]
const workingStatusList =[
  {
    value: 'Active',
    label: 'Active',
  },
  {
    value: 'Bench',
    label: 'Bench',
  },
  {
    value: 'OnBoarding',
    label: 'On-Boarding',
  },
  {
    value: 'NewHires',
    label: 'New Hires',
  },

]
const workAuthorizationList =[
  {
    value: 'Citizen',
    label: 'Citizen',
  },
  {
    value: 'GC',
    label: 'GC',
  },
  {
    value: 'H1B',
    label: 'H1B',
  },
  {
    value: 'L1',
    label: 'L1',
  },
  {
    value: 'E3',
    label: 'E3',
  },
  {
    value: 'OPT',
    label: 'OPT',
  },
]


const Newemployee =()=>{
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [generalDetails, setGeneralDetails] = useState({ firstName: '', lastName: '', designation:'', ssn: '', dob: '', gender: '', emailId: '', phoneNumber: '', streetAddress: '', city: '', state: '', zipCode: '', country: '' , employmentType: '', taxTerms: '',status:'' , location: '', workAuthorization:'' , startDate: '', endDate:'', referredBy:''});

    const handleSubmit = () => {
      console.log("generalDetails: "+generalDetails);
      // Validate the form data
      if (!generalDetails.firstName || !generalDetails.lastName || !generalDetails.emailId || !generalDetails.zipCode || !generalDetails.gender || !generalDetails.ssn || !generalDetails.phoneNumber || !generalDetails.designation) {
        alert('Please fill in all mandatory fields');
        return;
      }
      handleFormSubmit(generalDetails);
    };
    const handleFormSubmit = (generalDetails) => {

      axios.post('http://localhost:8080/api/v1/employees/saveOnBoardDetails', generalDetails)
          .then(response => {
              if (response && response.data) {
                  // Display success message
                  Modal.success({
                      content: 'Data saved successfully',
                      onOk: () => navigate('http://localhost:4000/')
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

    const handleGeneralData = (value, field) => {
      setGeneralDetails(prevState => ({
          ...prevState,
          [field]: value
      }));
    }

    return(
        <>
        <p>Mandatory fields are marked with <Tag color="error">*</Tag></p>
          <h3>Personal Details </h3>
          <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      style={{
        maxWidth:  600,
      }}
      initialValues={{
        remember: true,
      }}
    >
     <Row gutter={25}>
      <Col span={12}>
      <Form.Item label="First Name" name="firstName"  rules={[
        {
          required: true,
          message: 'Please Enter First Name',
        },
      ]}>
        <Input placeholder="First Name" onChange={(e) => handleGeneralData(e.target.value, 'firstName')} value={generalDetails.firstName}/>
      </Form.Item>
      </Col>
      <Col span={12}>
      <Form.Item label="Last Name" name="lastName"  rules={[
        {
          required: true,
          message: 'Please Enter Last Name',
        },
      ]}>
        <Input placeholder="Last Name" onChange={(e) => handleGeneralData(e.target.value, 'lastName')} value={generalDetails.lastName}/>
      </Form.Item>
      </Col>
     </Row>
     <Row gutter={25}>
      <Col span={12}>
      <Form.Item label="Designation" name="designation"  rules={[
        {
          required: true,
          message: 'Please Enter Designation',
        },
      ]}>
        <Input placeholder="Designation" onChange={(e) => handleGeneralData(e.target.value, 'designation')} value={generalDetails.designation}/>
      </Form.Item>
      </Col>
      <Col span={12}>
      <Form.Item label="SSN" name="ssn"  rules={[
        {
          required: true,
          message: 'Please Enter ssn',
        },
      ]}>
        <Input placeholder="ssn" onChange={(e) => handleGeneralData(e.target.value, 'ssn')} value={generalDetails.ssn}/>
      </Form.Item>
      </Col>
     </Row>
     <Row>
      <Col span={24}>
      <Form.Item label="Date of Birth" name="dob"  rules={[
        {
          required: true,
          message: 'Please Enter Dob',
        },
      ]}>
          <DatePicker  onChange={(date, dateString) => handleGeneralData(dateString, 'dob')}/>
        </Form.Item>
      </Col>
      <Col span={24}>
      <Form.Item name="gender" label="Gender"  rules={[
        {
          required: true,
          message: 'Please Select Gender',
        },
      ]}>
      <Radio.Group onChange={e => handleGeneralData(e.target.value, 'gender')} value={generalDetails.gender}>
        <Radio value="m">Male</Radio>
        <Radio value="f">Female</Radio>
        <Radio value="nd">I Choose not to disclose </Radio>
      </Radio.Group>
    </Form.Item>
      </Col>
      </Row>
      <Row gutter={16}>
      <Col span={12}>
      <Form.Item label="Email" name="emailId"  rules={[
        {
          required: true,
          message: 'Please Enter Email',
        },
      ]}>
        <Input placeholder="you@company.com" onChange={(e) => handleGeneralData(e.target.value, 'emailId')} value={generalDetails.emailId} type="email" />
      </Form.Item>
      </Col>
      <Col span={12}>
      <Form.Item label="Phone Number" name="phoneNumber"  rules={[
        {
          required: true,
          message: 'Please Enter Phone number',
        },
      ]}>
        <Space direction="vertical" size="middle">
        <Space.Compact>
      <Select defaultValue="" options={usCountryTelList} />
      <Input  placeholder="+1 (555) 000-000" onChange={(e) => handleGeneralData(e.target.value, 'phoneNumber')} value={generalDetails.phoneNumber} />
    </Space.Compact>
    </Space>
      </Form.Item>
      </Col>
      </Row>
      <Col span={24}>
      <Form.Item label="Street Address" name="streetAddress">
        <Input placeholder="Add address" onChange={(e) => handleGeneralData(e.target.value, 'streetAddress')} value={generalDetails.streetAddress}/>
      </Form.Item>
      
        </Col>
    <Row gutter={25}>
      <Col span={12}>
      <Form.Item label="City" name="city"  rules={[
        {
          required: false,
          message: 'Please Enter city',
        },
      ]}>
        <Input placeholder="city" onChange={(e) => handleGeneralData(e.target.value, 'city')} value={generalDetails.city}/>
      </Form.Item>
      </Col>
      <Col span={12}>
      <Form.Item label="State" name="state"  rules={[
        {
          required: false,
          message: 'Please Enter state',
        },
      ]}>
        <Input placeholder="state" onChange={(e) => handleGeneralData(e.target.value, 'state')} value={generalDetails.state}/>
      </Form.Item>
      </Col>
     </Row>

        <Row gutter={16}>
          <Col span={12}>
          <Form.Item label="Zip Code/Postal Code" name="zipCode"  rules={[
        {
          required: true,
          message: 'Please Enter Zip code',
        },
      ]}>
        <Input placeholder="Enter Zip Code"  onChange={(e) => handleGeneralData(e.target.value, 'zipCode')} value={generalDetails.zipCode}/>
      </Form.Item>
    
          </Col>
          <Col span={12}>
          <Form.Item label="Country" name="country"  rules={[
        {
          required: true,
          message: 'Please select an option',
        },
      ]}>
         <Select defaultValue="us" options={usCountryTelList} onChange={(value) => handleGeneralData(value, 'country')} value={generalDetails.country}/>
      </Form.Item>
          </Col>
        </Row>
        <h3>Employment Status</h3>
        <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Employement Type" name="employmentType"  rules={[
        {
          required: true,
          message: 'Please select an option',
        },
      ]}>
         <Select   options={employementTypeList} onChange={(value) => handleGeneralData(value, 'employmentType')} value={generalDetails.employmentType}/>
      </Form.Item>
      </Col>
      <Col span={12}>
          <Form.Item label="Tax Terms" name="taxTerms"  rules={[
        {
          required: false,
          message: 'Please select an option',
        },
      ]}>
         <Select  options={taxTermsList} onChange={(value) => handleGeneralData(value, 'taxTerms')} value={generalDetails.taxTerms} />
      </Form.Item>
      </Col>
      <Col span={12}>
          <Form.Item label="Status" name="status"  rules={[
        {
          required: true,
          message: 'Please select an option',
        },
      ]}>
         <Select  options={workingStatusList} onChange={(value) => handleGeneralData(value, 'status')} value={generalDetails.status}/>
      </Form.Item>
      </Col>
      <Col span={12}>
      <Form.Item label="Location" name="location" >
        <Input placeholder="" onChange={(e) => handleGeneralData(e.target.value, 'location')} value={generalDetails.location}/>
      </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Start Date" name="startDate"  rules={[
        {
          required: true,
          message: 'Please Enter Start Date',
        },
      ]}>
          <DatePicker  onChange={(date, dateString) => handleGeneralData(dateString, 'startDate')}/>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="End Date" name="endDate">
          <DatePicker  onChange={(date, dateString) => handleGeneralData(dateString, 'endDate')}/>
        </Form.Item>
      </Col>
      <Col span={12}>
          <Form.Item label="Current Work Authorization Type" name="workAuthorization"  rules={[
        {
          required: true,
          message: 'Please select an option',
        },
      ]}>
         <Select  options={workAuthorizationList} onChange={(value) => handleGeneralData(value, 'workAuthorization')} value={generalDetails.workAuthorization}/>
      </Form.Item>
      </Col>
      <Col span={12}>
      <Form.Item label="ReferredBy" name="referredBy" >
        <Input placeholder="" onChange={(e) => handleGeneralData(e.target.value, 'referredBy')} value={generalDetails.referredBy}/>
      </Form.Item>
      </Col>
        </Row>
      <Form.Item >
        <Button type="primary" htmlType="submit" onClick={handleSubmit} block>Submit</Button>
      </Form.Item>
    </Form>
        </>
    );
}
export default Newemployee;