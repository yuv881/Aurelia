import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import Button from "../Buttons/ATC_Button";

const ProductSlider = () => {
    const navigate = useNavigate();
    const sliderRef = useRef(null);

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

    const nextSlide = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const prevSlide = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

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

    const products = [
        {
            "id": 101, // give them unique ids for the cart
            "name": "Wireless Bluetooth Headphones",
            "category": "Electronics",
            "price": 2499,
            "stock": 35,
            "rating": 4.5,
            "brand": "SoundMax",
            "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
            "description": "Experience premium quality with the Wireless Bluetooth Headphones by SoundMax."
        },
        {
            "id": 102,
            "name": "Smart Fitness Band",
            "category": "Electronics",
            "price": 1799,
            "stock": 50,
            "rating": 4.2,
            "brand": "FitPulse",
            "image": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?q=80&w=800&auto=format&fit=crop",
            "description": "Experience premium quality with the Smart Fitness Band by FitPulse."
        },
        {
            "id": 103,
            "name": "Men's Casual T-Shirt",
            "category": "Fashion",
            "price": 699,
            "stock": 80,
            "rating": 4.1,
            "brand": "UrbanWear",
            "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
            "description": "Experience premium quality with the Men's Casual T-Shirt by UrbanWear."
        },
        {
            "id": 104,
            "name": "Women's Denim Jacket",
            "category": "Fashion",
            "price": 2199,
            "stock": 22,
            "rating": 4.6,
            "brand": "StyleHub",
            "image": "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop",
            "description": "Experience premium quality with the Women's Denim Jacket by StyleHub."
        },
        {
            "id": 105,
            "name": "Running Shoes",
            "category": "Footwear",
            "price": 3299,
            "stock": 40,
            "rating": 4.4,
            "brand": "RunFast",
            "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
            "description": "Experience premium quality with the Running Shoes by RunFast."
        },
        {
            "id": 106,
            "name": "Classic Aviator Sunglasses",
            "category": "Accessories",
            "price": 1299,
            "stock": 15,
            "rating": 4.8,
            "brand": "SunBlock",
            "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
            "description": "Experience premium quality with the Classic Aviator Sunglasses by SunBlock."
        }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Featured Products</h2>
                        <p className="text-gray-500 max-w-2xl">Handpicked collections specially curated for you.</p>
                    </div>
                    <div className="hidden sm:flex gap-3">
                        <button
                            onClick={prevSlide}
                            className="p-3 border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                            aria-label="Previous products"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                            aria-label="Next products"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        ref={sliderRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2 px-2 -mx-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] snap-start shrink-0 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group/card"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-50">
                                    <Link to={`/product/${encodeURIComponent(product.name)}`} className="block w-full h-full">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500 ease-in-out"
                                        />
                                    </Link>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => handleAddToWishlist(product)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${wishlist.some(item => item.name === product.name)
                                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                : 'bg-white hover:bg-blue-600 hover:text-white text-gray-900'
                                                }`}
                                        >
                                            <Heart className="w-5 h-5" fill={wishlist.some(item => item.name === product.name) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                            {product.brand}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 mb-1 tracking-wider uppercase">{product.category}</p>
                                            <h3 className="font-semibold text-gray-900 leading-tight line-clamp-1" title={product.name}>
                                                <Link to={`/product/${encodeURIComponent(product.name)}`} className="hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </Link>
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 mb-4">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                                        <span className="text-sm text-gray-400 ml-1">({product.stock} in stock)</span>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-bold text-xl text-gray-900">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </span>
                                        <Button
                                            label="Add to cart"
                                            onClick={() => handleAddToCart(product)}
                                            className="px-4 py-2 text-sm whitespace-nowrap"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-center sm:hidden">
                    <Link to="/products" className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl w-full text-center hover:bg-gray-800 transition-colors">
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProductSlider;