import React, { useState, useEffect } from "react";
import { Tag, Button, Form, Input, Row, Col, Select, Modal, Spin } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Invoice.css";

const NewInvoice = ({onClose}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState();
  const [selectedVendorId, setSelectedVendorId] = useState();
  const [selectedProjectId, setSelectedProjectId] = useState();
  const [employees, setEmployeesData] = useState([]);
  const [vendors, setVendorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const[projects, setProjectsData] = useState([]);

  const initialGeneralDetails =  {
    employeeId: null,
    employeeName: "",
    vendorName: "",
    vendorId: null,
    projectId: null,
    projectName:"",
    startDate: "",
    endDate: "",
    billRate: 0,
    hours: 0,
    invoiceId: 0,
    invoiceMonth: "",
    total: 0,
  }
  const [generalDetails, setGeneralDetails] = useState(initialGeneralDetails);
  
  const handleAddNew = () => {
    form.resetFields(); // Reset Ant Design form fields
    setGeneralDetails(initialGeneralDetails); // Reset state
    setSelectedEmployeeId(null); // Clear dropdown selection
    setSelectedVendorId(null);
  };

  // Fetch employees and vendors
  const fetchEmployeesAndVendors = async () => {
    try {
      const [employeesData, vendorsData, projectsData] = await Promise.all([
        fetch("http://localhost:8080/api/v1/employees/getAllEmployees").then(
          (response) => response.json()
        ),
        fetch("http://localhost:8080/api/v1/customers/getAllCustomers").then(
          (response) => response.json()
        ),
        fetch("http://localhost:8080/api/v1/getProjects").then(
          (response) => response.json()
        ),
      ]);
      setEmployeesData(getFlattenedData(employeesData));
      setVendorsData(getFlattenedData(vendorsData));
      setProjectsData(getFlattenedData(projectsData))
    } catch (error) {
      console.error("Error fetching data:", error);
      Modal.error({
        content: "Error fetching employees or vendors. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFlattenedData = (data) => {
    return data.map((dataObj) => ({ ...dataObj })) || [];
  };

  useEffect(() => {
    handleAddNew();
    fetchEmployeesAndVendors();
  }, []);

  // Handle form submission
  const handleSubmit = () => {
    generalDetails.total = generalDetails.hours * generalDetails.billRate;
    console.log("Submitted General Details:", generalDetails);

    // Validate required fields
    if (      
      !generalDetails.vendorId ||
      !generalDetails.invoiceId ||
      !generalDetails.billRate ||
      !generalDetails.invoiceMonth||
      !generalDetails.hours
    ) {
      Modal.error({
        content: "Please fill in all mandatory fields before submitting.",
      });
      return;
    }
    else{
      const updatedDataToSave = [{
        ...generalDetails, // Spread the existing properties
        formatSelectedDate: generalDetails.invoiceMonth, // Add the new property
      }];
      fetch('http://localhost:8080/api/v1/invoice/addInvoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDataToSave),
      })
        .then(response =>{
          if (response && response.status === 201) {          
          Modal.success({
              content: 'Data saved successfully',
              onOk : () =>{
                onClose();
                handleClear()
              }
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
  }  

  const handleCancel = () => {
    //history.push('/project')
    Modal.warning({
        content: 'Are you sure you want to cancel?',
        onOk : () =>{
          onClose();
          handleClear()
        }
    });

}

const handleClear= () => {
  form.resetFields();
  setGeneralDetails({
    employeeId: null,
    employeeName: "",
    vendorName: "",
    vendorId: null,
    startDate: "",
    endDate: "",
    billRate: 0,
    hours: 0,
    invoiceId: 0,
    invoiceMonth: "",
    total: 0,
  });
}

  const handleGeneralData = (value, field) => {
    setGeneralDetails((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleEmployeeChange = (value) => {
    const selectedEmployee = employees.find((employee) => employee.employeeId === value);
    setSelectedEmployeeId(value);    
    handleGeneralData(value, "employeeId");
    handleGeneralData((selectedEmployee?.firstName +" "+ selectedEmployee?.lastName) || "", "employeeName");

  };

  const handleProjectChange = (value) => {
    console.log(projects)
    const selectedProject = projects.find((project) => project.projectId === value);
    console.log(selectedProject)
    setSelectedProjectId(value);    
    handleGeneralData(value, "projectId");
    handleGeneralData((selectedProject?.projectName) || "", "projectName");

  };

  const handleVendorChange = (value) => {
    const selectedVendor = vendors.find((vendor) => vendor.customerId === value);
    setSelectedVendorId(value);
    handleGeneralData(value, "vendorId");
    handleGeneralData(selectedVendor?.customerCompanyName || "", "vendorName");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <p>
        Mandatory fields are marked with <Tag color="error">*</Tag>
      </p>
      <h3>Invoice Details</h3>
      <Form
        layout="vertical"
        form={form}
        autoComplete="off"
        style={{ maxWidth: 600 }}
      >
        <Row gutter={25}>
          <Col span={12}>
            <Form.Item
              label="Employee"
              name="employeeId"
              rules={[{ required: true, message: "Please select an employee" }]}
            >
              <Select
                showSearch
                value={selectedEmployeeId}
                onChange={handleEmployeeChange}
                filterOption={(input, option) =>
                  option?.children
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {employees.map((employee) => (
                  <Option key={employee.employeeId} value={employee.employeeId}>
                    {employee.firstName + " " + employee.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Vendor"
              name="vendorId"
              rules={[{ required: true, message: "Please select a vendor" }]}
            >
              <Select
                showSearch
                value={selectedVendorId}
                onChange={handleVendorChange}
                filterOption={(input, option) =>
                  option?.children
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {vendors.map((vendor) => (
                  <Option key={vendor.customerId} value={vendor.customerId}>
                    {vendor.customerCompanyName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Project"
              name="projectId"
              rules={[{ required: true, message: "Please select an Project" }]}
            >
              <Select
                showSearch
                value={selectedProjectId}
                onChange={handleProjectChange}
                filterOption={(input, option) =>
                  option?.children
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {projects.map((project) => (
                  <Option key={project.projectId} value={project.projectId}>
                    {project.projectName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={25}>
          <Col span={9}>
            <Form.Item
              label="Invoice Id"
              name="invoiceId"
              rules={[{ required: true, message: "Please enter invoice id" }]}
            >
              <Input
                placeholder="Invoice Id"
                onChange={(e) =>
                  handleGeneralData(e.target.value, "invoiceId")
                }
                value={generalDetails.invoiceId}
              />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              label="Billing"
              name="billRate"
              rules={[{ required: true, message: "Please enter bill amount" }]}
            >
              <Input
                type="number"
                placeholder="Bill Amount"
                onChange={(e) =>
                  handleGeneralData(Number(e.target.value), "billRate")
                }
                value={generalDetails.billRate}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Hours"
              name="hours"
              rules={[{ required: true, message: "Please enter Hours" }]}
            >
              <Input
                placeholder="Hours"
                onChange={(e) =>
                  handleGeneralData(e.target.value, "hours")
                }
                value={generalDetails.hours}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={25}>          
          <Col span={12}>
            <Form.Item
              label="Invoice Month"
              name="invoiceMonth"
              rules={[
                { required: true, message: "Please enter invoice month" },
              ]}
            >
              <DatePicker
                selected={generalDetails.invoiceMonth}
                onChange={(date) =>
                  handleGeneralData(date.toISOString().split("T")[0], "invoiceMonth")
                }
                showMonthYearPicker
                dateFormat="MM/yyyy"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Start Date"
              name="startDate"              
            >
              <DatePicker
                selected={generalDetails.startDate}
                onChange={(date) =>
                  handleGeneralData(date.toISOString().split("T")[0], "startDate")
                }
                dateFormat="yyyy-MM-dd"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Date"
              name="endDate"             
            >
              <DatePicker
                selected={generalDetails.endDate}
                onChange={(date) =>
                  handleGeneralData(date.toISOString().split("T")[0], "endDate")
                }
                dateFormat="yyyy-MM-dd"
              />
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
                                    <Button type="primary" htmlType="submit" onClick={handleSubmit}>Submit</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                        </section>
      </Form>
    </>
  );
};

export default NewInvoice;
