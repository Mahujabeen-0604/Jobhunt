import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar"; // Ensure you have created this reusable component

const Hero = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Navigate to the jobs page with query parameters
    navigate(`/jobs?searchKeyword=${searchKeyword}&city=${city}`);
  };

  return (
    <section className="hero">
      <h1>Step into Your Dream Job Today!</h1>
      <h4>
        The Path to Your Dream Job Begins Here. Your Next Career Move is Just a Click
        Away!
      </h4>
      <SearchBar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        city={city}
        setCity={setCity}
        onSearch={handleSearch}
      />
    </section>
  );
};

export default Hero;

