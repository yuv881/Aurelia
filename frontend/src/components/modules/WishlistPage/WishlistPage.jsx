import React, { useState, useEffect } from 'react';
import ProductCard from '../../shared/Cards/ProductCard';
import { HeartCrack } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../../shared/Pagination/Pagination';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Adjust as needed

    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlist(storedWishlist);

        // Listen to wishlist updates to sync state if it changes elsewhere
        const handleWishlistUpdate = () => {
            const updated = JSON.parse(localStorage.getItem("wishlist")) || [];
            setWishlist(updated);
        };
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);
        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(wishlist.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = wishlist.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // If items are removed from the last page, we might need to adjust the current page
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    return (
        <div className="bg-white min-h-[60vh]">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Wishlist</h1>
                    <p className="text-gray-500 mt-2">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>

                {wishlist.length > 0 ? (
                    <>
                        <ProductCard products={currentItems} />

                        {totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex flex-col items-center justify-center mb-6 text-gray-400">
                            <HeartCrack className="w-12 h-12" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 max-w-sm mb-8">
                            Looks like you haven't added anything to your wishlist yet. Explore our products and save your favorites!
                        </p>
                        <Link
                            to="/shop"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-md hover:shadow-lg"
                        >
                            Explore Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;