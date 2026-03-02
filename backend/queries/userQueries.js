import sql from '../postgre.js';

// Query to insert a new user
export const createUser = async (name, email, password) => {
    const users = await sql`
        INSERT INTO users (name, email, password) 
        VALUES (${name}, ${email}, ${password}) 
        RETURNING id, name, email, created_at
    `;
    return users[0];
};

// Query to find a user by their email
export const getUserByEmail = async (email) => {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    return users[0];
};

// Query to find a user by their ID
export const getUserById = async (id) => {
    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    return users[0];
};
