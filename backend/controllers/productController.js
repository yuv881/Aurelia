import { getAllProducts, getProductById, getProductsByCategory, createProduct } from "../queries/productQueries.js";

// Get all products
export const getAllProductsController = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ 
            error: "Server error during products fetch",
            message: error.message,
            code: error.code
        });
    }
};

// Get product by ID
export const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ 
            error: "Server error during product fetch",
            message: error.message,
            code: error.code
        });
    }
};

// Get products by category
export const getProductsByCategoryController = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await getProductsByCategory(category);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ 
            error: "Server error during category products fetch",
            message: error.message,
            code: error.code
        });
    }
};

// Create newly added product
export const createProductController = async (req, res) => {
    try {
        const { name, category, price, stock, rating, brand, image, description } = req.body;

        // Basic validation
        if (!name || !category || !price || stock === undefined || rating === undefined || !brand) {
            return res.status(400).json({ error: "Missing required product fields" });
        }

        const product = await createProduct(name, category, price, stock, rating, brand, image, description);
        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ 
            error: "Server error during product creation",
            message: error.message,
            code: error.code
        });
    }
};