import React, { useState, useEffect } from 'react'
import ProductCard from "../../shared/Cards/ProductCard"
import Pagination from "../../shared/Pagination/Pagination"

const product = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 25;

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => {
                setAllProducts(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                setIsLoading(false);
            });
    }, []);

    const totalPages = Math.ceil(allProducts.length / itemsPerPage) || 1;
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    if (isLoading) {
        return <div className="text-center py-20 text-gray-500">Loading products...</div>;
    }

    return (
        <div>
            <div>
                <ProductCard products={currentProducts} />
            </div>
            <div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    )
}

export default product