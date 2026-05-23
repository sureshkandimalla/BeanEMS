/**
 * PassportController
 *
 * Self-contained passport add/edit controller.
 *
 * Props:
 *  showTrigger    {boolean}  — renders a built-in trigger button
 *  triggerLabel   {string}   — label for the trigger button
 *  onSuccess      {function} — called after successful save
 *  employeeData   {object}   — when provided, pre-fills all fields from this employee
 *                              and hides the employee selector
 *  passportData   {object}   — when provided, opens in EDIT mode with this passport
 *                              pre-populated (expects passportId + all fields)
 *
 * Ref API:
 *  passportRef.current.open()        — open the modal
 *  passportRef.current.openEdit(p)   — open in edit mode with passport object p
 *  passportRef.current.close()       — close the modal
 */
import { forwardRef, useImperativeHandle, useState } from "react";
import { Button, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import API_ENDPOINTS from "../config";
import PassportFormModal from "./PassportFormModal";

const PassportController = forwardRef(function PassportController(
  { showTrigger = false, triggerLabel = "Add Passport", onSuccess, employeeData, passportData },
  ref
) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [activePassport, setActivePassport] = useState(null); // holds passport being edited
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [form] = Form.useForm();

  // ── Helpers ───────────────────────────────────────────────────────
  const buildPreFill = (emp) => ({
    employeeId:  emp.employeeId  ?? null,
    firstName:   emp.firstName   ?? null,
    middleName:  emp.middleName  ?? null,
    lastName:    emp.lastName    ?? null,
    gender:      emp.gender      ?? null,
    nationality: emp.nationality ?? null,
    dateOfBirth: emp.dob         ? dayjs(emp.dob)         : null,
    expiryDate:  emp.passportExpiryDate ? dayjs(emp.passportExpiryDate) : null,
    passportNumber: emp.passportNumber ?? null,
  });

  const buildPassportFill = (p) => ({
    employeeId:     p.employeeId     ?? null,
    firstName:      p.firstName      ?? null,
    middleName:     p.middleName     ?? null,
    lastName:       p.lastName       ?? null,
    passportNumber: p.passportNumber ?? null,
    gender:         p.gender         ?? null,
    nationality:    p.nationality    ?? null,
    countryOfBirth: p.countryOfBirth ?? null,
    placeOfIssue:   p.placeOfIssue   ?? null,
    status:         p.status         ?? null,
    dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth) : null,
    issueDate:   p.issueDate   ? dayjs(p.issueDate)   : null,
    expiryDate:  p.expiryDate  ? dayjs(p.expiryDate)  : null,
  });

  const openModal = () => {
    setIsNew(true);
    setActivePassport(null);
    if (employeeData) {
      form.setFieldsValue(buildPreFill(employeeData));
    } else {
      fetchEmployeeOptions();
    }
    setOpen(true);
  };

  const openEditModal = (passport) => {
    const p = passport || passportData;
    setIsNew(false);
    setActivePassport(p);
    form.setFieldsValue(buildPassportFill(p));
    setOpen(true);
  };

  // ── Public API (via ref) ──────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    open:     openModal,
    openEdit: openEditModal,
    close:    () => { setOpen(false); form.resetFields(); },
  }));

  const fetchEmployeeOptions = () => {
    axios
      .get(API_ENDPOINTS.getAllEmployees)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setEmployeeOptions(
          list.map((e) => ({
            value:      e.employeeId,
            label:      `${e.firstName || ""} ${e.lastName || ""}`.trim(),
            firstName:  e.firstName  || "",
            middleName: e.middleName || "",
            lastName:   e.lastName   || "",
            gender:     e.gender     || "",
            nationality: e.nationality || "",
            dob:        e.dob        || null,
            passportNumber: e.passportNumber || null,
            passportExpiryDate: e.passportExpiryDate || null,
          }))
        );
      })
      .catch(() => message.error("Failed to load employees"));
  };

  const handleEmployeeChange = (employeeId) => {
    const found = employeeOptions.find((o) => o.value === employeeId);
    if (found) {
      form.setFieldsValue(buildPreFill(found));
    }
  };

  const handleSave = (values) => {
    const payload = {
      passportNumber: values.passportNumber  ?? null,
      firstName:      values.firstName       ?? null,
      middleName:     values.middleName      ?? null,
      lastName:       values.lastName        ?? null,
      nationality:    values.nationality     ?? null,
      countryOfBirth: values.countryOfBirth  ?? null,
      dateOfBirth:    values.dateOfBirth?.format("YYYY-MM-DD")  || null,
      gender:         values.gender          ?? null,
      placeOfIssue:   values.placeOfIssue    ?? null,
      issueDate:      values.issueDate?.format("YYYY-MM-DD")    || null,
      expiryDate:     values.expiryDate?.format("YYYY-MM-DD")   || null,
      status:         values.status          ?? null,
      employeeId:     values.employeeId ?? employeeData?.employeeId ?? activePassport?.employeeId,
    };

    setSaving(true);

    if (isNew) {
      axios
        .post(API_ENDPOINTS.createPassport, payload)
        .then(() => {
          message.success("Passport created successfully");
          setOpen(false);
          form.resetFields();
          onSuccess?.();
        })
        .catch(() => message.error("Failed to create passport. Please try again."))
        .finally(() => setSaving(false));
    } else {
      const passportId = activePassport?.passportId;
      if (!passportId) {
        message.error("No passport ID found. Cannot update.");
        setSaving(false);
        return;
      }
      axios
        .put(API_ENDPOINTS.updatePassport(passportId), { ...payload, passportId })
        .then(() => {
          message.success("Passport updated successfully");
          setOpen(false);
          form.resetFields();
          onSuccess?.();
        })
        .catch(() => message.error("Failed to update passport. Please try again."))
        .finally(() => setSaving(false));
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {showTrigger && (
        <Button type="primary" onClick={openModal}>
          <PlusOutlined /> {triggerLabel}
        </Button>
      )}
      <PassportFormModal
        open={open}
        isNew={isNew}
        form={form}
        saving={saving}
        onCancel={handleCancel}
        onSave={handleSave}
        employeeOptions={employeeData || activePassport ? [] : employeeOptions}
        showEmployeeSelect={!employeeData && !activePassport}
        onEmployeeChange={handleEmployeeChange}
        selectedEmployee={
          employeeData
            ? `${employeeData.firstName || ""} ${employeeData.lastName || ""}`.trim()
            : activePassport
            ? `${activePassport.firstName || ""} ${activePassport.lastName || ""}`.trim()
            : ""
        }
      />
    </>
  );
});

export default PassportController;
