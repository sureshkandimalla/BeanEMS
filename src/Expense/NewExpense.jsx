import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Row, Col, Select, Modal } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../Invoice/Invoice.css";
import API_ENDPOINTS, { expenseStatusList, expenseTypeList } from "../config";

const { Option } = Select;
const { TextArea } = Input;

// Same UTC-parse pitfall documented in NewInvoice.jsx: `new Date(isoString)`
// parses as UTC midnight, which renders as the *previous* day in any
// timezone behind UTC. These convert via local Y/M/D components instead.
const toLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (iso) => {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const NewExpense = ({ onClose, employeeId }) => {
  const [form] = Form.useForm();
  const [employees, setEmployeesData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const initialDetails = {
    employeeId: employeeId || null,
    description: "",
    expenseType: null,
    amount: null,
    reimbursable: true,
    expenseDate: toLocalISODate(new Date()),
    status: "Pending",
  };
  const [details, setDetails] = useState(initialDetails);

  useEffect(() => {
    fetch(API_ENDPOINTS.getEmployees)
      .then((response) => response.json())
      .then((data) => setEmployeesData(data || []))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      employeeId: details.employeeId,
      description: details.description,
      expenseType: details.expenseType,
      amount: details.amount,
      reimbursable: details.reimbursable,
      expenseDate: parseLocalDate(details.expenseDate),
      status: details.status,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (
      !details.employeeId ||
      !details.description ||
      !details.expenseType ||
      !details.amount ||
      !details.expenseDate
    ) {
      Modal.error({ content: "Please fill in all mandatory fields before submitting." });
      return;
    }

    setSubmitting(true);
    fetch(API_ENDPOINTS.addExpense, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    })
      .then((response) => {
        if (response.status === 201) {
          Modal.success({ content: "Expense created successfully." });
          onClose();
        } else {
          Modal.error({ content: "Failed to create expense. Please try again." });
        }
      })
      .catch((error) => {
        console.error("Error creating expense:", error);
        Modal.error({ content: "Failed to create expense. Please try again." });
      })
      .finally(() => setSubmitting(false));
  };

  const handleClear = () => {
    Modal.warning({
      content: "This will reset all the values.",
      onOk: () => {
        form.resetFields();
        setDetails(initialDetails);
      },
    });
  };

  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Employee"
            name="employeeId"
            rules={[{ required: true, message: "Please select an employee" }]}
          >
            <Select
              showSearch
              placeholder="Select employee"
              value={details.employeeId}
              disabled={!!employeeId}
              onChange={(value) => setDetails((prev) => ({ ...prev, employeeId: value }))}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map((employee) => (
                <Option key={employee.employeeId} value={employee.employeeId}>
                  {employee.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea
              rows={2}
              value={details.description}
              onChange={(e) => setDetails((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Expense Type"
            name="expenseType"
            rules={[{ required: true, message: "Please select an expense type" }]}
          >
            <Select
              placeholder="Select expense type"
              value={details.expenseType}
              onChange={(value) => setDetails((prev) => ({ ...prev, expenseType: value }))}
            >
              {expenseTypeList.map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Please enter an amount" }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: "100%" }}
              value={details.amount}
              onChange={(value) => setDetails((prev) => ({ ...prev, amount: value }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Reimbursable" name="reimbursable">
            <Select
              value={details.reimbursable}
              onChange={(value) => setDetails((prev) => ({ ...prev, reimbursable: value }))}
            >
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Date"
            name="expenseDate"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              className="left-panel"
              selected={parseLocalDate(details.expenseDate)}
              onChange={(date) =>
                setDetails((prev) => ({ ...prev, expenseDate: date ? toLocalISODate(date) : "" }))
              }
              dateFormat="MM/dd/yyyy"
              placeholderText="Select the date"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Status" name="status">
            <Select
              value={details.status}
              onChange={(value) => setDetails((prev) => ({ ...prev, status: value }))}
            >
              {expenseStatusList.map((s) => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify="end" gutter={16}>
        <Col>
          <Button onClick={handleClear}>Clear</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" loading={submitting} onClick={handleSubmit}>
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default NewExpense;
