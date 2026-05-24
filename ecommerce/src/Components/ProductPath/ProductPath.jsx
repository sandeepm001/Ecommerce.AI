import React from 'react'
import './productPath.css'
import next_icon from '../Assets/Frontend_Assets/next.png'

const ProductPath = (props) => {
    const {product} = props;
    

  return (
    <div className="product-path">
        Home <img src={next_icon} alt="" /> Shop <img src={next_icon} alt="" /> {product.category} <img src={next_icon} alt="" />{product.name}
    </div>
  )
}

export default ProductPath