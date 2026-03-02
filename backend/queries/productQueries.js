import sql from "../postgre.js";

export const getAllProducts = async () => {
    return await sql`
        SELECT *
        FROM products
    `;
};

export const getProductById = async (id) => {
    const result = await sql`
        SELECT * FROM products WHERE id = ${id}
    `;

    if (!result.length) throw new Error("Product not found");

    return result[0];
};

export const getProductsByCategory = async (category) => {
    return await sql`
        SELECT *
        FROM products
        WHERE category ILIKE ${category}
    `;
};

export const createProduct = async (product) => {
    const result = await sql`
        INSERT INTO products
        (name, category, price, stock, rating, brand, image, description)
        VALUES (
            ${product.name},
            ${product.category},
            ${product.price},
            ${product.stock},
            ${product.rating},
            ${product.brand},
            ${product.image},
            ${product.description}
        )
        RETURNING *
    `;

    return result[0];
};