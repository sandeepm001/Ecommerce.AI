import React, { createContext, useEffect, useState } from 'react'

export const ShopContext = createContext(null);
const TOAST_TIMEOUT = 2200;

const getOrDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getOrDefaultCart);
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist-items');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), TOAST_TIMEOUT);
  };

  useEffect(() => {
    fetch('http://localhost:4000/allProducts')
      .then((res) => res.json())
      .then((data) => setAll_Product(data));
      
    if(localStorage.getItem('auth-token')){
      fetch('http://localhost:4000/getCart',{
        method: "POST",
        headers: {
          'Accept': 'application/form-data',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: "",
      })
        .then((response) => response.json())
        .then((data) => setCartItems(data));
    }
  }, []);
  useEffect(() => {
    console.log("Updated all_product:", all_product);
  }, [all_product]);


  //add items to the cart
  const addToCart = (itemId, options = {}) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))
    if (options.removeFromWishlist) {
      removeFromWishlist(itemId, { showToast: false });
    }
    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/addToCart', {
        method: "POST",
        headers: {
          'Accept': 'application/form-data',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId })
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }
    if (options.showToast !== false) {
      showToast(options.message || 'Item added to cart');
    }

  }
  //Remove from the cart
  const removeFromCart = (itemId, options = {}) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) }));
    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/removeFromCart', {
        method: "POST",
        headers: {
          'Accept': 'application/form-data',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId })
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }
    if (options.showToast) {
      showToast(options.message || 'Item removed from cart');
    }
  }
  const clearCart = () => {
    setCartItems(getOrDefaultCart());
  };

  const toggleWishlist = (itemId) => {
    setWishlistItems((prev) => {
      const exists = prev.includes(itemId);
      const nextWishlist = exists ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      localStorage.setItem('wishlist-items', JSON.stringify(nextWishlist));
      showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
      return nextWishlist;
    });
  };

  const removeFromWishlist = (itemId, options = {}) => {
    setWishlistItems((prev) => {
      const nextWishlist = prev.filter((id) => id !== itemId);
      localStorage.setItem('wishlist-items', JSON.stringify(nextWishlist));
      if (options.showToast !== false && nextWishlist.length !== prev.length) {
        showToast('Removed from wishlist');
      }
      return nextWishlist;
    });
  };

  const isWishlisted = (itemId) => wishlistItems.includes(itemId);

  const getWishlistCount = () => wishlistItems.length;

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let iteminfo = all_product.find((product) => product.id === Number(item));
        if (iteminfo) {
          totalAmount += iteminfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalCount += cartItems[item];
      }
    }
    return totalCount;
  }

  const contextValue = {
    all_product,
    cartItems,
    wishlistItems,
    toast,
    addToCart,
    removeFromCart,
    clearCart,
    toggleWishlist,
    removeFromWishlist,
    isWishlisted,
    showToast,
    getTotalCartAmount,
    getCartCount,
    getWishlistCount
  };
  console.log(cartItems)

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
      {toast && <div className={`app-toast ${toast.type}`}>{toast.message}</div>}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider;
