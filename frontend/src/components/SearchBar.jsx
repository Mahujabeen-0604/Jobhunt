import React from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const SearchBar = ({
  searchKeyword,
  setSearchKeyword,
  city,
  setCity,
  onSearch,
}) => {
  return (
    <div className="search-bar">
      <div className="search-input">
        <FaSearch className="icon" />
        <input
          type="text"
          placeholder="Keywords"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      <div className="search-select">
        <FaMapMarkerAlt className="icon" />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All Regions</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Pune">Pune</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Chennai">Chennai</option>
          <option value="Gurgaon">Gurgaon</option>
          <option value="Delhi">Delhi</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Kolkata">Kolkata</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Jaipur">Jaipur</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Coimbatore">Coimbatore</option>
          <option value="Trivandrum">Trivandrum</option>
          <option value="Nagpur">Nagpur</option>
          <option value="Indore">Indore</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Kochi">Kochi</option>
          <option value="Lucknow">Lucknow</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Lahore">Lahore</option>
          <option value="Faisalabad">Faisalabad</option>

        </select>
      </div>

      <button className="btn-search" onClick={onSearch}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;
