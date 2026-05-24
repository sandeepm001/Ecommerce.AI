import './App.css';
import Navbar from './Components/Navbar/Navbar';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Shop from './Pages/Shop';
import Login from './Pages/Login';
import ShopCategory from './Pages/ShopCategory';
import Cart from './Pages/Cart';
import Product from './Pages/Product';
import Checkout from './Pages/Checkout';
import Wishlist from './Pages/Wishlist';
import Account from './Pages/Account';
import Footer from './Components/Footer/Footer'
import men_banner from './Components/Assets/Frontend_Assets/banner_mens.png';
import women_banner from './Components/Assets/Frontend_Assets/banner_women.png';
import kids_banner from './Components/Assets/Frontend_Assets/banner_kid.png';
import Search from './Components/Search/Search';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop/>} />
        <Route path="/Login" element={<Login/>} />
        <Route path="/men" element={<ShopCategory banner={men_banner} category ="men" />} />
        <Route path="/women" element={<ShopCategory banner={women_banner} category ="women" />} />
        <Route path="/kids" element={<ShopCategory banner={kids_banner} category ="kid" />} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/wishlist" element={<Wishlist/>} />
        <Route path="/account" element={<Account/>} />
        <Route path="/product" element={<Product/>} />
        <Route path="/product/:productId" element={<Product/>} />
        <Route path="/search" element = {<Search />} />
      </Routes>
      <Footer />
      </BrowserRouter>
         
    </div>
  );
}

export default App;
