import sql from '../postgre.js';

// Get all addresses for a user
export const getAddressesByUserId = async (userId) => {
    return await sql`
        SELECT * FROM user_addresses
        WHERE user_id = ${userId}
        ORDER BY is_default DESC, created_at ASC
    `;
};

// Add a new address; if it's the first one, make it default
export const createAddress = async (userId, { type, fullName, phone, street, city, state, pincode, isDefault }) => {
    const addresses = await sql`
        INSERT INTO user_addresses (user_id, type, full_name, phone, street, city, state, pincode, is_default)
        VALUES (${userId}, ${type}, ${fullName}, ${phone}, ${street}, ${city}, ${state}, ${pincode}, ${isDefault})
        RETURNING *
    `;
    return addresses[0];
};

// Delete an address by id (only if it belongs to the user)
export const deleteAddress = async (userId, addressId) => {
    const result = await sql`
        DELETE FROM user_addresses
        WHERE id = ${addressId} AND user_id = ${userId}
        RETURNING id
    `;
    return result[0];
};

// Update an address's fields
export const updateAddress = async (userId, addressId, { type, fullName, phone, street, city, state, pincode }) => {
    const result = await sql`
        UPDATE user_addresses
        SET    type      = ${type},
               full_name = ${fullName},
               phone     = ${phone},
               street    = ${street},
               city      = ${city},
               state     = ${state},
               pincode   = ${pincode}
        WHERE  id = ${addressId} AND user_id = ${userId}
        RETURNING *
    `;
    return result[0];
};

// Set a specific address as default (unset all others first)
export const setDefaultAddress = async (userId, addressId) => {
    await sql`UPDATE user_addresses SET is_default = FALSE WHERE user_id = ${userId}`;
    const result = await sql`
        UPDATE user_addresses
        SET    is_default = TRUE
        WHERE  id = ${addressId} AND user_id = ${userId}
        RETURNING *
    `;
    return result[0];
};
