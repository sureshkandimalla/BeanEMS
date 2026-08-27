import axios from "axios";
import API_ENDPOINTS from "../config";

// Opens a document's presigned URL in a new tab. The tab is opened
// synchronously (before the async presign call) so the browser still
// attributes it to this click — opening it only after the response comes
// back gets silently popup-blocked.
export const openDocumentInNewTab = (documentId) => {
  const target = window.open("", "_blank");
  axios
    .get(API_ENDPOINTS.documentDownloadUrl(documentId))
    .then((res) => {
      if (target) target.location.href = res.data.url;
    })
    .catch(() => {
      if (target) target.close();
    });
};
