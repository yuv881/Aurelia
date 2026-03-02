import React, { useState, useEffect } from "react";
import ProductCard from "../../shared/Cards/ProductCard"
import { useParams, Link } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CollectionPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching collections:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div className="text-center py-20 text-gray-500">Loading collections...</div>;
    }

    // If a specific category is requested, show products for that category
    if (category) {
        const categoryProducts = products.filter((product) => product.category.toLowerCase() === category.toLowerCase());

        return (
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 block">
                    <Link to="/category" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">&larr; All Categories</Link>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">
                        {category} Collection
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {categoryProducts.length} items found
                    </p>
                </div>

                {categoryProducts.length > 0 ? (
                    <ProductCard products={categoryProducts} />
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
                        <p className="text-gray-500">We couldn't find any products in this category.</p>
                    </div>
                )}
            </div>
        );
    }

    // Otherwise, calculate and show unique category cards
    const uniqueCategories = [];
    const categoryMap = new Map();

    products.forEach(product => {
        if (!categoryMap.has(product.category)) {
            categoryMap.set(product.category, product.image);
            uniqueCategories.push({
                name: product.category,
                image: product.image,
                itemCount: products.filter(p => p.category === product.category).length
            });
        }
    });

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Shop by Category
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    Explore our wide range of collections. Find exactly what you're looking for.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {uniqueCategories.map((cat, index) => (
                    <Link
                        key={index}
                        to={`/category/${encodeURIComponent(cat.name.toLowerCase())}`}
                        className="group relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/40 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-300">
                                {cat.name}
                            </h3>
                            <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-75">
                                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 truncate">
                                    {cat.itemCount} Products
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default CollectionPage;