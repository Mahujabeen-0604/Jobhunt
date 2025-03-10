import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.user);

  return (
    <nav className={show ? "navbar show_navbar" : "navbar"}>
      <div className="logo">
        <img src="/logo.png" alt="logo" />
        <h4>JobHunt</h4>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/" onClick={() => setShow(false)}>
              HOME
            </Link>
          </li>
          <li>
            <Link to="/jobs" onClick={() => setShow(false)}>
              JOBS
            </Link>
          </li>
          {isAuthenticated ? (
            <li>
              <Link to="/dashboard" onClick={() => setShow(false)}>
                DASHBOARD
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={() => setShow(false)}>
                LOGIN
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Register Button: Show only when not authenticated */}
      {!isAuthenticated && (
        <div className="nav-action">
          <Link
            to="/register"
            className="btn-register"
            onClick={() => setShow(false)}
          >
            REGISTER
          </Link>
        </div>
      )}

      <GiHamburgerMenu
        className="hamburger"
        onClick={() => setShow(!show)}
      />
    </nav>
  );
};

export default Navbar;
