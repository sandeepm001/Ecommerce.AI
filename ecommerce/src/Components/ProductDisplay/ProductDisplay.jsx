import React, { useContext, useState } from 'react';
import star_icon from '../Assets/Frontend_Assets/star_icon.png';
import star_dull_icon from '../Assets/Frontend_Assets/star_dull_icon.png';
import './ProductDisplay.css';
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart, showToast, isWishlisted } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState('');
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      showToast('Please login to add items to cart', 'error');
      return;
    }

    if (!selectedSize) {
      showToast('Please select a size first', 'error');
      return;
    }

    addToCart(product.id, {
      message: `${product.name} (${selectedSize}) added to cart`,
      removeFromWishlist: isWishlisted(product.id)
    });
  };

  return (
    <div className="product-display">
      <div className="product-display-left">
        <div className="product-display-img-list">
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-display-main-img">
          <img src={product.image} alt={product.name} />
        </div>
      </div>
      <div className="product-display-right">
        <p className="product-kicker">New season edit</p>
        <h1>{product.name}</h1>
        <div className="product-display-right-star">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <div>(122)</div>
        </div>
        <div className="product-display-right-prices">
          <div className="product-display-right-old">Rs. {product.old_price}</div>
          <div className="product-display-right-new">Rs. {product.new_price}</div>
        </div>
        <div className="product-display-right-desciption">
          {product.description || 'A polished everyday essential with comfortable fabric, clean detailing, and easy styling for repeat wear.'}
        </div>
        <div className="product-display-right-sizes">
          <h1>Select size</h1>
          <div className="product-display-right-size">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={selectedSize === size ? 'selected' : ''}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleAddToCart}>
          ADD TO CART
        </button>
        <p className="product-display-right-category"><span>Category :</span>{product.category}</p>
        <p className="product-display-right-tag"><span>Tags :</span>Modern, Latest, In stock</p>
      </div>
    </div>
  );
};

export default ProductDisplay;
