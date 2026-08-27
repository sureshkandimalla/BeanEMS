// EditHoursInvoiceModal.js
import React, { useState, useEffect } from "react";
import { Button, Modal, Input } from "antd";

const EditHoursInvoiceModal = ({ open, onClose, onSave, initialData }) => {
  const [hours, setHours] = useState(initialData.hours || 0);
  // Cosmetic/business label only — not unique, not identity.
  const [invoiceNumber, setInvoiceNumber] = useState(initialData.invoiceNumber || "");

  useEffect(() => {
    setHours(initialData.hours || 0);
    setInvoiceNumber(initialData.invoiceNumber || "");
  }, [initialData]);

  const handleSave = () => {
    if (hours > 0 && invoiceNumber > 0) {
      onSave({ hours, invoiceNumber });
    } else {
      alert("Please enter hours and Invoice Number Greater than Zero");
    }
  };

  return (
    <Modal
      title="Edit Hours and Invoice ID"
      visible={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <div>
        <label>Hours:</label>
        <Input
          type="number"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          min="0"
          max="24"
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label>Invoice #:</label>
        <Input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default EditHoursInvoiceModal;
