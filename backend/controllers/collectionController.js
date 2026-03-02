import { getAllCollections, getCollectionById, createCollection, updateCollection, deleteCollection, getCollectionProducts } from "../queries/collectionQueries.js";

// Get all collections
export const getAllCollectionsController = async (req, res) => {
    try {
        const collections = await getAllCollections();
        res.status(200).json(collections);
    } catch (error) {
        console.error("Error fetching collections:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Get collection by ID
export const getCollectionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollectionById(id);
        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (error) {
        console.error("Error fetching collection:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Create collection
export const createCollectionController = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Collection name is required" });
        }

        const collection = await createCollection(name, description);
        res.status(201).json(collection);
    } catch (error) {
        console.error("Error creating collection:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Update collection
export const updateCollectionController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Collection name is required" });
        }

        const collection = await updateCollection(id, name, description);
        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (error) {
        console.error("Error updating collection:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Delete collection
export const deleteCollectionController = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await deleteCollection(id);
        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (error) {
        console.error("Error deleting collection:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Get products in a collection
export const getCollectionProductsController = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await getCollectionProducts(id);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching collection products:", error);
        res.status(500).json({ error: "Server error" });
    }
};