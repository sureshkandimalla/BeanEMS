import React, { useState } from "react";
import {
  Tag,
  Button,
  Form,
  Input,
  Radio,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Modal,
} from "antd";
import "./Vendor.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
const usCountryTelList = [
  //TODO later get from db/api call
  {
    value: "US",
    label: "US",
  },
  {
    value: "IN",
    label: "IN",
  },
];
const NewVendor = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [generalDetails, setGeneralDetails] = useState({
    vendorName: "",
    vendorCompanyName: "",
    ein: "",
    phone: "",
    emailId: "",
    webSite: "",
    startDate: null,
    endDate: null,
    zipCode: "",
  });

  const handleSubmit = () => {
    console.log("generalDetails: " + generalDetails);
    // Validate the form data
    if (
      !generalDetails.vendorName ||
      !generalDetails.vendorCompanyName ||
      !generalDetails.ein ||
      !generalDetails.zipCode ||
      !generalDetails.phone ||
      !generalDetails.emailId
    ) {
      alert("Please fill in all mandatory fields");
      return;
    }
    handleFormSubmit(generalDetails);
  };
  const handleFormSubmit = (generalDetails) => {
    axios
      .post(
        "http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/customers/saveOnBoardDetails",
        generalDetails,
      )
      .then((response) => {
        if (response && response.data) {
          // Display success message
          Modal.success({
            content: "Data saved successfully",
            onOk: () => navigate("http://localhost:4000/"),
          });
        } else {
          // Handle other cases
          console.log("Response data does not have expected value");
        }
      })
      .catch((error) => {
        console.error("Error posting data:", error);
        // Display error message
        Modal.error({
          content: "Error posting data. Please try again later.",
        });
      });
  };

  const handleGeneralData = (value, field) => {
    setGeneralDetails((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <>
      <p>
        Mandatory fields are marked with <Tag color="error">*</Tag>
      </p>
      <h3>Personal Details </h3>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
      >
        <Row gutter={25}>
          <Col span={12}>
            <Form.Item
              label="Vendor Name"
              name="vendorName"
              rules={[
                {
                  required: true,
                  message: "Please Enter Vendor Name",
                },
              ]}
            >
              <Input
                placeholder="Vendor Name"
                onChange={(e) =>
                  handleGeneralData(e.target.value, "vendorName")
                }
                value={generalDetails.vendorName}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Vendor Company Name"
              name="vendorCompanyName"
              rules={[
                {
                  required: true,
                  message: "Please Enter vendor Company Name",
                },
              ]}
            >
              <Input
                placeholder="Vendor Company Name"
                onChange={(e) =>
                  handleGeneralData(e.target.value, "vendorCompanyName")
                }
                value={generalDetails.vendorCompanyName}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={25}>
          <Col span={12}>
            <Form.Item
              label="ein"
              name="ein"
              rules={[
                {
                  required: true,
                  message: "Please Enter ein",
                },
              ]}
            >
              <Input
                placeholder="ein"
                onChange={(e) => handleGeneralData(e.target.value, "ein")}
                value={generalDetails.ein}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="WebSite"
              name="webSite"
              rules={[
                {
                  required: true,
                  message: "Please Enter webSite",
                },
              ]}
            >
              <Input
                placeholder="webSite"
                onChange={(e) => handleGeneralData(e.target.value, "webSite")}
                value={generalDetails.webSite}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="emailId"
              rules={[
                {
                  required: true,
                  message: "Please Enter Email",
                },
              ]}
            >
              <Input
                placeholder="you@company.com"
                onChange={(e) => handleGeneralData(e.target.value, "emailId")}
                value={generalDetails.emailId}
                type="email"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please Enter Phone number",
                },
              ]}
            >
              <Space direction="vertical" size="middle">
                <Space.Compact>
                  <Select defaultValue="" options={usCountryTelList} />
                  <Input
                    placeholder="+1 (555) 000-000"
                    onChange={(e) => handleGeneralData(e.target.value, "phone")}
                    value={generalDetails.phone}
                  />
                </Space.Compact>
              </Space>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[
                {
                  required: true,
                  message: "Please Enter Start Date",
                },
              ]}
            >
              <DatePicker
                onChange={(date, dateString) =>
                  handleGeneralData(dateString, "startDate")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="End Date" name="endDate">
              <DatePicker
                onChange={(date, dateString) =>
                  handleGeneralData(dateString, "endDate")
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <h3>Address</h3>
        <Col span={24}>
          <Form.Item label="Street Address" name="streetAddress">
            <Input
              placeholder="Add address"
              onChange={(e) =>
                handleGeneralData(e.target.value, "streetAddress")
              }
              value={generalDetails.streetAddress}
            />
          </Form.Item>
        </Col>
        <Row gutter={25}>
          <Col span={12}>
            <Form.Item
              label="City"
              name="city"
              rules={[
                {
                  required: false,
                  message: "Please Enter city",
                },
              ]}
            >
              <Input
                placeholder="city"
                onChange={(e) => handleGeneralData(e.target.value, "city")}
                value={generalDetails.city}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="State"
              name="state"
              rules={[
                {
                  required: false,
                  message: "Please Enter state",
                },
              ]}
            >
              <Input
                placeholder="state"
                onChange={(e) => handleGeneralData(e.target.value, "state")}
                value={generalDetails.state}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Zip Code/Postal Code"
              name="zipCode"
              rules={[
                {
                  required: true,
                  message: "Please Enter Zip code",
                },
              ]}
            >
              <Input
                placeholder="Enter Zip Code"
                onChange={(e) => handleGeneralData(e.target.value, "zipCode")}
                value={generalDetails.zipCode}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Country"
              name="country"
              rules={[
                {
                  required: true,
                  message: "Please select an option",
                },
              ]}
            >
              <Select
                defaultValue="us"
                options={usCountryTelList}
                onChange={(value) => handleGeneralData(value, "country")}
                value={generalDetails.country}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={handleSubmit} block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
export default NewVendor;
