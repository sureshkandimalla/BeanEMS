import React from "react";
import { Input } from "antd";
import { formatPhoneNumber } from "../utils";

/**
 * PhoneInput — reusable phone field for all BeanEMS forms.
 *
 * Usage inside an Ant Design Form.Item (uncontrolled via AntD Form):
 *   <Form.Item name="phone" rules={[{ validator: phoneValidator }]}>
 *     <PhoneInput />
 *   </Form.Item>
 *
 * Usage as a controlled field (state-driven):
 *   <PhoneInput value={phone} onChange={(val) => setPhone(val)} />
 *
 * The `onChange` callback receives the already-formatted string
 * (e.g. "+1 (555)-123-4567"), NOT a synthetic event — so you can pass
 * it directly to handleGeneralData or form.setFieldValue.
 */
const PhoneInput = React.forwardRef(({ value, onChange, disabled, ...rest }, ref) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    // Strip to digits and attempt to format
    const formatted = formatPhoneNumber(raw);
    if (onChange) onChange(formatted);
  };

  return (
    <Input
      ref={ref}
      addonBefore="+1"
      placeholder="(555)-000-0000"
      type="tel"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      maxLength={18} // +1 (XXX)-XXX-XXXX = 16 chars, a little slack
      style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}
      {...rest}
    />
  );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
