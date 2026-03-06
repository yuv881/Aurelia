import sql from '../postgre.js';

/**
 * Find a user by their Google ID (for returning OAuth users)
 */
export const getUserByGoogleId = async (googleId) => {
    const users = await sql`
        SELECT * FROM users WHERE google_id = ${googleId}
    `;
    return users[0];
};

/**
 * Create a new user via Google OAuth (no password required)
 */
export const createGoogleUser = async (googleId, name, email, avatar) => {
    const users = await sql`
        INSERT INTO users (google_id, name, email, avatar, auth_provider)
        VALUES (${googleId}, ${name}, ${email}, ${avatar}, 'google')
        RETURNING id, google_id, name, email, avatar, auth_provider, created_at
    `;
    return users[0];
};

/**
 * Link Google account to an existing email/password user
 */
export const linkGoogleAccount = async (email, googleId, avatar) => {
    const users = await sql`
        UPDATE users
        SET google_id     = ${googleId},
            avatar        = COALESCE(avatar, ${avatar}),
            auth_provider = 'google'
        WHERE email = ${email}
        RETURNING id, google_id, name, email, avatar, auth_provider, created_at
    `;
    return users[0];
};

/**
 * Optimized: Find, link, or create a Google user in a single database round trip
 */
export const upsertGoogleUser = async (googleId, name, email, avatar) => {
    const users = await sql`
        WITH existing_user AS (
            SELECT id, email, google_id FROM users 
            WHERE google_id = ${googleId} OR email = ${email}
            LIMIT 1
        )
        INSERT INTO users (google_id, name, email, avatar, auth_provider)
        VALUES (${googleId}, ${name}, ${email}, ${avatar}, 'google')
        ON CONFLICT (email) DO UPDATE 
        SET google_id = EXCLUDED.google_id,
            avatar = COALESCE(users.avatar, EXCLUDED.avatar),
            auth_provider = 'google'
        RETURNING id, name, email, avatar, auth_provider, created_at
    `;
    return users[0];
};

/**
 * Find a user by email (used to check for existing accounts before linking)
 */
export const getUserByEmailForGoogle = async (email) => {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    return users[0];
};
