// EditHoursInvoiceModal.js
import React, { useState, useEffect } from "react";
import { Button, Modal, Input } from "antd";

const EditHoursInvoiceModal = ({ open, onClose, onSave, initialData }) => {
  const [hours, setHours] = useState(initialData.hours || 0);
  const [invoiceId, setInvoiceId] = useState(initialData.invoiceId || "");

  useEffect(() => {
    setHours(initialData.hours || 0);
    setInvoiceId(initialData.invoiceId || "");
  }, [initialData]);

  const handleSave = () => {
    if(hours>0 && invoiceId>0){
    onSave({ hours, invoiceId });
    }
    else{
        alert("Please enter hours and Invoice Id Greater than Zero")
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
        </Button>
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
        <label>Invoice ID:</label>
        <Input
          type="text"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default EditHoursInvoiceModal;
