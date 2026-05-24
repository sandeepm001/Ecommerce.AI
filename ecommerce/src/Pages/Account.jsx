import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Account.css';

const emptyAddress = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

const Account = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [message, setMessage] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [cancelReasons, setCancelReasons] = useState({});

  const token = localStorage.getItem('auth-token');

  const loadAccount = useCallback(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = { 'auth-token': token };
    fetch('http://localhost:4000/account', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.user);
        }
      });

    fetch('http://localhost:4000/orders/me', { headers })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, [navigate, token]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleChange = (event) => {
    setAddressForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const response = await fetch('http://localhost:4000/address/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify(addressForm),
    });
    const data = await response.json();

    if (data.success) {
      setProfile((prev) => ({ ...prev, addresses: data.addresses }));
      setAddressForm(emptyAddress);
      setMessage('Address saved');
    } else {
      setMessage('Could not save address');
    }
  };

  const handleMakeDefault = async (addressId) => {
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
      setProfile((prev) => ({ ...prev, addresses: data.addresses }));
      setMessage('Default address updated');
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleCancelOrder = async (orderId) => {
    const reason = cancelReasons[orderId];
    if (!reason?.trim()) {
      setMessage('Please enter a cancellation reason');
      return;
    }

    const response = await fetch('http://localhost:4000/orders/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify({ orderId, reason }),
    });
    const data = await response.json();

    if (data.success) {
      setOrders((prev) => prev.map((order) => (order._id === orderId ? data.order : order)));
      setMessage('Order cancelled');
    } else {
      setMessage(data.errors || 'Could not cancel order');
    }
  };

  return (
    <main className="account-page">
      <section className="account-heading">
        <p>Account</p>
        <h1>Profile, addresses and orders</h1>
      </section>

      <section className="account-grid">
        <div className="account-panel">
          <h2>Profile</h2>
          <p className="account-name">{profile?.name || 'Customer'}</p>
          <p>{profile?.email}</p>
        </div>

        <div className="account-panel">
          <h2>Saved addresses</h2>
          {profile?.addresses?.length ? (
            <div className="address-list">
              {profile.addresses.map((address) => (
                <div className="address-item" key={address._id || `${address.address}-${address.pincode}`}>
                  <strong>{address.fullName}</strong>
                  {address.isDefault && <em>Default</em>}
                  <p>{address.address}, {address.city}, {address.state} - {address.pincode}</p>
                  <span>{address.phone}</span>
                  {!address.isDefault && (
                    <button type="button" onClick={() => handleMakeDefault(address._id)}>Make default</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No saved addresses yet.</p>
          )}

          <form className="address-form" onSubmit={handleAddressSubmit}>
            <input name="fullName" placeholder="Full name" value={addressForm.fullName} onChange={handleChange} required />
            <input name="phone" placeholder="Phone" value={addressForm.phone} onChange={handleChange} required />
            <input className="full" name="address" placeholder="Address" value={addressForm.address} onChange={handleChange} required />
            <input name="city" placeholder="City" value={addressForm.city} onChange={handleChange} required />
            <input name="state" placeholder="State" value={addressForm.state} onChange={handleChange} required />
            <input name="pincode" placeholder="PIN code" value={addressForm.pincode} onChange={handleChange} required />
            <button type="submit">Save address</button>
          </form>
          {message && <p className="account-message">{message}</p>}
        </div>

        <div className="account-panel orders-panel">
          <h2>Previous orders</h2>
          {orders.length ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-item" key={order._id}>
                  <div className="order-summary-row">
                    <div>
                      <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                      <p>{new Date(order.date).toLocaleDateString()} - {order.status}</p>
                    </div>
                    <span>Rs. {order.amounts?.total || 0}</span>
                    <button type="button" onClick={() => toggleOrder(order._id)}>
                      {expandedOrders[order._id] ? 'Hide details' : 'View details'}
                    </button>
                  </div>

                  {expandedOrders[order._id] && (
                    <div className="order-details">
                      <div className="order-products">
                        {order.items?.map((item) => (
                          <div className="order-product" key={`${order._id}-${item.productId}`}>
                            <img src={item.image} alt={item.name} />
                            <div>
                              <strong>{item.name}</strong>
                              <p>Qty {item.quantity} x Rs. {item.price}</p>
                            </div>
                            <span>Rs. {item.total}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-breakdown">
                        <p><span>Subtotal</span><span>Rs. {order.amounts?.subtotal || 0}</span></p>
                        <p><span>Shipping</span><span>{order.amounts?.shipping ? `Rs. ${order.amounts.shipping}` : 'Free'}</span></p>
                        <p><span>Tax</span><span>Rs. {order.amounts?.tax || 0}</span></p>
                        <strong><span>Total</span><span>Rs. {order.amounts?.total || 0}</span></strong>
                      </div>

                      <div className="order-address">
                        <strong>Delivery address</strong>
                        <p>
                          {order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                      </div>

                      <div className="order-timeline">
                        {(order.timeline || []).map((step) => (
                          <div className={`timeline-step ${step.completed ? 'completed' : ''}`} key={`${order._id}-${step.label}`}>
                            <span />
                            <div>
                              <strong>{step.label}</strong>
                              <p>{step.description}</p>
                              {step.date && <small>{new Date(step.date).toLocaleString()}</small>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <div className="cancel-order">
                          <input
                            placeholder="Reason for cancellation"
                            value={cancelReasons[order._id] || ''}
                            onChange={(event) => setCancelReasons((prev) => ({ ...prev, [order._id]: event.target.value }))}
                          />
                          <button type="button" onClick={() => handleCancelOrder(order._id)}>Cancel order</button>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <p className="cancelled-note">Cancelled: {order.cancellation?.reason}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Orders you place will appear here.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Account;
