import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
const { Option } = Select;

const StatusEditor = forwardRef((props, ref) => {
  const options = ['Active', 'Inactive'];
  const [value, setValue] = useState(props.value || options[0]);

  useImperativeHandle(ref, () => ({
    getValue() {
      return value;
    },
    isPopup() {
      return false;
    }
  }));

  return (
    <Select value={value} onChange={(v) => setValue(v)} style={{ width: '100%' }}>
      {options.map((opt) => (
        <Option key={opt} value={opt}>{opt}</Option>
      ))}
    </Select>
  );
});

export default StatusEditor;
