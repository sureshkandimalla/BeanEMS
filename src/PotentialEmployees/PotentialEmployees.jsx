import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Drawer, notification } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import NewPotentialEmployee from "./NewPotentialEmployee";

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

  // Define editable columns
  const getColumnsDefList = () => {
    return [
      { headerName: "First Name", field: "firstName", editable: true },
      { headerName: "Last Name", field: "lastName", editable: true },
      { headerName: "Gender", field: "gender", editable: true },
      { headerName: "Company", field: "company", editable: true },
      { headerName: "Visa Type", field: "visaType", editable: true },
      { headerName: "Year", field: "year", editable: true },
      { headerName: "Status", field: "status", editable: true },
      { headerName: "Current Location", field: "currentLocation", editable: true },
      { headerName: "Referred By", field: "referredBy", editable: true },


      { headerName: "Email", field: "emailId", editable: true },
      { headerName: "Phone", field: "phone", editable: true },
      { headerName: "DOB", field: "dob", editable: true },
     
      
      { headerName: "Primary Skills", field: "primarySkills", editable: true },
      { headerName: "Secondary Skills", field: "secondarySkills", editable: true },
      { headerName: "Work Country", field: "workCountry", editable: true },
      { headerName: "Start Date", field: "startDate", editable: true },
      { headerName: "End Date", field: "endDate", editable: true },
    ];
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

  // Close drawer and refresh data if submitted
  const handleCloseDrawer = (action) => {
    setOpen(false);
    if (action === "submit") fetchPotentialEmployees();
  };

  return (
    <div className="ag-theme-alpine employee-List-grid">
      <Drawer title="Prospect Onboarding" placement="right" size="large" onClose={handleCloseDrawer} open={open}>
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
          <Button type="primary" onClick={() => setOpen(true)} style={{ marginRight: "10px" }}>
            <PlusOutlined /> Add New Employee
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={saveUpdatedRows} disabled={updatedRows.length === 0}>
            Save Changes
          </Button>
        </div>
      </div>

      <AgGridReact
        ref={gridRef}
        rowData={filterData()}
        columnDefs={getColumnsDefList()}
        domLayout="autoHeight"
        pagination={true}
        paginationPageSize={100}
        paginationPageSizeSelector={[100,200, 300]}
        onCellEditingStopped={onCellEditingStopped} // Capture edited cell
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true,
          sortable: true,
          filter: false,
          floatingFilter: false,
        }}        
      />
    </div>
  );
};

export default PotentialEmployees;
