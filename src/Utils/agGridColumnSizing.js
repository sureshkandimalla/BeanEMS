// Shared AG Grid column-sizing helper: floors each column's minWidth off its
// own header label length (so headers never truncate), while leaving fixed-width
// columns (e.g. pinned "#" row-number columns) untouched.
const HEADER_CHAR_WIDTH = 8;
const HEADER_PADDING = 60; // sort arrow + filter icon + menu button + cell padding

export const sizeColumnsForHeader = (columnDefs) =>
  columnDefs.map((col) => {
    if (col.suppressSizeToFit && col.width) return col;
    return {
      ...col,
      minWidth: Math.max(col.minWidth || 0, (col.headerName || "").length * HEADER_CHAR_WIDTH + HEADER_PADDING),
    };
  });
