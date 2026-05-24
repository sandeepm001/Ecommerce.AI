import React, { useContext } from 'react';
import './CartItem.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/Frontend_Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItem = () => {
  const { all_product, cartItems, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  const subtotal = getTotalCartAmount();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  const cartProducts = all_product.filter((product) => cartItems[product.id] > 0);

  return (
    <div className="cartItems">
      <div className="cart-page-heading">
        <p>Shopping Cart</p>
        <h1>Review your bag</h1>
      </div>

      <div className="cartItems-format-title">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {cartProducts.length === 0 ? (
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add products from the shop to start checkout.</p>
        </div>
      ) : (
        cartProducts.map((product) => (
          <div key={product.id}>
            <div className="cartItmes-format">
              <img src={product.image} className="carticon-product" alt={product.name} />
              <p>{product.name}</p>
              <p>Rs. {product.new_price}</p>
              <button className="cartitems-quantity">{cartItems[product.id]}</button>
              <p>Rs. {product.new_price * cartItems[product.id]}</p>
              <img src={remove_icon} onClick={() => removeFromCart(product.id)} alt="Remove" />
            </div>
          </div>
        ))
      )}

      <div className="cart-items-down">
        <div className="cartItems-total">
          <h1>Order summary</h1>
          <div>
            <div className="cartItem-total">
              <p>Subtotal</p>
              <p>Rs. {subtotal}</p>
            </div>
            <hr />
            <div className="cartItem-total">
              <p>Shipping fee</p>
              <p>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</p>
            </div>
            <hr />
            <div className="cartItem-total">
              <p>Tax estimate</p>
              <p>Rs. {tax}</p>
            </div>
            <hr />
            <div className="cartItem-total">
              <h3>Total</h3>
              <h3>Rs. {total}</h3>
            </div>
          </div>
          <button disabled={subtotal === 0} onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </div>

        <div className="cart-promocode">
          <p>Apply promo code</p>
          <div className="cartitem-promo">
            <input type="text" placeholder="SAVE10" />
            <button type="submit">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
