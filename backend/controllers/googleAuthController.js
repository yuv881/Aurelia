import jwt from "jsonwebtoken";
import {
    getUserByGoogleId,
    createGoogleUser,
    linkGoogleAccount,
    getUserByEmailForGoogle,
} from "../queries/googleAuthQueries.js";

// ─── Helper ──────────────────────────────────────────────────────────────────

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
        expiresIn: "30d",
    });

// ─── Google OAuth Callback ────────────────────────────────────────────────────

/**
 * Called after Google redirects back to /api/auth/google/callback.
 * Expects the decoded Google profile in req.googleUser (set by middleware).
 *
 * Google profile shape:
 *   { sub, name, email, picture }
 */
export const googleAuthCallback = async (req, res) => {
    try {
        const { sub: googleId, name, email, picture: avatar } = req.googleUser;

        // 1. Check if user already has a Google account
        let user = await getUserByGoogleId(googleId);

        if (!user) {
            // 2. Check if they registered with email/password first
            const existingUser = await getUserByEmailForGoogle(email);

            if (existingUser) {
                // Link their Google account to the existing record
                user = await linkGoogleAccount(email, googleId, avatar);
            } else {
                // 3. Brand-new user — create via Google
                user = await createGoogleUser(googleId, name, email, avatar);
            }
        }

        const token = generateToken(user.id);

        // Return token + minimal user info (frontend stores in localStorage)
        res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                authProvider: user.auth_provider,
            },
        });
    } catch (error) {
        console.error("Google auth callback error detail:", {
            message: error.message,
            stack: error.stack,
            reqBody: req.body,
            googleUser: req.googleUser
        });
        res.status(500).json({
            message: "Server error during Google authentication",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ─── Verify Google ID Token (used by frontend "Sign in with Google" button) ──

/**
 * POST /api/auth/google/verify
 * Body: { credential }  — the raw ID token from Google's JS SDK / One Tap
 */
export const verifyGoogleToken = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        // Decode the JWT issued by Google (header.payload.signature)
        // We verify the signature against Google's public keys.
        const { OAuth2Client } = await import("google-auth-library");
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error("GOOGLE_CLIENT_ID is not defined in environment variables");
            return res.status(500).json({ message: "Google OAuth is not configured on the server" });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        // payload shape: { sub, name, email, picture, email_verified, ... }

        if (!payload.email_verified) {
            return res.status(400).json({ message: "Google email not verified" });
        }

        // Reuse the same upsert logic
        req.googleUser = {
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
        };

        return await googleAuthCallback(req, res);
    } catch (error) {
        console.error("Google token verification error detail:", {
            message: error.message,
            stack: error.stack
        });
        res.status(401).json({ message: "Invalid Google token", error: error.message });
    }
};
