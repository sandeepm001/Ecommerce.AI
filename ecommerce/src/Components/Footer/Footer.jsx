import React from 'react'
import './Footer.css'
import instagram_icon from '../Assets/Frontend_Assets/instagram_icon.png'
import whatsapp_icon from '../Assets/Frontend_Assets/whatsapp_icon.png'
import pinintrest_icon from '../Assets/Frontend_Assets/pintester_icon.png'
const Footer = () => {
  return (
    <div className = "footer">
        <ul className="footer-links">
            <li>Company</li>
            <li>Products</li>
            <li>About</li>
            <li>Company</li>
            <li>Office</li>
        </ul>
        <div className="footer-logo-container">
            <img src={instagram_icon} alt="" />
            <img src={pinintrest_icon} alt="" />
            <img src={whatsapp_icon} alt="" />
        </div>
        <div className="footer-copyright">
            <hr />
            <p>Copyright @ 2025 - All Rights Reserved</p>
        </div>
    </div>
  )
}

export default Footer