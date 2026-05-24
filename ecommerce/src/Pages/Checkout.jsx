import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './styles/Checkout.css';

const emptyAddress = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

const Checkout = () => {
  const { all_product, cartItems, getTotalCartAmount, clearCart } = useContext(ShopContext);
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [status, setStatus] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartProducts = useMemo(
    () => all_product.filter((product) => cartItems[product.id] > 0),
    [all_product, cartItems]
  );
  const subtotal = getTotalCartAmount();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      return;
    }

    fetch('http://localhost:4000/account', {
      headers: { 'auth-token': token },
    })
      .then((res) => res.json())
      .then((data) => {
        const addresses = data.user?.addresses || [];
        const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
        setSavedAddresses(addresses);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          setShippingAddress({
            fullName: defaultAddress.fullName || '',
            phone: defaultAddress.phone || '',
            address: defaultAddress.address || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.pincode || '',
          });
        }
      });
  }, []);

  const handleChange = (event) => {
    setSelectedAddressId('');
    setShippingAddress((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    setShippingAddress({
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
    });
  };

  const handleMakeDefault = async (addressId) => {
    const token = localStorage.getItem('auth-token');
    const response = await fetch('http://localhost:4000/address/default', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify({ addressId }),
    });
    const data = await response.json();
    if (data.success) {
      setSavedAddresses(data.addresses);
      setStatus('Default address updated.');
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('auth-token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setStatus('Creating secure payment session...');

    try {
      const createResponse = await fetch('http://localhost:4000/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify({
          shippingAddress: {
            ...shippingAddress,
            addressId: selectedAddressId,
          },
          paymentMethod,
          provider: 'mock',
        }),
      });
      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.errors || 'Could not start checkout');
      }

      setStatus('Authorizing payment...');

      const confirmResponse = await fetch('http://localhost:4000/checkout/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify({
          orderId: createData.orderId,
          paymentReference: createData.paymentSession.sessionId,
          status: 'paid',
        }),
      });
      const confirmData = await confirmResponse.json();

      if (!confirmData.success) {
        throw new Error(confirmData.errors || 'Payment failed');
      }

      clearCart();
      setOrderNumber(confirmData.order._id);
      setStatus('Payment successful. Your order has been placed.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <main className="checkout-page checkout-success">
        <section>
          <p className="checkout-eyebrow">Order placed</p>
          <h1>Thanks for shopping with us.</h1>
          <p>Your payment was recorded and the order is ready for fulfilment.</p>
          <div className="success-order">Order ID: {orderNumber}</div>
          <button onClick={() => navigate('/')}>Continue shopping</button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-header">
        <p className="checkout-eyebrow">Secure Checkout</p>
        <h1>Delivery and payment</h1>
      </section>

      <form className="checkout-layout" onSubmit={handlePayment}>
        <section className="checkout-panel">
          <h2>Shipping details</h2>
          {savedAddresses.length > 0 && (
            <div className="saved-addresses">
              {savedAddresses.map((address) => (
                <label key={address._id} className={selectedAddressId === address._id ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedAddressId === address._id}
                    onChange={() => handleSelectAddress(address)}
                  />
                  <span>
                    <strong>{address.fullName}</strong>
                    {address.isDefault && <em>Default</em>}
                    <small>{address.address}, {address.city}, {address.state} - {address.pincode}</small>
                  </span>
                  {!address.isDefault && (
                    <button type="button" onClick={() => handleMakeDefault(address._id)}>Make default</button>
                  )}
                </label>
              ))}
            </div>
          )}
          <div className="checkout-grid">
            <input name="fullName" placeholder="Full name" value={shippingAddress.fullName} onChange={handleChange} required />
            <input name="phone" placeholder="Phone number" value={shippingAddress.phone} onChange={handleChange} required />
            <input className="full" name="address" placeholder="Street address" value={shippingAddress.address} onChange={handleChange} required />
            <input name="city" placeholder="City" value={shippingAddress.city} onChange={handleChange} required />
            <input name="state" placeholder="State" value={shippingAddress.state} onChange={handleChange} required />
            <input name="pincode" placeholder="PIN code" value={shippingAddress.pincode} onChange={handleChange} required />
          </div>

          <h2>Payment method</h2>
          <div className="payment-options">
            {['card', 'upi', 'cod'].map((method) => (
              <label key={method} className={paymentMethod === method ? 'selected' : ''}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span>{method === 'card' ? 'Card' : method === 'upi' ? 'UPI' : 'Cash on delivery'}</span>
              </label>
            ))}
          </div>

          <button className="pay-button" type="submit" disabled={isSubmitting || subtotal === 0}>
            {isSubmitting ? 'Processing...' : `Pay Rs. ${total}`}
          </button>
          {status && <p className="checkout-status">{status}</p>}
        </section>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {cartProducts.map((product) => (
            <div className="summary-item" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div>
                <p>{product.name}</p>
                <span>Qty {cartItems[product.id]}</span>
              </div>
              <strong>Rs. {product.new_price * cartItems[product.id]}</strong>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
          <div className="summary-row"><span>Tax</span><span>Rs. {tax}</span></div>
          <div className="summary-total"><span>Total</span><span>Rs. {total}</span></div>
        </aside>
      </form>
    </main>
  );
};

export default Checkout;
