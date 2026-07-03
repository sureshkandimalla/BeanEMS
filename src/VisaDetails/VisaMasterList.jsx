import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card, Form, message } from "antd";
import { PlusOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import API_ENDPOINTS from "../config";
import VisaFormModal from "./VisaFormModal";
import { DETAIL_FIELD_LABELS } from "./visaConstants";
import { formatCurrency } from "../Utils/CurrencyFormatter";
import { sizeColumnsForHeader } from "../Utils/agGridColumnSizing";

const VisaMasterList = () => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [visaModalData, setVisaModalData] = useState(null);
  const [isNewVisa, setIsNewVisa] = useState(false);
  const [visaForm] = Form.useForm();
  const [visaSaving, setVisaSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [lcaOptions, setLcaOptions] = useState([]);

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

  const fetchLcaOptions = () => {
    axios.get(API_ENDPOINTS.getAllLCAs)
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data
          : Array.isArray(res.data?.data) ? res.data.data
          : [];
        setLcaOptions(raw.map((l) => ({
          value: l.lcaId,
          label: `${l.lcaId} — ${l.lcaNumber || ""}`,
          lcaNumber: l.lcaNumber || "",
        })));
      })
      .catch(() => setLcaOptions([]));
  };

  const getEmployeeName = (visa) => {
    const emp = visa.employee;
    if (!emp) return "";
    return `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  };

  const fetchData = () => {
    axios
      .get(API_ENDPOINTS.getAllVisas)
      .then((response) => {
        const raw = Array.isArray(response.data) ? response.data
          : Array.isArray(response.data?.data) ? response.data.data
          : [];
        setRowData(raw.map((visa) => ({ ...visa, employeeName: getEmployeeName(visa) })));
      })
      .catch((error) => {
        console.error("Error fetching Visa data:", error);
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

  const openNewVisaModal = () => {
    fetchLcaOptions();
    setIsNewVisa(true);
    visaForm.resetFields();
    setVisaModalData({});
  };

  const openEditVisaModal = (visa) => {
    fetchLcaOptions();
    setIsNewVisa(false);
    setVisaModalData(visa);
    visaForm.setFieldsValue({
      ...visa,
      employeeId: visa?.employee?.employeeId ?? null,
      filingYear: visa.filingYear != null ? String(visa.filingYear) : null,
      startDate: visa?.startDate ? dayjs(visa.startDate) : null,
      endDate:   visa?.endDate   ? dayjs(visa.endDate)   : null,
      lcaId:     visa?.lca?.lcaId ?? null,
    });
  };

  const handleVisaSave = (values) => {
    const visaId = visaModalData?.visaId;
    const payload = {
      ...(isNewVisa ? {} : { visaId }),
      employeeId:      values.employeeId ?? visaModalData?.employee?.employeeId ?? null,
      visaCategory:    values.visaCategory    ?? null,
      visaSubCategory: values.visaSubCategory ?? null,
      filingType:      values.filingType      ?? null,
      filingYear:      values.filingYear      ?? null,
      receiptNumber:   values.receiptNumber   ?? visaModalData?.receiptNumber ?? null,
      startDate:       values.startDate?.format("YYYY-MM-DD") || null,
      endDate:         values.endDate?.format("YYYY-MM-DD")   || null,
      jobTitle:        values.jobTitle      ?? null,
      lcaNumber:       values.lcaNumber     ?? null,
      socCode:         values.socCode       ?? null,
      client:          values.client        ?? null,
      vendor:          values.vendor        ?? null,
      jobLocation:     values.jobLocation   ?? null,
      jobLocation2:    values.jobLocation2  ?? null,
      lcaWage:         values.lcaWage       ?? null,
      status:          values.status        ?? null,
      lca:             values.lcaId != null ? values.lcaId : (visaModalData?.lca?.lcaId ?? null),
      lastUpdated:     new Date().toISOString().split("T")[0],
    };

    setVisaSaving(true);
    const request = isNewVisa
      ? axios.post(API_ENDPOINTS.createVisa, payload)
      : axios.put(API_ENDPOINTS.updateVisa(visaId), payload);

    request
      .then(() => {
        message.success(isNewVisa ? "Visa created successfully" : "Visa updated successfully");
        setVisaModalData(null);
        visaForm.resetFields();
        fetchData();
      })
      .catch(() => message.error("Failed to save Visa. Please try again."))
      .finally(() => setVisaSaving(false));
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
      colId: "receiptNumber",
      field: "receiptNumber",
      headerName: DETAIL_FIELD_LABELS.receiptNumber,
      pinned: "left",
      filter: "agSetColumnFilter",
      cellClassRules: { ...cellClassRules, blueUnderline: () => true },
      cellRenderer: (params) => {
        if (!params.value) return "";
        return (
          <span style={{ cursor: "pointer" }} onClick={() => openEditVisaModal(params.data)}>
            {params.value}
          </span>
        );
      },
    },
    { colId: "employeeName", field: "employeeName", headerName: "Employee Name", filter: "agSetColumnFilter", cellClassRules },
    { colId: "visaCategory", field: "visaCategory", headerName: DETAIL_FIELD_LABELS.visaCategory, filter: "agSetColumnFilter", cellClassRules },
    { colId: "visaSubCategory", field: "visaSubCategory", headerName: DETAIL_FIELD_LABELS.visaSubCategory, filter: "agSetColumnFilter", cellClassRules },
    { colId: "filingType", field: "filingType", headerName: DETAIL_FIELD_LABELS.filingType, filter: "agSetColumnFilter", cellClassRules },
    { colId: "filingYear", field: "filingYear", headerName: DETAIL_FIELD_LABELS.filingYear, filter: "agSetColumnFilter", cellClassRules },
    { colId: "status", field: "status", headerName: DETAIL_FIELD_LABELS.status, filter: "agSetColumnFilter", cellClassRules },
    { colId: "jobTitle", field: "jobTitle", headerName: DETAIL_FIELD_LABELS.jobTitle, filter: "agSetColumnFilter", cellClassRules },
    { colId: "lcaNumber", field: "lcaNumber", headerName: DETAIL_FIELD_LABELS.lcaNumber, filter: "agSetColumnFilter", cellClassRules },
    { colId: "socCode", field: "socCode", headerName: DETAIL_FIELD_LABELS.socCode, filter: "agSetColumnFilter", cellClassRules },
    {
      colId: "lcaWage", field: "lcaWage", headerName: DETAIL_FIELD_LABELS.lcaWage, filter: "agNumberColumnFilter", cellClassRules,
      valueFormatter: (params) => params.value != null ? formatCurrency(params.value) : "",
    },
    { colId: "client", field: "client", headerName: DETAIL_FIELD_LABELS.client, filter: "agSetColumnFilter", cellClassRules },
    { colId: "vendor", field: "vendor", headerName: DETAIL_FIELD_LABELS.vendor, filter: "agSetColumnFilter", cellClassRules },
    { colId: "jobLocation", field: "jobLocation", headerName: DETAIL_FIELD_LABELS.jobLocation, filter: "agSetColumnFilter", cellClassRules },
    { colId: "jobLocation2", field: "jobLocation2", headerName: DETAIL_FIELD_LABELS.jobLocation2, filter: "agSetColumnFilter", cellClassRules, hide: true },
    { colId: "startDate", field: "startDate", headerName: DETAIL_FIELD_LABELS.startDate, filter: "agDateColumnFilter", cellClassRules },
    { colId: "endDate", field: "endDate", headerName: DETAIL_FIELD_LABELS.endDate, filter: "agDateColumnFilter", cellClassRules },
    { colId: "lastUpdated", field: "lastUpdated", headerName: DETAIL_FIELD_LABELS.lastUpdated, filter: "agDateColumnFilter", cellClassRules },
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
              onClick={openNewVisaModal}
              style={{ marginLeft: "10px" }}
            >
              <PlusOutlined /> Add New Visa
            </Button>
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
              getRowId={(params) => String(params.data.visaId)}
              defaultColDef={{
                resizable: true,
                filter: true,
                minWidth: 100,
                maxWidth: 220,
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

      <VisaFormModal
        open={!!visaModalData}
        isNew={isNewVisa}
        visaData={visaModalData}
        lcaOptions={lcaOptions}
        form={visaForm}
        saving={visaSaving}
        showEmployeeSelect={true}
        employeeOptions={employeeOptions}
        onCancel={() => { setVisaModalData(null); visaForm.resetFields(); }}
        onSave={handleVisaSave}
        onLcaChange={(selectedLcaId) => {
          const found = lcaOptions.find((o) => o.value === selectedLcaId);
          visaForm.setFieldsValue({ lcaNumber: found?.lcaNumber ?? null });
        }}
      />
    </div>
  );
};

export default VisaMasterList;
