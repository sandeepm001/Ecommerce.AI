import React, { useContext, useState } from 'react';
import './Navbar.css';
import logo from '../Assets/Frontend_Assets/Logo2.png';
import cart from '../Assets/Frontend_Assets/cart_icon.png';
import search from '../Assets/Frontend_Assets/search.png';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getCartCount, getWishlistCount } = useContext(ShopContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const closeDropdown = () => setDropdownOpen(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`)
  };

  const onLinkClick = (menuName) => {
    setMenu(menuName);
    closeDropdown();
  };

  return (
    <>
      <div className='navbar'>
        <div
          className="burger-icon"
          onClick={toggleDropdown}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') toggleDropdown(); }}
        >
          &#9776;
        </div>
        <div className="navlogo">
          <Link to="/" onClick={closeDropdown}>
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <ul className='nav-menu'>
          <li onClick={() => setMenu("shop")}>
            <Link className='link-no-style' to='/'>Shop</Link>
            {menu === "shop" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("men")}>
            <Link className='link-no-style' to='/men'>Men</Link>
            {menu === "men" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("women")}>
            <Link className='link-no-style' to='/women'>Women</Link>
            {menu === "women" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("kid")}>
            <Link className='link-no-style' to='/kids'>Kids</Link>
            {menu === "kid" ? <hr /> : null}
          </li>
        </ul>
        <div className="search">
          <input
            type="text"
            placeholder='Search'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch()
            }}

          />
          <img src={search} alt="Search" onClick={handleSearch} />
        </div>

        {localStorage.getItem('auth-token')
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace('/') }} className="login-button">Logout</button>
          : <Link style={{ textDecoration: "none" }} to='/login' onClick={closeDropdown}>
            <button onClick={() => window.scrollTo({ top: 0, left: 0 })} className="login-button">
              Login
            </button>
          </Link>}

        <div className="nav-actions">
          <Link to="/wishlist" onClick={closeDropdown} className="nav-icon-button" aria-label="Wishlist" title="Wishlist">
            <span className="nav-symbol">♡</span>
            {getWishlistCount() > 0 && <div className="nav-cart-count">{getWishlistCount()}</div>}
          </Link>

          {localStorage.getItem('auth-token') && (
            <Link to="/account" onClick={closeDropdown} className="nav-icon-button account-symbol" aria-label="Account" title="Account">
              <span className="nav-symbol">◎</span>
            </Link>
          )}

          {localStorage.getItem('auth-token')
            && <div className="nav-login-cart">
              <Link to='/cart' onClick={closeDropdown}>
                <div className='cart-icon'>
                  <img src={cart} alt="Cart" />
                  <div className="nav-cart-count">{getCartCount()}</div>
                </div>
              </Link>
            </div>}
        </div>

      </div>

      {/* Dropdown menu below navbar */}
      <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => onLinkClick("shop")}><Link to='/'>Shop</Link></li>
          <li onClick={() => onLinkClick("men")}><Link to='/men'>Men</Link></li>
          <li onClick={() => onLinkClick("women")}><Link to='/women'>Women</Link></li>
          <li onClick={() => onLinkClick("kid")}><Link to='/kids'>Kids</Link></li>
          <li><Link to='/wishlist' onClick={closeDropdown}>Wishlist</Link></li>
          {localStorage.getItem('auth-token') && <li><Link to='/account' onClick={closeDropdown}>Account</Link></li>}
          <li><Link to='/login' onClick={closeDropdown}>Login</Link></li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
