import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card, Form, message } from "antd";
import { PlusOutlined, FileExcelOutlined, ReloadOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import API_ENDPOINTS from "../config";
import LcaFormModal from "./LcaFormModal";
import { LCA_FIELD_LABELS, LCA_STATUS_OPTIONS } from "./visaConstants";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";

const LCADetails = () => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [lcaModalData, setLcaModalData] = useState(null);
  const [isNewLca, setIsNewLca] = useState(false);
  const [lcaForm] = Form.useForm();
  const [lcaSaving, setLcaSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [modifiedRows, setModifiedRows] = useState({});

  useEffect(() => {
    fetch(API_ENDPOINTS.getEmployees)
      .then((res) => res.json())
      .then((data) => {
        const opts = Array.isArray(data) ? data.map((emp) => ({
          value: emp.employeeId,
          label: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        })) : [];
        setEmployeeOptions(opts);
      })
      .catch(() => setEmployeeOptions([]));
  }, []);

  const getEmployeeName = (lca) => {
    const emp = lca.employee || lca.visa?.employee;
    if (!emp) return "";
    return `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  };

  const fetchData = () => {
    axios
      .get(API_ENDPOINTS.getAllLCAs)
      .then((response) => {
        const raw = Array.isArray(response.data) ? response.data
          : Array.isArray(response.data?.data) ? response.data.data
          : [];
        setRowData(raw.map((lca) => ({ ...lca, employeeName: getEmployeeName(lca) })));
      })
      .catch((error) => {
        console.error("Error fetching LCA data:", error);
        setRowData([]);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const filterData = () => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        typeof value !== "object" && String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };

  const onBtnExportDataAsExcel = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.exportDataAsExcel();
    }
  }, []);

  const openNewLcaModal = () => {
    setIsNewLca(true);
    setLcaModalData(null);
    lcaForm.resetFields();
    setLcaModalData({});
  };

  const openEditLcaModal = (lca) => {
    setIsNewLca(false);
    setLcaModalData(lca);
    lcaForm.setFieldsValue({
      ...lca,
      employmentStartDate: lca?.employmentStartDate ? dayjs(lca.employmentStartDate) : null,
      employmentEndDate:   lca?.employmentEndDate   ? dayjs(lca.employmentEndDate)   : null,
      lcaPostedFromDate:   lca?.lcaPostedFromDate   ? dayjs(lca.lcaPostedFromDate)   : null,
      lcaPostedToDate:     lca?.lcaPostedToDate     ? dayjs(lca.lcaPostedToDate)     : null,
      certifiedDate:       lca?.certifiedDate       ? dayjs(lca.certifiedDate)       : null,
    });
  };

  const handleLcaSave = (values) => {
    const payload = {
      ...values,
      lcaId: isNewLca ? 0 : lcaModalData?.lcaId ?? 0,
      employmentStartDate: values.employmentStartDate?.format("YYYY-MM-DD") || null,
      employmentEndDate:   values.employmentEndDate?.format("YYYY-MM-DD")   || null,
      lcaPostedFromDate:   values.lcaPostedFromDate?.format("YYYY-MM-DD")   || null,
      lcaPostedToDate:     values.lcaPostedToDate?.format("YYYY-MM-DD")     || null,
      certifiedDate:       values.certifiedDate?.format("YYYY-MM-DD")       || null,
    };
    setLcaSaving(true);
    axios.post(API_ENDPOINTS.saveLCA, payload)
      .then(() => {
        message.success(isNewLca ? "LCA created successfully" : "LCA updated successfully");
        setLcaModalData(null);
        lcaForm.resetFields();
        fetchData();
      })
      .catch(() => message.error("Failed to save LCA. Please try again."))
      .finally(() => setLcaSaving(false));
  };

  // Inline cell editing — same modifiedRows/Save-Cancel pattern as
  // ProjectsList.jsx/VendorDetails.jsx. rowData already carries the full
  // LCA object per row (not a flattened/denormalized view), so posting
  // the edited row back as-is is safe.
  const onCellValueChanged = (params) => {
    const lcaId = params.data?.lcaId;
    if (lcaId === undefined || lcaId === null) return;
    setModifiedRows((prev) => ({ ...prev, [lcaId]: params.data }));
  };

  const handleSaveChanges = () => {
    const rows = Object.values(modifiedRows);
    if (rows.length === 0) return;
    Promise.all(rows.map((row) => axios.post(API_ENDPOINTS.saveLCA, row)))
      .then(() => {
        setModifiedRows({});
        fetchData();
      })
      .catch(() => message.error("Failed to save changes. Please try again."));
  };

  const handleCancelChanges = () => {
    setModifiedRows({});
    fetchData();
  };

  const cellClassRules = {
    darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
  };

  const columnDefs = [
    {
      colId: "rowNum",
      headerName: "#",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 60, minWidth: 60, maxWidth: 60,
      pinned: "left", sortable: false, filter: false, editable: false,
      suppressSizeToFit: true,
      cellStyle: { textAlign: "center", fontWeight: 500 },
      headerClass: "ag-center-cols",
      cellClassRules,
    },
    {
      colId: "lcaNumber",
      field: "lcaNumber",
      headerName: LCA_FIELD_LABELS.lcaNumber,
      pinned: "left",
      filter: "agSetColumnFilter",
      cellClassRules: { ...cellClassRules, blueUnderline: () => true },
      cellRenderer: (params) => {
        if (!params.value) return "";
        return (
          <span style={{ cursor: "pointer" }} onClick={() => openEditLcaModal(params.data)}>
            {params.value}
          </span>
        );
      },
    },
    { colId: "employeeName", field: "employeeName", headerName: "Employee Name", filter: "agSetColumnFilter", cellClassRules, editable: false },
    { colId: "jobTitle", field: "jobTitle", headerName: LCA_FIELD_LABELS.jobTitle, filter: "agSetColumnFilter", cellClassRules },
    { colId: "lcaCaseNumber", field: "lcaCaseNumber", headerName: LCA_FIELD_LABELS.lcaCaseNumber, filter: "agSetColumnFilter", cellClassRules },
    { colId: "socCode", field: "socCode", headerName: LCA_FIELD_LABELS.socCode, filter: "agSetColumnFilter", cellClassRules },
    {
      colId: "lcaWage", field: "lcaWage", headerName: LCA_FIELD_LABELS.lcaWage, filter: "agSetColumnFilter", cellClassRules,
      valueFormatter: (params) => params.value != null ? formatCurrency(params.value) : "",
    },
    { colId: "status", field: "status", headerName: LCA_FIELD_LABELS.status, filter: "agSetColumnFilter", cellClassRules,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: LCA_STATUS_OPTIONS.map((o) => o.value) },
    },
    { colId: "client", field: "client", headerName: LCA_FIELD_LABELS.client, filter: "agSetColumnFilter", cellClassRules },
    { colId: "vendor", field: "vendor", headerName: LCA_FIELD_LABELS.vendor, filter: "agSetColumnFilter", cellClassRules },
    { colId: "jobLocation", field: "jobLocation", headerName: LCA_FIELD_LABELS.jobLocation, filter: "agSetColumnFilter", cellClassRules },
    { colId: "jobLocation2", field: "jobLocation2", headerName: LCA_FIELD_LABELS.jobLocation2, filter: "agSetColumnFilter", cellClassRules, hide: true },
    { colId: "employmentStartDate", field: "employmentStartDate", headerName: LCA_FIELD_LABELS.employmentStartDate, filter: "agSetColumnFilter", cellClassRules },
    { colId: "employmentEndDate", field: "employmentEndDate", headerName: LCA_FIELD_LABELS.employmentEndDate, filter: "agSetColumnFilter", cellClassRules },
    { colId: "lcaPostedFromDate", field: "lcaPostedFromDate", headerName: LCA_FIELD_LABELS.lcaPostedFromDate, filter: "agSetColumnFilter", cellClassRules, hide: true },
    { colId: "lcaPostedToDate", field: "lcaPostedToDate", headerName: LCA_FIELD_LABELS.lcaPostedToDate, filter: "agSetColumnFilter", cellClassRules, hide: true },
    { colId: "certifiedDate", field: "certifiedDate", headerName: LCA_FIELD_LABELS.certifiedDate, filter: "agSetColumnFilter", cellClassRules },
    { colId: "lastUpdated", field: "lastUpdated", headerName: "Last Updated", filter: "agSetColumnFilter", cellClassRules, editable: false },
  ];

  const columnDefsSized = sizeColumnsForHeader(columnDefs);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="ag-theme-alpine workforce-container">
        <Card className="employeeTableCard" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className="workforce-search-container">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchData}
              style={{ marginRight: "10px" }}
            >
              Refresh
            </Button>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchInputChange}
            />
            <Button
              type="default"
              icon={<FileExcelOutlined />}
              onClick={onBtnExportDataAsExcel}
              style={{ marginLeft: "10px" }}
            >
              Export to Excel
            </Button>
            <Button
              type="primary"
              onClick={openNewLcaModal}
              style={{ marginLeft: "10px" }}
            >
              <PlusOutlined /> Add New LCA
            </Button>
            {Object.keys(modifiedRows).length > 0 && (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveChanges}
                  style={{ marginLeft: "10px" }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancelChanges}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
          <div className="workforce-grid-wrapper" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <AgGridReact
              ref={gridRef}
              onGridReady={(params) => {
                gridRef.current = params.api;
              }}
              onFirstDataRendered={(params) => {
                try { params.api.autoSizeAllColumns(); } catch (e) {}
              }}
              autoSizeStrategy={{ type: "fitCellContents" }}
              rowHeight={48}
              rowData={filterData()}
              columnDefs={columnDefsSized}
              getRowId={(params) => String(params.data.lcaId)}
              onCellValueChanged={onCellValueChanged}
              stopEditingWhenCellsLoseFocus={true}
              defaultColDef={{
                resizable: true,
                filter: "agSetColumnFilter",
                minWidth: 100,
                maxWidth: 220,
                editable: true,
              }}
              sideBar={{
                toolPanels: [
                  {
                    id: "columns",
                    labelDefault: "Columns",
                    labelKey: "columns",
                    iconKey: "columns",
                    toolPanel: "agColumnsToolPanel",
                    toolPanelParams: {
                      suppressRowGroups: true,
                      suppressValues: true,
                      suppressPivots: false,
                      suppressPivotMode: true,
                      suppressColumnFilter: true,
                      suppressColumnSelectAll: true,
                      suppressColumnExpandAll: true,
                    },
                  },
                ],
              }}
              sortable={true}
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[20, 50, 100]}
              domLayout="normal"
              enableBrowserTooltips={true}
              popupParent={document.body}
            />
          </div>
        </Card>
      </div>

      <LcaFormModal
        open={!!lcaModalData}
        isNew={isNewLca}
        lcaData={lcaModalData}
        form={lcaForm}
        saving={lcaSaving}
        showEmployeeSelect={isNewLca}
        employeeOptions={employeeOptions}
        onCancel={() => { setLcaModalData(null); lcaForm.resetFields(); }}
        onSave={handleLcaSave}
      />
    </div>
  );
};

export default LCADetails;
