import React from 'react'
import "./Admin.css";
import Navbar from '../Components/Navbar/Navbar';
import Sidebar from '../Components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import AddProduct from '../Components/addProduct/addProduct';
import ListProduct from '../Components/listProduct/listProduct';


const admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <Routes >
        <Route path = '/addProduct' element = {<AddProduct />} />
        <Route path = '/listProduct' element = {<ListProduct />} />
      </Routes>
    </div>
  )
}

export default admin