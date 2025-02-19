import React, { useState, useEffect,useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Drawer, notification } from "antd";
import { PlusOutlined, SaveOutlined, FileExcelOutlined  } from "@ant-design/icons";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import NewPotentialEmployee from "./NewPotentialEmployee";
import "./PotentialEmployees.css";

const PotentialEmployees = () => {
  const [searchText, setSearchText] = useState("");
  const [rowData, setRowData] = useState([]);
  const [open, setOpen] = useState(false);
  const gridRef = useRef(null); // Reference for Ag-Grid
  const [updatedRows, setUpdatedRows] = useState([]); // Store edited rows

  // Fetch employee data
  useEffect(() => {
    fetchPotentialEmployees();
  }, []);

  const fetchPotentialEmployees = () => {
    fetch("http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/visa/getAllPotentialEmployees")
      .then((response) => response.json())
      .then((data) => setRowData(data))
      .catch((error) => console.error("Error fetching data:", error));
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
        color: "#006400",
      },
    },
    {
      id: "blueUnderline",
      font: {
        fontName: "Calibri Light",    
        color: "#0000EE",     
      },
    }
  ];

  // Define editable columns
  const getColumnsDefList = () => {
    var columns = [
      { 
        headerName: "First Name", 
        field: "firstName", 
        editable: true,
        filter: "agSetColumnFilter",      
        floatingFilter: false
      },
      { 
        headerName: "Last Name", 
        field: "lastName", 
        editable: true, 
        filter: "agSetColumnFilter"
      },
      { 
        headerName: "Gender", 
        field: "gender", 
        editable: true, 
        filter: "agSetColumnFilter"
      },
      { 
        headerName: "Company", 
        field: "company", 
        editable: true, 
        filter: "agSetColumnFilter",
        cellEditor: "agSelectCellEditor", // Enables dropdown selection
        cellEditorParams: {
          values: ["Bean", "Code9", "IDA"] // Dropdown options
        }
      },
      { 
        headerName: "Visa Type", 
        field: "visaType", 
        editable: true, 
        filter: "agSetColumnFilter",
        cellEditor: "agSelectCellEditor", // Enables dropdown selection
        cellEditorParams: {
          values: ["H1B-Cap", "H1B-Transfer"] // Dropdown options
        }
      },
      { 
        headerName: "Year", 
        field: "year", 
        editable: true, 
        filter: "agTextColumnFilter"
      },
      { 
        headerName: "Status", 
        field: "status", 
        editable: true, 
        filter: "agSetColumnFilter"
      },
      { 
        headerName: "Current Location", 
        field: "currentLocation", 
        editable: true, 
        filter: "agSetColumnFilter"
      },
      { 
        headerName: "Referred By", 
        field: "referredBy", 
        editable: true, 
        filter: "agTextColumnFilter" 
      },
      { 
        headerName: "Email", 
        field: "emailId", 
        editable: true, 
        filter: "agTextColumnFilter" ,
        cellClassRules: {
          blueUnderline: (params) => params.colDef.field === "emailId"
        }
      },
      { 
        headerName: "Phone", 
        field: "phone", 
        editable: true, 
        filter: "agSetColumnFilter" 
      },
      { 
        headerName: "DOB", 
        field: "dob", 
        editable: true, 
        filter: "agDateColumnFilter" 
      },
      { 
        headerName: "Primary Skills", 
        field: "primarySkills", 
        editable: true, 
        filter: "agTextColumnFilter" 
      },
      { 
        headerName: "Secondary Skills", 
        field: "secondarySkills", 
        editable: true, 
        filter: "agTextColumnFilter" 
      },
      { 
        headerName: "Work Country", 
        field: "workCountry", 
        editable: true, 
        filter: "agSetColumnFilter" 
      },
      { 
        headerName: "Start Date", 
        field: "startDate", 
        editable: true, 
        filter: "agDateColumnFilter" 
      },
      { 
        headerName: "End Date", 
        field: "endDate", 
        editable: true, 
        filter: "agDateColumnFilter" 
      },
    ];
    return columns;
};


  // Capture edited rows
  const onCellEditingStopped = (event) => {
    const updatedRow = event.data;
    setUpdatedRows((prevRows) => {
      const existingRowIndex = prevRows.findIndex((row) => row.id === updatedRow.id);
      if (existingRowIndex !== -1) {
        prevRows[existingRowIndex] = updatedRow;
        return [...prevRows];
      }
      return [...prevRows, updatedRow];
    });
  };

  // Save edited rows to backend
  const saveUpdatedRows = async () => {
    if (updatedRows.length === 0) {
      notification.info({ message: "No changes to save" });
      return;
    }

    try {
      const response = await fetch("http://beanservices.us-east-1.elasticbeanstalk.com/api/v1/visa/savePotentialEmployees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRows),
      });

      if (response.ok) {
        notification.success({ message: "Changes saved successfully!" });
        fetchPotentialEmployees(); // Refresh data after saving
        setUpdatedRows([]); // Clear updated rows
      } else {
        throw new Error("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      notification.error({ message: "Error saving changes. Try again." });
    }
  };

  const filterData = () => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };

   const onBtnExportDataAsExcel = useCallback(() => {
      if (gridRef.current && gridRef.current.api) { 
        gridRef.current.api.exportDataAsExcel();
      }
    }, []);
  
  const handleCloseDrawer = (action) => {
    setOpen(false);
    if (action === "submit") fetchPotentialEmployees();
  };

  return (
    <div
        style={{
          height: "100vh", 
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", 
        }}
      >
    <div className="ag-theme-alpine project-List-grid">
      <Drawer title="Vendor Onboarding" placement="right" size="large" onClose={handleCloseDrawer} open={open}>
        <NewPotentialEmployee onClose={handleCloseDrawer} />
      </Drawer>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginRight: "5px", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <div>
        <Button 
      type="default" 
      icon={<FileExcelOutlined />} 
      onClick={onBtnExportDataAsExcel}
      style={{ marginRight: "10px" }}
    >
      Export to Excel
    </Button>
          <Button type="primary" onClick={() => setOpen(true)} style={{ marginRight: "10px" }}>
            <PlusOutlined /> Add New Employee
          </Button>
          <Button type="primary" ghost  icon={<SaveOutlined />} onClick={saveUpdatedRows} disabled={updatedRows.length === 0}>
            Save Changes
          </Button>
        </div>
      </div>
      <div className= "project-grid-wrapper">
      <AgGridReact
        ref={gridRef}
        rowData={filterData()}
        columnDefs={getColumnsDefList()}
        domLayout="normal"
        pagination={true}        
        paginationPageSize={100}
        paginationPageSizeSelector={[100,200, 300]}
        onCellEditingStopped={onCellEditingStopped} 
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
          filter: false,      
          floatingFilter: false,
          cellClassRules: {
            darkGreyBackground: (params) => params.node?.rowIndex !== undefined && params.node.rowIndex % 2 === 0,
          }        
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
        enableBrowserTooltips={true} 
        popupParent={document.body}  
        excelStyles={excelStyles}       
      />
      </div>
    </div>
    </div>
  );
};

export default PotentialEmployees;
