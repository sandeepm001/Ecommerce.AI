import React from 'react'
import "./Sidebar.css";
import addProduct_icon from '../../assets/Admin_Assets/Product_Cart.svg';
import cartList_icon from "../../assets/Admin_Assets/Product_list_icon.svg";
import {Link} from "react-router-dom";

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Link to = {'/addProduct'} style = {{textDecoration:"none"}}>
        <div className="addProduct">
            <img src={addProduct_icon} alt="" />
            <p>Add Product</p>
        </div>
        </Link>
        <Link to = {'/listProduct'} style = {{textDecoration:"none"}}>
        <div className="addProduct">
            <img src={cartList_icon}  alt="" />
            <p>Product List</p>
        </div>
        </Link>

    </div>
  )
}

export default Sidebar