import React from 'react'
import "./Navbar.css"
import nav_logo from "../../assets/Admin_Assets/nav-logo.svg";
import profile_icon from "../../assets/Admin_Assets/nav-profile.svg"

const Navbar = () => {
  return (
    <div className="navbar">
        <img src={nav_logo} alt="" className="logo" />
        <img src={profile_icon} alt="" className="profile-icon" />
    </div>
  )
}

export default Navbar