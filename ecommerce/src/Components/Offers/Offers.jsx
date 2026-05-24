import React from 'react'
import offers_img from '../Assets/Frontend_Assets/exclusive_image.png';
import './Offers.css'
const Offers = () => {
  return (
    <div className='offers'>
        <div className="offers-left">
            <h2>Exclusive</h2>
            <h2>Offers For You</h2>
            <p>ONLY ON BEST SELLER PRODUCTS</p>
            <button className='offers-btn'>Check Now</button>
        </div>
        <div className="offers-right">
            <img src={offers_img} alt="" />
        </div>
        
    </div>
  )
}

export default Offers