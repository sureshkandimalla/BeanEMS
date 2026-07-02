import React, { useRef, useState, useMemo, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Button, Card } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const CustomGrid = ({
  rowData = [],
  columnDefs = [],
  gridHeight = "calc(100vh - 500px)",
  pinnedBottomRowData = [],
  onRefresh,
  onExport,
  searchPlaceholder = "Search...",
  fileName = "export.xlsx",
  pinnedTopRowData = [],
  defaultColDef = {},
  quickFilter = true,
  pagination = true,
  paginationPageSize = 100,
  paginationPageSizeSelector = [100, 200, 300],
  getRowStyle,
  children,
  showSave = false,
  onSave = null,
  frameworkComponents = {},
  // allow users to pin/unpin columns via column menu. Set to false to remove pin options from menu.
  allowColumnPinning = true,
  // number of leading columns to pin/lock (0 = no pinning). Default 0 to avoid unexpected pinning.
  pinFirstColumns = 0,
  // optional: pin all columns up to and including this field name (e.g. 'employeeName' or header 'Employee Name')
  pinUntilField = null,
  // optional: the field name to use as unique row id for change-tracking (e.g. 'projectId', 'employeeId'). If omitted, will auto-detect.
  rowKeyField = null,
  // callback fired when a cell value changes inside the grid. Receives the ag-Grid params object.
  onRowEdit = null,
}) => {
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [modifiedRows, setModifiedRows] = useState([]);
  // Generate column definitions synchronously from rowData when no columnDefs are provided
  const generatedColDefs = useMemo(() => {
    try {
      if (
        Array.isArray(columnDefs) &&
        columnDefs.length === 0 &&
        Array.isArray(rowData) &&
        rowData.length > 0
      ) {
        const keys = Object.keys(rowData[0]);
        const gen = keys.map((k) => ({
          field: k,
          headerName: k
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase()),
          minWidth: 120,
        }));
        // eslint-disable-next-line no-console
        console.debug("CustomGrid: generated columnDefs from rowData keys", gen);
        return gen;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }, [columnDefs, rowData]);

  // Auto-detect a sensible id field if rowKeyField not provided
  const detectedRowKeyField = useMemo(() => {
    if (rowKeyField) return rowKeyField;
    if (!Array.isArray(rowData) || rowData.length === 0) return null;
    const sample = rowData[0] || {};
    const keys = Object.keys(sample);
    const prefer = keys.find((k) => /^(id|ID)$/.test(k));
    if (prefer) return prefer;
    const endsWithId = keys.find((k) => /id$/i.test(k));
    if (endsWithId) return endsWithId;
    const containsId = keys.find((k) => /id/i.test(k));
    return containsId || null;
  }, [rowKeyField, rowData]);

  // Compute effective number of columns to pin: explicit prop wins, otherwise derive from pinUntilField
  const effectivePinFirstColumns = useMemo(() => {
    if (pinFirstColumns && pinFirstColumns > 0) return pinFirstColumns;
    if (!pinUntilField) return 0;
    // prefer user-provided columnDefs, otherwise generatedColDefs
    const cols =
      Array.isArray(columnDefs) && columnDefs.length > 0
        ? columnDefs
        : generatedColDefs;
    if (!Array.isArray(cols) || cols.length === 0) return 0;
    const normalized = (s) => (s || "").toString().replace(/\s/g, "").toLowerCase();
    const target = normalized(pinUntilField);
    const idx = cols.findIndex((c) => {
      if (!c) return false;
      if (c.field && normalized(c.field) === target) return true;
      if (c.headerName && normalized(c.headerName) === target) return true;
      return false;
    });
    return idx >= 0 ? idx + 1 : 0;
  }, [pinFirstColumns, pinUntilField, columnDefs, generatedColDefs]);

  // Remove ResizeObserver logic. Use only the gridHeight prop for sizing.

  // Add memoized adjustedColumnDefs to pin & lock first N columns when requested
  const adjustedColumnDefs = useMemo(() => {
    if (!Array.isArray(columnDefs)) return columnDefs;
    return columnDefs.map((col, idx) => {
      const newCol = { ...col };
      // If caller didn't request pinning, strip any pinned/lock properties to avoid unexpected pinning
      if (!(effectivePinFirstColumns > 0 && idx < effectivePinFirstColumns)) {
        delete newCol.pinned;
        delete newCol.lockPosition;
        delete newCol.suppressMovable;
        delete newCol.suppressDrag;
      } else {
        newCol.pinned = "left";
        newCol.lockPosition = true;
        newCol.suppressMovable = true;
      }
      return newCol;
    });
  }, [columnDefs, effectivePinFirstColumns]);

  // Determine whether we actually have columns to pass to AG Grid
  const hasFinalCols = (Array.isArray(adjustedColumnDefs) && adjustedColumnDefs.length > 0) || (Array.isArray(generatedColDefs) && generatedColDefs.length > 0);

  // Determine final columnDefs to pass to AG Grid: prefer adjustedColumnDefs, then generatedColumnDefs, otherwise empty array
  const finalColumnDefs = hasFinalCols
    ? (Array.isArray(adjustedColumnDefs) && adjustedColumnDefs.length > 0 ? adjustedColumnDefs : generatedColDefs)
    : [];

  // Debug info
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug(
        "CustomGrid debug: rows=",
        Array.isArray(rowData) ? rowData.length : typeof rowData,
        "finalCols=",
        Array.isArray(finalColumnDefs) ? finalColumnDefs.length : typeof finalColumnDefs,
        "hasFinalCols=",
        hasFinalCols
      );
    } catch (e) {}
  }, [rowData, finalColumnDefs]);

  // Clear tracked modified rows when external rowData changes (e.g., after a refresh or cancel)
  useEffect(() => {
    try {
      setModifiedRows([]);
    } catch (e) {}
  }, [rowData]);

  // Debug mount/unmount to detect unwanted remount cycles
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug("CustomGrid mounted");
    } catch (e) {}
    return () => {
      try {
        // eslint-disable-next-line no-console
        console.debug("CustomGrid unmounted");
      } catch (e) {}
    };
  }, []);

  const shouldRenderFallbackTable = Array.isArray(rowData) && rowData.length > 0 && !hasFinalCols;

  // Debug: if rowData exists but no finalColumnDefs were generated, show a simple table
  useEffect(() => {
    try {
      if (Array.isArray(rowData)) {
        // eslint-disable-next-line no-console
        console.debug("CustomGrid debug: rowData.count=", rowData.length, "finalCols=", Array.isArray(finalColumnDefs) ? finalColumnDefs.length : typeof finalColumnDefs);
      }
    } catch (e) {}
  }, [rowData, finalColumnDefs]);

  // Ensure handleExport is available before any early returns that reference it (fallback table)
  const handleExport = () => {
    try {
      if (gridRef.current?.api) {
        gridRef.current.api.exportDataAsExcel({ fileName });
      }
      if (onExport) onExport();
    } catch (e) {
      // ignore
    }
  };

  // if we have rowData but no finalColumnDefs, prepare a simple fallback table UI
  const fallbackKeys = Array.isArray(rowData) && rowData.length > 0 ? Object.keys(rowData[0] || {}) : [];

  // Guarded sizeColumnsToFit to avoid calling when grid width is zero
  const handleSizeColumnsToFit = (api) => {
    try {
      // get container width via grid API
      const gridWidth = api?.gridPanel?.getCenterWidth?.();
      if (gridWidth && gridWidth > 0) api.sizeColumnsToFit();
    } catch (e) {
      try {
        api.sizeColumnsToFit();
      } catch (err) {
        /* ignore */
      }
    }
  };

  // Error boundary to prevent AG Grid render errors from unmounting the whole tree repeatedly
  class GridErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error, info) {
      // eslint-disable-next-line no-console
      console.error('CustomGrid caught render error:', error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: 16, color: '#a00', background: '#fff6f6', border: '1px solid #ffcccc' }}>
            An error occurred while rendering the grid. Check console for details.
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <div
      className="ag-theme-alpine employee-List-grid"
      style={{
        flex: 1,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        className="employeeTableCard"
        style={{
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {quickFilter && (
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginRight: 8 }}
              />
            )}
            {onRefresh && (
              <Button
                style={{ marginLeft: 8 }}
                icon={<ReloadOutlined />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
            )}
            {showSave && modifiedRows.length > 0 && (
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                onClick={async () => {
                  if (onSave) await onSave(modifiedRows);
                  setModifiedRows([]);
                }}
              >
                Save
              </Button>
            )}
            <Button
              style={{ marginLeft: 8 }}
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export Excel
            </Button>
          </div>
          {children}
        </div>

        {/* Grid container: if gridHeight is '100%' use flex to fill parent; otherwise use explicit height */}
        <div
          style={
            gridHeight && gridHeight !== "100%"
              ? {
                  height: gridHeight,
                  minHeight: 300,
                  width: "100%",
                  overflow: "hidden",
                  transition: "height 0.3s ease-in-out",
                }
              : {
                  flex: 1,
                  minHeight: 0,
                  width: "100%",
                  overflow: "hidden",
                }
          }
        >
          <GridErrorBoundary>
            <AgGridReact
              ref={gridRef}
              style={{ height: "100%", width: "100%" }}
              className="ag-grid-full-height"
              rowData={rowData}
              quickFilterText={quickFilter ? searchText : undefined}
              columnDefs={finalColumnDefs}
              domLayout="normal"
              pinnedTopRowData={pinnedTopRowData}
              pinnedBottomRowData={pinnedBottomRowData}
              frameworkComponents={frameworkComponents}
              singleClickEdit={true}
              stopEditingWhenCellsLoseFocus={true}
              onCellValueChanged={(params) => {
                try {
                  const updated = params.data;
                  setModifiedRows((prev) => {
                    // If there's a known key field, use it to dedupe modified rows
                    if (
                      detectedRowKeyField &&
                      updated[detectedRowKeyField] !== undefined
                    ) {
                      const filtered = prev.filter(
                        (r) => r[detectedRowKeyField] !== updated[detectedRowKeyField]
                      );
                      const next = [...filtered, updated];
                      // inform parent about the edit
                      if (typeof onRowEdit === "function") {
                        try {
                          onRowEdit(params, next);
                        } catch (e) {}
                      }
                      return next;
                    }
                    // Fallback: use rowIndex marker so we can still track edits without an id
                    const markerKey = "__rowIndex";
                    const newRow = { ...updated, [markerKey]: params.node?.rowIndex };
                    const existingIdx = prev.findIndex(
                      (r) => r[markerKey] === params.node?.rowIndex
                    );
                    if (existingIdx >= 0) {
                      const copy = [...prev];
                      copy[existingIdx] = newRow;
                      if (typeof onRowEdit === "function") {
                        try {
                          onRowEdit(params, copy);
                        } catch (e) {}
                      }
                      return copy;
                    }
                    if (typeof onRowEdit === "function") {
                      try {
                        onRowEdit(params, [...prev, newRow]);
                      } catch (e) {}
                    }
                    return [...prev, newRow];
                  });
                } catch (e) {
                  // ignore
                }
              }}
            />
          </GridErrorBoundary>

          {/* Fallback table: show if no columns are available from AG Grid */}
          {shouldRenderFallbackTable && (
            <div style={{ padding: 8, borderTop: '1px solid #eee' }}>
              <div style={{ overflow: 'auto', maxHeight: '70vh', border: '1px solid #eee', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {fallbackKeys.map((k) => (
                        <th key={k} style={{ border: '1px solid #f0f0f0', padding: 8, textAlign: 'left' }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 ? '#fafafa' : '#fff' }}>
                        {fallbackKeys.map((k) => (
                          <td key={k} style={{ border: '1px solid #f0f0f0', padding: 8 }}>{String(row[k] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomGrid;
