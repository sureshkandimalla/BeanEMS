import React, { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "./ProjectGrid.css";

const ProjectGrid = ({ employeeId, isCollapsed }) => {
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState();
  const columnDefs = [
    {
      headerName: "Employee Name",
      field: "employee.firstName",
      valueGetter: (params) =>
        `${params.data?.employee?.firstName || ""} ${params.data?.employee?.lastName || ""}`,
      filter: true,
    },
    {
      headerName: "Client Name",
      field: "client",
      cellRenderer: (params) => params.data?.customer?.customerCompanyName,
      filter: true,
    },
    {
      headerName: "Bill Rate",
      field: "billRates",
      cellRenderer: (params) =>
        `$${params.data?.billRates?.[0].wage.toFixed(2)}` || "N/A",
      filter: true,
    },
    { headerName: "Invoice Term", field: "invoiceTerm", filter: true },
    { headerName: "Payment Term", field: "paymentTerm", filter: true },
    { headerName: "Start Date", field: "startDate", filter: true },
    { headerName: "End Date", field: "endDate", filter: true },
    { headerName: "Status", field: "status", filter: true },
  ];

  useEffect(() => {
    fetch(
      `http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/projects?employeeId=${employeeId}`,
    )
      .then((response) => response.json())
      .then((data) => {
        const transformedData = flattenObject(data);
        setRowData(transformedData);
        console.log(transformedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const flattenObject = (data) => {
    let updatedData = data?.map((dataObj) => {
      return {
        ...dataObj,
      };

      // return { ...dataObj,...dataObj.assignments[0],...dataObj.employee.firstName.value, ...dataObj.employee.employeeAssignments[0],...dataObj.customer,...dataObj.billRates[0] }
    });
    console.log(updatedData);
    return updatedData || [];
  };
  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const filterData = () => {
    if (!searchText) {
      return rowData;
    }

    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const CustomTooltip = (props) => {
    return (
      <div style={{ color: "red", background: "yellow", padding: "5px" }}>
        {props.value}
      </div>
    );
  };
  // const gridOptions = {
  //     onGridReady: (params) => {
  //       // Automatically size all columns to fit content on grid load
  //       const allColumnIds = [];
  //       params.columnApi.getAllColumns().forEach((column) => {
  //         allColumnIds.push(column.getColId());
  //       });
  //       params.columnApi.autoSizeColumns(allColumnIds); // Auto-size columns to content
  //     }
  //   };
  return (
    <>
     <div
        style={{
          height: "100vh", 
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", 
        }}
      >
    <div className="ag-theme-alpine workforce-container">
      <div class="workforce-search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchInputChange}
        />
      </div>
      <div  className={`project-grid-wrapper ${!isCollapsed ? "ag-grid-collapsed" : "ag-grid-expanded"}`}>
      <AgGridReact
        rowData={filterData()}
        frameworkComponents={{ customTooltip: CustomTooltip }}
        columnDefs={columnDefs}
        domLayout="normal"
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
          filter: false,
          floatingFilter: false,
        }}
        hiddenByDefault={false}
        rowGroupPanelShow="always"
        pivotPanelShow="always"
        sortable={true}
        defaultToolPanel="columns"
        pagination={true}
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
        paginationPageSize={100}
        gridOptions
        // Set pinned bottom row data here
      />
      </div>
    </div>
    </div>
    </>
  );
};

export default ProjectGrid;
