import { Routes, Route } from "react-router-dom"
import MainPage from "./components/MainPage"
import HomePage from "./components/modules/HomePage/HomePage"
import Product from "./components/modules/productPage/product"
import ProductDetails from "./components/modules/productPage/productPage"
import WishlistPage from "./components/modules/WishlistPage/WishlistPage"
import CollectionPage from "./components/modules/collectionPage/CollectionPage"
import Account from "./components/modules/AccountPage/Account"
import Login from "./components/modules/AccountPage/login/login"
import Register from "./components/modules/AccountPage/login/register"
import ProtectedRoute from "./components/shared/ProtectedRoute"
import Checkout from "./components/modules/checkout/checkout"

function App() {
  return (
    <Routes>
      {/* ── Auth pages — no Navbar/Footer ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

      {/* ── Main layout — Navbar + Footer ── */}
      <Route path="/" element={<MainPage />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<Product />} />
        <Route path="category" element={<CollectionPage />} />
        <Route path="category/:category" element={<CollectionPage />} />
        <Route path="product/:productName" element={<ProductDetails />} />
        <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="account" element={<Account />} />
      </Route>
    </Routes>
  )
}

export default App
