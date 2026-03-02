import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Button from "../Buttons/ATC_Button"

const ProductCard = ({ products = [] }) => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem("wishlist")) || []; } catch { return []; }
    });

    useEffect(() => {
        const handleWishlistUpdate = () => {
            try { setWishlist(JSON.parse(localStorage.getItem("wishlist")) || []); } catch { setWishlist([]); }
        };
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);
        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    }, []);

    const handleAddToCart = (product) => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
    }

    const handleAddToWishlist = (product) => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        // Check by name as fallback since JSON products don't have IDs
        if (currentWishlist.some(item => item.name === product.name)) {
            // Remove from wishlist
            currentWishlist = currentWishlist.filter(item => item.name !== product.name);
        } else {
            // Add to wishlist
            currentWishlist.push(product);
        }
        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));
    }
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((product, index) => (
                    <div key={`${product.name}-${index}`} className="border border-gray-100 bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg mb-4 bg-gray-50 shrink-0">
                            <Link to={`/product/${encodeURIComponent(product.name)}`} className="block w-full h-full">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                />
                            </Link>
                            {/* Optional: Add a subtle overlay on hover */}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Wishlist Button Overlay */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddToWishlist(product);
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${wishlist.some(item => item.name === product.name)
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-white hover:bg-blue-600 hover:text-white text-gray-900'
                                        }`}
                                >
                                    <Heart className="w-5 h-5" fill={wishlist.some(item => item.name === product.name) ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col grow">
                            <div className="mb-2">
                                <p className="text-sm font-medium text-blue-600 mb-1">{product.category}</p>
                                <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                                    <Link to={`/product/${encodeURIComponent(product.name)}`} className="hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </Link>
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                            </div>

                            <div className="mt-auto flex flex-col gap-3">
                                <div>
                                    <span className="font-bold text-xl text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                                </div>
                                <Button onClick={() => handleAddToCart(product)} label="Add to Cart" className="w-full justify-center" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductCard