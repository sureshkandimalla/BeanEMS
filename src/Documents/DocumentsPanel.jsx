import React, { useEffect, useState } from "react";
import { Upload, Button, List, message, Typography, Empty } from "antd";
import { UploadOutlined, DownloadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { openDocumentInNewTab } from "./openDocument";

// Reusable across any entity that needs file attachments — Insurance today,
// Customer MSAs / Project POs / Employee docs are the same shape, just a
// different entityType. Upload is a 3-step dance: ask the backend for a
// presigned S3 PUT url, PUT the raw file straight to S3 (bypassing our own
// API and its axios interceptor — a presigned URL's signature doesn't
// tolerate an extra Authorization header), then tell the backend the
// upload succeeded so it can record the metadata row.
const DocumentsPanel = ({ entityType, entityId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = () => {
    if (!entityId) return;
    setLoading(true);
    axios
      .get(API_ENDPOINTS.getDocumentsForEntity(entityType, entityId))
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDocuments, [entityType, entityId]);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const presign = await axios.post(API_ENDPOINTS.presignDocumentUpload, {
        entityType,
        entityId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });
      const { uploadUrl, s3Key } = presign.data;

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      await axios.post(API_ENDPOINTS.createDocument, {
        entityType,
        entityId,
        fileName: file.name,
        s3Key,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      message.success(`${file.name} uploaded.`);
      onSuccess("ok");
      fetchDocuments();
    } catch (error) {
      message.error(`Upload failed: ${error.message}`);
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (doc) => {
    // Popconfirm's popup portal fights the enclosing antd Modal's mask for
    // click handling (the mask's mousedown fires and closes the Modal
    // before Popconfirm's own onConfirm registers) — plain window.confirm
    // sidesteps that stacking issue entirely, same as elsewhere in this app.
    if (!window.confirm(`Delete ${doc.fileName}?`)) return;
    axios
      .delete(API_ENDPOINTS.documentById(doc.id))
      .then(() => {
        message.success(`${doc.fileName} deleted.`);
        fetchDocuments();
      })
      .catch(() => message.error("Delete failed."));
  };

  return (
    <div>
      <Upload customRequest={handleUpload} showUploadList={false} multiple>
        <Button icon={<UploadOutlined />} loading={uploading} style={{ marginBottom: 12 }}>
          Upload Document
        </Button>
      </Upload>
      <List
        loading={loading}
        dataSource={documents}
        locale={{ emptyText: <Empty description="No documents uploaded yet" /> }}
        renderItem={(doc) => (
          <List.Item
            actions={[
              <Button
                key="download"
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => openDocumentInNewTab(doc.id)}
              />,
              <Button
                key="delete"
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(doc)}
              />,
            ]}
          >
            <FileOutlined style={{ marginRight: 8 }} />
            <Typography.Text>{doc.fileName}</Typography.Text>
          </List.Item>
        )}
      />
    </div>
  );
};

export default DocumentsPanel;
