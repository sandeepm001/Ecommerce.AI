import React from 'react'
import './ProductRelated.css';
import related_product from '../Assets/Frontend_Assets/data.js';
import Item from '../Item/Item.jsx';
const ProductRelated = () => {
  return (
    <div className="relatedProducts">
        <h2>SIMILAR PRODUCTS</h2>
        <div className="relatedProducts-items">
            {related_product.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}

export default ProductRelated