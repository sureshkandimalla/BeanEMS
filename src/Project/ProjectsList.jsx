import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { Link } from "react-router-dom";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ProjectList.css";

const ProjectList = ({ projectsList, isCollapsed }) => {
  console.log(projectsList);
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);

  useEffect(() => {
    setRowData((prevState) => (projectsList ? [...projectsList] : prevState));
  }, [projectsList]);

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      console.log(rowData);
      setPinnedBottomRowData([
        {
          projectName: "Total",
          billRate: rowData.reduce((sum, row) => sum + (row.billRate || 0), 0),
          net: rowData.reduce((sum, row) => sum + (row.net || 0), 0),
          employeePay: rowData.reduce(
            (sum, row) => sum + (row.employeePay || 0),
            0
          ),
          expenseExternal: rowData.reduce(
            (sum, row) => sum + (row.expenseExternal || 0),
            0
          ), // Summing billRate values
          expenseInternal: rowData.reduce(
            (sum, row) => sum + (row.expenseInternal || 0),
            0
          ),
        },
      ]);
      console.log(pinnedBottomRowData);
    }
  }, [rowData]);

  const getColumnsDefList = (isSortable) => {
    var columns = [
      {
        headerName: "Project Id",
        field: "projectId",
        sortable: isSortable,
        editable: false,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Project Name",
        field: "projectName",
        cellRenderer: (params) => {
          const rowData = params.data;
          return (
            <Link to="/projectFullDetails" state={{ rowData }}>
              {" "}
              {rowData.projectName}
            </Link>
          );
        },
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Employee Name",
        field: "employeeName",
        cellRenderer: (params) => {
          const rowData = params.data;
          return (
            <Link
              to={{ pathname: "/employeeProjectDetails", state: { rowData } }}
            >
              {" "}
              {rowData.employeeName}{" "}
            </Link>
          );
        },
        sortable: isSortable,
        editable: false,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Status",
        field: "status",
        sortable: isSortable,
        editable: false,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Bill Rate",
        field: "billRate",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Bean Net Internal",
        field: "net",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Employee pay Rate",
        field: "employeePay",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "External",
        field: "expenseExternal",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Internal",
        field: "expenseInternal",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Bean Net",
        field: "net",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) =>
          `$${params.value ? params.value.toFixed(2) : "0.00"}`,
      },
      {
        headerName: "Client",
        field: "clientName",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Project Start Date",
        field: "startDate",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Project End Date",
        field: "endDate",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Invoice Terms",
        field: "invoiceTerm",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Invoice Terms",
        field: "invoiceTerm",
        sortable: isSortable,
        editable: true,
        filter: "agTextColumnFilter",
      },
    ];
    return columns;
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const filterData = () => {
    if (!searchText) {
      console.log(rowData)
      return rowData;
    }

    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };
  return (
    <div className="ag-theme-alpine project-List-grid">
      <div class="container">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />
      </div>
      <div className={`project-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`}>
        <AgGridReact
          rowData={filterData()}
          enableFilter={true}
          columnDefs={getColumnsDefList(true)}
          defaultColDef={{
            flex: 1,
            minWidth: 180,
            resizable: true,
            filter: false,
            floatingFilter: false,            
            headerClass: "ag-header-cell",
          }}
          hiddenByDefault={false}
          rowGroupPanelShow="never"
          pivotPanelShow="always"
          sideBar={{
            toolPanels: [
              {
                id: "columns",
                labelDefault: "Columns",
                labelKey: "columns",
                iconKey: "columns",
                toolPanel: "agColumnsToolPanel",
                toolPanelParams: {
                  suppressRowGroups: false,
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
          defaultToolPanel="columns"
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[50, 100]}
          domLayout="normal"
          pinnedBottomRowData={pinnedBottomRowData}
          enableBrowserTooltips={true} 
          popupParent={document.body}
        />
      </div>
    </div>
  );
};

export default ProjectList;
