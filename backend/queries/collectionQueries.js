import sql from "../postgre.js";

export const getAllCollections = async () => {
    const collections = await sql`SELECT * FROM collections`;
    return collections;
};

export const getCollectionById = async (id) => {
    const collections = await sql`SELECT * FROM collections WHERE id = ${id}`;
    return collections[0];
};

export const createCollection = async (name, description) => {
    const collections = await sql`INSERT INTO collections (name, description) VALUES (${name}, ${description}) RETURNING *`;
    return collections[0];
};

export const updateCollection = async (id, name, description) => {
    const collections = await sql`UPDATE collections SET name = ${name}, description = ${description} WHERE id = ${id} RETURNING *`;
    return collections[0];
};

export const deleteCollection = async (id) => {
    const collections = await sql`DELETE FROM collections WHERE id = ${id} RETURNING *`;
    return collections[0];
};

export const getCollectionProducts = async (collectionId) => {
    const products = await sql`SELECT * FROM products WHERE collection_id = ${collectionId}`;
    return products;
};

