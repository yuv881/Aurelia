import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ArrowLeft, Plus, Minus } from 'lucide-react';
import Button from '../../shared/Buttons/ATC_Button';

const ProductPage = () => {
    const { productName } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem("wishlist")) || []; } catch { return []; }
    });

    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => {
                const foundProduct = data.find(p => p.name.toLowerCase() === decodeURIComponent(productName).toLowerCase());
                setProduct(foundProduct);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                setIsLoading(false);
            });
    }, [productName]);

    useEffect(() => {
        const handleWishlistUpdate = () => {
            try { setWishlist(JSON.parse(localStorage.getItem("wishlist")) || []); } catch { setWishlist([]); }
        };
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);
        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    }, []);

    if (isLoading) {
        return <div className="text-center py-20 text-gray-500">Loading product...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                <Link to="/shop" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Shop
                </Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        // Add multiple based on quantity
        for (let i = 0; i < quantity; i++) {
            cart.push(product);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleAddToWishlist = () => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        if (currentWishlist.some(item => item.name === product.name)) {
            currentWishlist = currentWishlist.filter(item => item.name !== product.name);
        } else {
            currentWishlist.push(product);
        }
        localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
        window.dispatchEvent(new Event("wishlistUpdated"));
    };

    const isWishlisted = wishlist.some(item => item.name === product.name);

    return (
        <div className="bg-white min-h-[80vh]">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Image Gallery */}
                    <div className="lg:w-1/2">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:w-1/2 flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                {product.name}
                            </h1>
                            <p className="text-lg text-blue-600 font-semibold mb-4">{product.brand}</p>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-bold text-yellow-700">{product.rating}</span>
                                </div>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            <div className="text-4xl font-extrabold text-gray-900 mb-6">
                                ₹{typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : parseFloat(product.price).toLocaleString('en-IN')}
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                {product.description || `Experience premium quality with the ${product.name} by ${product.brand}. This exceptional item from our ${product.category} collection is designed for everyday excellence, durability, and top-tier performance.`}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-200 rounded-xl bg-white w-fit shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-4 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-l-xl transition-colors shrink-0"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-4 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-r-xl transition-colors shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                label="Add to Cart"
                                className="flex-1 py-4 text-lg justify-center shadow-lg hover:shadow-xl"
                                disabled={product.stock === 0}
                            />

                            {/* Wishlist Inline Button */}
                            <button
                                onClick={handleAddToWishlist}
                                className={`h-[60px] w-[60px] sm:w-auto sm:px-5 shrink-0 rounded-xl flex items-center justify-center shadow-sm transition-all border ${isWishlisted
                                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <Heart className="w-6 h-6 transition-transform hover:scale-110" fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="font-medium">Category</span>
                                    <span>{product.category}</span>
                                </li>
                                <li className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="font-medium">Brand</span>
                                    <span>{product.brand}</span>
                                </li>
                                <li className="flex justify-between pb-2">
                                    <span className="font-medium">SKU</span>
                                    <span className="text-gray-400">PRD-{product.name.substring(0, 3).toUpperCase()}-{Math.floor(Math.random() * 1000)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;