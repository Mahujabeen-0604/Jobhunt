import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearAllJobErrors, fetchJobs } from "../store/slices/jobSlice";
import Spinner from "../components/Spinner";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const Jobs = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.jobs);

  // States for the main search bar
  const [searchKeyword, setSearchKeyword] = useState("");
  const [city, setCity] = useState("");

  // Other filters
  const [niche, setNiche] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [salary, setSalary] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");

  // On mount or when location changes, read query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordParam = params.get("searchKeyword") || "";
    const cityParam = params.get("city") || "";
    setSearchKeyword(keywordParam);
    setCity(cityParam);
  }, [location]);

  // Fetch jobs when any filter changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllJobErrors());
    }
    dispatch(fetchJobs(city, niche, searchKeyword, salary));
  }, [dispatch, error, city, niche, searchKeyword, salary]);

  const handleSearch = () => {
    dispatch(fetchJobs(city, niche, searchKeyword, salary));
  };

  // Filter options for additional filters
  const cities = [
    "All",
    "Bangalore",
    "Pune",
    "Mumbai",
    "Chennai",
    "Gurgaon",
    "Delhi",
    "Hyderabad",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Chandigarh",
    "Coimbatore",
    "Trivandrum",
    "Nagpur",
    "Indore",
    "Vadodara",
    "Kochi",
    "Lucknow",
    "Islamabad",
    "Lahore",
    "Faisalabad",
  ];

  const nichesArray = [
    "All",
    "Software Development",
    "Web Development",
    "Cybersecurity",
    "Data Science",
    "Artificial Intelligence",
    "Cloud Computing",
    "DevOps",
    "Mobile App Development",
    "Blockchain",
    "Database Administration",
    "Network Administration",
    "UI/UX Design",
    "Game Development",
    "IoT (Internet of Things)",
    "Big Data",
    "Machine Learning",
    "IT Project Management",
    "IT Support and Helpdesk",
    "Systems Administration",
    "IT Consulting",
  ];

  const salaryOptions = [
    "All",
    "20000",
    "30000",
    "40000",
    "50000",
    "60000",
    "70000",
  ];

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <section className="jobs">
          {/* Use the reusable SearchBar */}
          <SearchBar
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            city={city}
            setCity={setCity}
            onSearch={handleSearch}
          />
          <div className="wrapper">
            <div className="filter-bar">
              <div className="cities">
                <h2>Filter Job By City</h2>
                {cities.map((cityOption) => (
                  <div key={cityOption}>
                    <input
                      type="radio"
                      id={cityOption}
                      name="city"
                      value={cityOption}
                      checked={city === cityOption}
                      onChange={() => setCity(cityOption)}
                    />
                    <label htmlFor={cityOption}>{cityOption}</label>
                  </div>
                ))}
              </div>

              <div className="cities">
                <h2>Filter Job By Niche</h2>
                {nichesArray.map((nicheOption) => (
                  <div key={nicheOption}>
                    <input
                      type="radio"
                      id={nicheOption}
                      name="niche"
                      value={nicheOption}
                      checked={niche === nicheOption}
                      onChange={() => {
                        setNiche(nicheOption);
                        setSelectedNiche(nicheOption);
                      }}
                    />
                    <label htmlFor={nicheOption}>{nicheOption}</label>
                  </div>
                ))}
              </div>

              {/* Salary filter */}
              <div className="cities">
                <h2>Filter Job By Salary</h2>
                {salaryOptions.map((option) => (
                  <div key={option}>
                    <input
                      type="radio"
                      id={option}
                      name="salary"
                      value={option}
                      checked={salary === option}
                      onChange={() => {
                        setSalary(option);
                        setSelectedSalary(option);
                      }}
                    />
                    <label htmlFor={option}>{option}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="container">
              {/* Mobile filter */}
              <div className="mobile-filter">
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Filter By City</option>
                  {cities.map((cityOption) => (
                    <option value={cityOption} key={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </select>
                <select value={niche} onChange={(e) => setNiche(e.target.value)}>
                  <option value="">Filter By Niche</option>
                  {nichesArray.map((nicheOption) => (
                    <option value={nicheOption} key={nicheOption}>
                      {nicheOption}
                    </option>
                  ))}
                </select>
                <select value={salary} onChange={(e) => setSalary(e.target.value)}>
                  <option value="">Filter By Salary</option>
                  {salaryOptions.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="jobs_container">
                {jobs && jobs.length > 0 ? (
                  jobs.map((element) => (
                    <div className="card" key={element._id}>
                      {element.hiringMultipleCandidates === "Yes" ? (
                        <p className="hiring-multiple">
                          Hiring Multiple Candidates
                        </p>
                      ) : (
                        <p className="hiring">Hiring</p>
                      )}
                      <p className="title">{element.title}</p>
                      <p className="company">{element.companyName}</p>
                      <p className="location">{element.location}</p>
                      <p className="salary">
                        <span>Salary:</span> Rs. {element.salary}
                      </p>
                      <p className="posted">
                        <span>Posted On:</span>{" "}
                        {element.jobPostedOn
                          ? element.jobPostedOn.substring(0, 10)
                          : "Date not available"}
                      </p>
                      <div className="btn-wrapper">
                        <Link className="btn" to={`/post/application/${element._id}`}>
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div key="no-jobs">
                    <img
                      src="./notfound.png"
                      alt="job-not-found"
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Jobs;
