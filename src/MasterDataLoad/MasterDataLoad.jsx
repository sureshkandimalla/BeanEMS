import React, { useState } from "react";
import { Card, Button, Upload, message, Typography, Tag, Alert, List } from "antd";
import { DownloadOutlined, UploadOutlined, CloudUploadOutlined } from "@ant-design/icons";
import axios from "axios";
import API_ENDPOINTS from "../config";

const { Title, Paragraph, Text } = Typography;

// Order matters here and is shown to the user as a real dependency, not
// decoration: Projects need an already-loaded Customer + Employee,
// Assignments need an already-loaded Employee + Project. Invoices are
// intentionally not included — the app generates them itself from
// Project/Assignment data once those exist.
const ENTITIES = [
  {
    key: "customers",
    step: 1,
    title: "Customers",
    description: "The companies employees are placed with.",
    hasTemplate: true,
  },
  {
    key: "employees",
    step: 2,
    title: "Employees",
    description: "Core employee records. Employee IDs are assigned automatically from each company's reserved ID range — do not include an ID column.",
    hasTemplate: true,
  },
  {
    key: "projects",
    step: 3,
    title: "Projects",
    description: "Requires a matching Customer and Employee to already be loaded.",
    hasTemplate: true,
  },
  {
    key: "assignments",
    step: 4,
    title: "Assignments",
    description: "Requires a matching Employee and Project to already be loaded.",
    hasTemplate: true,
  },
  {
    key: "payrollSummary",
    step: null,
    title: "Payroll Summary",
    description: "Existing payroll history import.",
    hasTemplate: false,
    importUrl: API_ENDPOINTS.importPayrollSummaryCsv,
    accept: ".csv",
  },
  {
    key: "healthInsurance",
    step: null,
    title: "Health Insurance",
    description: "Existing health insurance billing import.",
    hasTemplate: false,
    importUrl: API_ENDPOINTS.importHealthInsuranceCsv,
    accept: ".csv",
  },
];

const downloadTemplate = async (entityKey, title) => {
  try {
    const response = await axios.get(API_ENDPOINTS.masterDataTemplate(entityKey), {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${entityKey}_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading ${title} template:`, error);
    message.error(`Failed to download ${title} template.`);
  }
};

// The three import endpoints in play here don't share one response shape:
// the new Master Data Load imports return { imported, errors: [...] },
// Health Insurance's existing import returns { imported, unmatchedEmployeeCount },
// and Payroll Summary's existing import just returns a plain success string.
const ImportResultView = ({ result }) => {
  if (result == null) return null;
  if (typeof result === "string") {
    return <Alert style={{ marginTop: 12 }} type="success" showIcon message={result} />;
  }
  const { imported, errors, unmatchedEmployeeCount } = result;
  return (
    <div style={{ marginTop: 12 }}>
      <Alert
        type={errors?.length ? "warning" : "success"}
        showIcon
        message={
          `Imported ${imported ?? 0} record(s).` +
          (unmatchedEmployeeCount ? ` ${unmatchedEmployeeCount} employee name(s) unmatched.` : "") +
          (errors?.length ? ` ${errors.length} row(s) skipped.` : "")
        }
      />
      {errors?.length > 0 && (
        <List
          size="small"
          style={{ marginTop: 8, maxHeight: 200, overflowY: "auto" }}
          bordered
          dataSource={errors}
          renderItem={(err) => (
            <List.Item>
              <Text type="secondary">Row {err.row}:</Text>&nbsp;{err.reason}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

const LoadCard = ({ entity }) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const importUrl = entity.importUrl || API_ENDPOINTS.masterDataImport(entity.key);

  const handleUpload = ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setResult(null);
    axios
      .post(importUrl, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((response) => {
        setResult(response.data);
        message.success(`${entity.title}: upload processed.`);
      })
      .catch((error) => {
        console.error(`Error uploading ${entity.title}:`, error);
        message.error(`Upload failed: ${error.response?.data?.message || error.message}`);
      })
      .finally(() => setUploading(false));
  };

  return (
    <Card
      title={
        <span>
          {entity.step != null && <Tag color="blue" style={{ marginRight: 8 }}>{entity.step}</Tag>}
          {entity.title}
        </span>
      }
      style={{ marginBottom: 16 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {entity.description}
      </Paragraph>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {entity.hasTemplate && (
          <Button icon={<DownloadOutlined />} onClick={() => downloadTemplate(entity.key, entity.title)}>
            Download Template
          </Button>
        )}
        <Upload
          accept={entity.accept || ".xlsx"}
          showUploadList={false}
          customRequest={handleUpload}
        >
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            Upload Filled File
          </Button>
        </Upload>
      </div>
      <ImportResultView result={result} />
    </Card>
  );
};

const MasterDataLoad = () => {
  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <Title level={3}>
        <CloudUploadOutlined style={{ marginRight: 10 }} />
        Master Data Load
      </Title>
      <Paragraph type="secondary">
        Download a template, fill in real data, and upload it back. Load in order for the first
        four — each one depends on the ones before it already being in the system.
      </Paragraph>
      {ENTITIES.map((entity) => (
        <LoadCard key={entity.key} entity={entity} />
      ))}
    </div>
  );
};

export default MasterDataLoad;
