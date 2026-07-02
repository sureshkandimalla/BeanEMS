import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Card, Button, Drawer } from "antd";
import { PlusOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./Vendor.css";
import Newvendor from "./NewVendor";
import API_ENDPOINTS from "../config";

const columnsList = [
  { headerName: "Customer Id", field: "customerId", type: "number" },
  { headerName: "Name", field: "customerCompanyName", type: "text" },
  { headerName: "Email", field: "customerEmail", type: "text" },
  { headerName: "Phone", field: "customerPhone", type: "text" },
  { headerName: "Status", field: "customerStatus", type: "text" },
  { headerName: "ein", field: "ein", type: "text" },
  { headerName: "Website", field: "website", type: "text" },
  { headerName: "Start Date", field: "customerStartDate", type: "date" },
  { headerName: "End Date", field: "customerEndDate", type: "date" },
];

const VendorDetails = () => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchData = () => {
    fetch(API_ENDPOINTS.getAllCustomers)
      .then((response) => response.json())
      .then((data) => {
        setRowData(getFlattenedData(data));
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFlattenedData = (data) => {
    let updatedData = data.map((dataObj) => {
      return { ...dataObj };
    });
    return updatedData || [];
  };

  const excelStyles = [
    {
      id: "cell",
      alignment: {
        vertical: "Center",
      },
    },
    {
      id: "darkGreyBackground",
      interior: {
        color: "#E7E4EC",
        pattern: "Solid",
      },
      font: {
        fontName: "Calibri Light",
        color: "#000000",
      },
    },
    {
      id: "blueUnderline",
      font: {
        fontName: "Calibri Light",
        color: "#0000EE",
      },
    },
  ];

  const getColumnsDefList = (columnsList, isSortable) => {
    return columnsList.map(({ headerName, field, type }) => {
      let columnFilter;
      if (type === "date") {
        columnFilter = "agDateColumnFilter";
      } else if (type === "number") {
        columnFilter = "agNumberColumnFilter";
      } else {
        columnFilter = "agSetColumnFilter";
      }

      const isIdColumn = field === "customerId";
      const autoWidth = type === "date" || field === "customerStatus" || isIdColumn ? 145 : 170;

      return {
        headerName,
        field,
        sortable: isSortable,
        editable: true,
        headerClass: isIdColumn ? "ag-center-cols" : "ag-header-cell",
        filter: columnFilter,
        minWidth: autoWidth,
        suppressSizeToFit: true,
        tooltipValueGetter: (params) => params.value,
        cellClassRules: {
          darkGreyBackground: (params) =>
            params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
          blueUnderline: (params) => params.colDef.field === "customerEmail",
          centerAlign: (params) => params.colDef.field === "customerId",
        },
        cellClass: isIdColumn ? "ag-center-cols" : undefined,
        cellStyle: isIdColumn ? { textAlign: "center" } : undefined,
        tooltipShowDelay: 0,
      };
    });
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const onBtnExportDataAsExcel = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.exportDataAsExcel();
    }
  }, []);

  const filterData = () => {
    const source = Array.isArray(rowData) ? rowData : [];
    if (!searchText) {
      return source;
    }

    return source.filter((row) =>
      Object.values(row || {}).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const addNewVendor = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  // compute columnDefs once per rowData change
  const vendorColumnDefs = useMemo(() => {
    return [
      {
        headerName: "#",
        valueGetter: (params) => params.node.rowIndex + 1,
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        pinned: "left",
        lockPosition: true,
        suppressMovable: true,
        sortable: false,
        filter: false,
        editable: false,
        suppressSizeToFit: true,
        cellStyle: { textAlign: "center", fontWeight: 500 },
        headerClass: "ag-center-cols",
        cellClassRules: {
          darkGreyBackground: (params) =>
            params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
        },
      },
      ...getColumnsDefList(columnsList, true),
    ];
  }, [rowData]);

  // Append any additional fields present in service response that are not in the default columns
  const combinedColumnDefs = useMemo(() => {
    try {
      const base = Array.isArray(vendorColumnDefs) ? [...vendorColumnDefs] : [];
      if (!Array.isArray(rowData) || rowData.length === 0) return base;
      const sample = rowData[0] || {};
      const existingFields = new Set(base.map((c) => c.field).filter(Boolean));
      const extraKeys = Object.keys(sample).filter((k) => {
        if (existingFields.has(k) || k.startsWith("__")) return false;
        const v = sample[k];
        return v === null || ["string", "number", "boolean"].includes(typeof v);
      });
      const extras = extraKeys.map((k) => ({
        headerName: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
        field: k,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
        cellClassRules: {
          darkGreyBackground: (params) =>
            params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 1,
        },
      }));
      return [...base, ...extras];
    } catch (e) {
      return vendorColumnDefs;
    }
  }, [vendorColumnDefs, rowData]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className="ag-theme-alpine vendor-List-grid">
      <Card style={{ height: "100%", display: "flex", flexDirection: "column" }} styles={{ body: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }}>
        <Drawer
          title={`Vendor Onboarding`}
          placement="right"
          size="large"
          onClose={onClose}
          open={open}
        >
          <Newvendor />
        </Drawer>
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
            className="button-vendor"
            onClick={addNewVendor}
            style={{ marginLeft: "10px" }}
          >
            <PlusOutlined /> Add New Vendor
          </Button>
        </div>
        <div className="vendor-grid-wrapper" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <AgGridReact
            ref={gridRef}
            onGridReady={(params) => {
              try {
                gridRef.current = params.api;
                setTimeout(() => {
                  try { params.api.sizeColumnsToFit(); } catch (e) {}
                  try { params.api.refreshView(); } catch (e) {}
                }, 0);
              } catch (e) {}
            }}
            rowHeight={48}
            rowData={filterData()}
            columnDefs={combinedColumnDefs}
            defaultColDef={{
              flex: 1,
              resizable: true,
              filter: true,
              minWidth: 150,
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
            excelStyles={excelStyles}
          />
        </div>
      </Card>
      </div>
    </div>
  );
};

export default VendorDetails;
