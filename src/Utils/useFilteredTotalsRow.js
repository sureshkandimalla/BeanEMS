import { useCallback, useState } from "react";

// Drives a pinned "filtered totals" row that recomputes from whatever rows
// are currently visible in the grid — respecting both a custom search box
// (rowData is already scoped to it before reaching the grid) and AG Grid's
// own column filters (agSetColumnFilter etc, which the grid applies
// internally and this reads back via forEachNodeAfterFilter).
//
// sumRows(visibleRows) must return the pinned row object itself (including
// whatever label field identifies it, e.g. { invoiceNumber: "Filtered Total",
// ...sums }) — same shape as whatever the grand-total bottom row already
// builds, just fed a different row set.
//
// Wire the returned onModelUpdated onto <AgGridReact>; it fires whenever
// the grid's displayed rows change for any reason. Setting pinnedTopRowData
// itself triggers another onModelUpdated, so the equality check is
// required — without it this feeds back into itself forever.
export function useFilteredTotalsRow(sumRows) {
  const [pinnedTopRowData, setPinnedTopRowData] = useState([]);

  const onModelUpdated = useCallback(
    (params) => {
      const visibleRows = [];
      params.api.forEachNodeAfterFilter((node) => {
        if (node.data) visibleRows.push(node.data);
      });
      const next = visibleRows.length > 0 ? [sumRows(visibleRows)] : [];
      setPinnedTopRowData((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    },
    [sumRows],
  );

  return { pinnedTopRowData, onModelUpdated };
}
