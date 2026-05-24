import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import drop_down_icon from '../Components/Assets/Frontend_Assets/dropdown_icon.png'

import Item from '../Components/Item/Item'
import './styles/ShopCategory.css'; 

const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext)
  return (
    <div className="shop-category">
      <img className='banners' src={props.banner} alt="" />
      <div className='shopCategory-sort'>
        <p>
          <span>Showing 1-12</span> out of 36 products
        </p>
        <div className="sort-btn">
          Sort by
          <img src={drop_down_icon} alt="" />
        </div>
      </div>
      <div className="shopCategory-items">
        {all_product.map((item,i)=>{
          if (item.category.toLowerCase().trim() === props.category.toLowerCase().trim()){
            return <Item  key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>

          }else{
            return null;
          }

        })}
      </div>
      <div className='explore-more'>
        <p>explore more</p>
        <img src={drop_down_icon} alt="" />
      </div>
    </div>
  )
}

export default ShopCategory