// CustomHeader.js
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const CustomHeader = forwardRef((props, ref) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Handle changes in the search input field
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    props.onFilterChange(event.target.value);
  };

  // Clear the search input
  const clearSearch = () => {
    setSearchTerm("");
    props.onFilterChange("");
  };

  // Expose a function to clear the search input
  useImperativeHandle(ref, () => ({
    clearSearch: () => clearSearch(),
  }));

  return (
    <div className="custom-header">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleChange}
      />
      <FontAwesomeIcon
        icon={faSearch}
        className="search-icon"
        onClick={clearSearch}
      />
    </div>
  );
});

export default CustomHeader;
