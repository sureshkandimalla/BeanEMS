import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Form,
  Row,
  Col,
  Card,
  Button,
  DatePicker,
  Select,
  Spin,
} from "antd";
import moment from "moment";
import axios from "axios";

const WorkOrderForm = ({ onClose }) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [projectName, setProjectName] = useState(
    localStorage.getItem("projectName") || "",
  );
  const projectId = localStorage.getItem("projectId");
  // const projectName = localStorage.getItem('projectName');
  console.log(projectId);
  console.log(projectName);
  const [generalDetails, setGeneralDetails] = useState({
    wageId: null,
    wageType: "",
    projectId: projectId,
    // vendorName: "",
    // vendorId: null,
    // clientName: "",
    // clientId: null,
    startDate: "",
    endDate: "",
    wage: 0,
  });

  const handleGeneralData = (value, field) => {
    setGeneralDetails((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Add selected employee and vendor IDs to generalDetails
    const updatedDetails = {
      ...generalDetails,
    };

    console.log("Submitted Details:", updatedDetails);

    // Validate the form data
    // !updatedDetails.clientName ||
    if (!updatedDetails.wage) {
      alert("Please fill in all mandatory fields");
      return;
    }

    handleFormSubmit(updatedDetails);
  };

  const handleFormSubmit = (data) => {
    console.log(data);
    axios
      .post(
        "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/wages/wage",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        if (response && response.status === 200) {
          console.log("response.data: " + response.data);
          Modal.success({
            content: "Data saved successfully",
            onOk: onClose,
          });
        } else {
          console.log("Response data does not have expected value");
        }
      })
      .catch((error) => {
        console.error("Error posting data:", error);
        Modal.error({
          content: "Error posting data. Please try again later.",
        });
      });
  };

  const handleClear = () => {
    form.resetFields(); // Resets the Ant Design form fields
    setGeneralDetails({
      wageId: null,
      projectId: projectId,
      wageType: "",
      // vendorName: "",
      // vendorId: null,
      // clientName: "",
      // clientId: null,
      startDate: "",
      endDate: "",
      wage: 0,
    });
  };

  //   if (loading) {
  //     return (
  //       <div style={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         height: '100vh'
  //       }}>
  //         <Spin size="large" />
  //       </div>
  //     );
  //   }

  return (
    <div className="employee-onboarding-form">
      <h3 className="header">Onboard Project(s)</h3>
      <Card className="employee-onboard-card">
        <Form form={form}>
          <Row gutter={30}>
            <Col span={8} className="form-row">
              <Form.Item label="Project Name" name="projectName">
                <span>{projectName || "N/A"}</span>
              </Form.Item>
            </Col>
            {/* <Col span={8} className='form-row'>
              <Form.Item label="Employee" name="employeeId" rules={[{ required: true, message: 'Please select an employee' }]}>
                <Select value={selectedEmployeeId} onChange={handleEmployeeChange}>
                  {employees.map((employee) => (
                    <Option key={employee.employeeId} value={employee.employeeId}>
                      {employee.firstName + ' ' + employee.lastName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}

            {/* <Col span={8} className='form-row'>
              <Form.Item label="Vendor" name="vendorId">
                <Select value={selectedVendorId} onChange={handleVendorChange}>
                  {vendors.map((vendor) => (
                    <Option key={vendor.customerId} value={vendor.customerId}>
                      {vendor.customerCompanyName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}

            <Col span={8} className="form-row">
              <Form.Item
                label="Bill Rate"
                name="wage"
                rules={[{ required: true }]}
              >
                <Input
                  type="number"
                  onChange={(e) =>
                    handleGeneralData(Number(e.target.value), "wage")
                  }
                  value={generalDetails.wage}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={30}>
            {/* <Col span={8} className='form-row'>
              <Form.Item label="Client" name="clientName" rules={[{ required: true }]}>
                <Input onChange={(e) => handleGeneralData(e.target.value, 'clientName')} value={generalDetails.clientName} />
              </Form.Item>
            </Col> */}

            {/* <Col span={8} className='form-row'>
              <Form.Item label="Project Name" name="projectName">
                <Input value={projectName} />
              </Form.Item>
            </Col> */}
          </Row>

          <Row gutter={30}>
            <Col span={8} className="form-row">
              <Form.Item label="Start Date">
                <DatePicker
                  onChange={(date, dateString) =>
                    handleGeneralData(dateString, "startDate")
                  }
                  value={
                    generalDetails.startDate
                      ? moment(generalDetails.startDate)
                      : null
                  }
                />
              </Form.Item>
            </Col>

            <Col span={8} className="form-row">
              <Form.Item label="End Date">
                <DatePicker
                  onChange={(date, dateString) =>
                    handleGeneralData(dateString, "endDate")
                  }
                  value={
                    generalDetails.endDate
                      ? moment(generalDetails.endDate)
                      : null
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={30}>
            <Col span={8} className="form-row">
              <Button type="primary" onClick={handleClear}>
                Clear
              </Button>
            </Col>

            <Col span={8} className="form-row">
              <Button type="primary" onClick={onClose}>
                Cancel
              </Button>
            </Col>

            <Col span={8} className="form-row">
              <Button type="primary" onClick={handleSubmit}>
                Onboard
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default WorkOrderForm;
