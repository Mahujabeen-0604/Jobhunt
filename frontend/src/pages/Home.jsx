import React from "react";
import Hero from "../components/Hero";
import TopNiches from "../components/TopNiches";
import HowItWorks from "../components/HowItWorks";

const Home = () => {
  return (
    <div className="homepage">
      <div className="homepage-header">
        <Hero />
      </div>
      <TopNiches />
      <HowItWorks />
    </div>
  );
};

export default Home;
