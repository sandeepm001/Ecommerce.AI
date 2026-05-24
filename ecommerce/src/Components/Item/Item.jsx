import React, { useContext } from 'react'
import './Item.css'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'

const Item = (props) => {
  const { addToCart, removeFromCart, toggleWishlist, isWishlisted, showToast, cartItems } = useContext(ShopContext);
  const navigate = useNavigate();
  const cartQuantity = cartItems[props.id] || 0;

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!localStorage.getItem('auth-token')) {
      showToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }

    addToCart(props.id, {
      message: `${props.name} added to cart`,
      removeFromWishlist: isWishlisted(props.id)
    });
  };

  const handleDecrease = (event) => {
    event.preventDefault();
    event.stopPropagation();
    removeFromCart(props.id);
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(props.id);
  };

  return (
    <div className='item'>
        <button
          className={`item-wishlist ${isWishlisted(props.id) ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          title="Wishlist"
        >
          {isWishlisted(props.id) ? '♥' : '♡'}
        </button>
        <Link to={`/product/${props.id}`}><img onClick={() => window.scrollTo({top:0,left:0,behavior:'smooth'})} src={props.image} alt={props.name} /></Link>
        <p>{props.name}</p>
        <div className="item-price">
            <div className="item-price-new">
                Rs. {props.new_price}
            </div>
            <div className="item-price-old">
                Rs. {props.old_price}
            </div>
        </div>
        {cartQuantity > 0 ? (
          <div className="item-cart-stepper">
            <button onClick={handleDecrease} aria-label="Decrease quantity">-</button>
            <span>{cartQuantity}</span>
            <button onClick={handleAddToCart} aria-label="Increase quantity">+</button>
          </div>
        ) : (
          <button className="item-cart-button" onClick={handleAddToCart}>Add to cart</button>
        )}
    </div>
  )
}

export default Item
