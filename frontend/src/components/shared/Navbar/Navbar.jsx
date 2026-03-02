import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Heart, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Cart from '../Cart/Cart';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
    });
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem("wishlist")) || []; } catch { return []; }
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [productsData, setProductsData] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => setProductsData(data))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    useEffect(() => {
        const handleCartUpdate = () => {
            try { setCart(JSON.parse(localStorage.getItem("cart")) || []); } catch { setCart([]); }
        };
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, []);

    useEffect(() => {
        const handleWishlistUpdate = () => {
            try { setWishlist(JSON.parse(localStorage.getItem("wishlist")) || []); } catch { setWishlist([]); }
        };
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);
        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    }, []);

    return (
        <>
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 cursor-pointer">
                            <button className="p-2 md:hidden text-gray-600 hover:text-blue-600 transition-colors pointer-events-auto" onClick={(e) => e.preventDefault()}>
                                <Menu className="h-6 w-6" />
                            </button>

                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-gray-900 hidden sm:block">
                                Aurelia
                            </span>
                        </Link>

                        <div className="hidden md:flex space-x-8 items-center">
                            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                            <Link to="/shop" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Shop</Link>
                            <Link to="/category" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Categories</Link>
                            <Link to="/offers" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Offers</Link>
                        </div>

                        <div className="hidden lg:flex flex-1 max-w-md ml-8 mr-4 relative">
                            <div className="relative w-full">
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                />
                                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                            </div>

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {productsData.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                        <div className="flex flex-col max-h-[360px] overflow-y-auto">
                                            {productsData
                                                .filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .slice(0, 6)
                                                .map((product, index) => (
                                                    <Link
                                                        key={`${product.name}-${index}`}
                                                        to={`/product/${encodeURIComponent(product.name)}`}
                                                        onClick={() => setSearchQuery("")}
                                                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                    >
                                                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-gray-50 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</span>
                                                            <span className="text-xs text-gray-500 mb-0.5">{product.category}</span>
                                                            <span className="text-sm text-blue-600 font-bold">₹{typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : parseFloat(product.price).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </Link>
                                                ))
                                            }
                                            {productsData.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 6 && (
                                                <Link
                                                    to="/shop"
                                                    onClick={() => setSearchQuery("")}
                                                    className="w-full text-center py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors bg-gray-50"
                                                >
                                                    View all results
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-sm text-gray-500">
                                            No products found matching "<span className="font-semibold text-gray-900">{searchQuery}</span>"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4 sm:space-x-6">
                            <button className="p-1 lg:hidden text-gray-600 hover:text-blue-600 transition-colors">
                                <Search className="h-6 w-6" strokeWidth={1.5} />
                            </button>

                            <Link
                                to="/wishlist"
                                onClick={(e) => {
                                    if (!localStorage.getItem('token')) {
                                        e.preventDefault();
                                        navigate('/login');
                                    }
                                }}
                                className="relative p-1 text-gray-600 hover:text-red-500 transition-colors hidden sm:block group"
                            >
                                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-[11px] text-white font-bold border-2 border-white shadow-sm">
                                    {wishlist.length > 0 ? wishlist.length > 9 ? "9+" : wishlist.length : 0}
                                </span>
                            </Link>

                            <Link to={localStorage.getItem("token") ? "/account" : "/login"} className="text-gray-600 hover:text-blue-600 transition-colors">
                                <User className="h-6 w-6" strokeWidth={1.5} />
                            </Link>

                            <button
                                onClick={() => {
                                    if (!localStorage.getItem('token')) {
                                        navigate('/login');
                                        return;
                                    }
                                    setIsCartOpen(true);
                                }}
                                className="relative p-1 text-gray-600 hover:text-blue-600 transition-colors group"
                            >
                                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-[11px] text-white font-bold border-2 border-white shadow-sm">
                                    {cart.length > 0 ? cart.length > 9 ? "9+" : cart.length : 0}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
            />
        </>
    );
};

export default Navbar;
