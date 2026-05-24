import React, { useContext } from 'react';
import Item from '../Components/Item/Item';
import { ShopContext } from '../Context/ShopContext';
import './styles/Wishlist.css';

const Wishlist = () => {
  const { all_product, wishlistItems } = useContext(ShopContext);
  const products = all_product.filter((product) => wishlistItems.includes(product.id));

  return (
    <main className="wishlist-page">
      <section className="wishlist-heading">
        <p>Wishlist</p>
        <h1>Saved styles</h1>
      </section>

      {products.length === 0 ? (
        <div className="wishlist-empty">
          <h2>No saved items yet</h2>
          <p>Tap the heart on any product card to save it here.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <Item
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              new_price={product.new_price}
              old_price={product.old_price}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;
