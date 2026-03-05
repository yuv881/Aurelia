import jwt from "jsonwebtoken";
import {
    getUserByGoogleId,
    createGoogleUser,
    linkGoogleAccount,
    getUserByEmailForGoogle,
} from "../queries/googleAuthQueries.js";


const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
        expiresIn: "30d",
    });


export const googleAuthCallback = async (req, res) => {
    try {
        const { sub: googleId, name, email, picture: avatar } = req.googleUser;

        if (!googleId || !email) {
            console.error("Missing required Google user info:", req.googleUser);
            return res.status(400).json({ message: "Invalid Google user data received" });
        }

        // Search for user by Google ID
        let user = await getUserByGoogleId(googleId);

        if (!user) {
            // Check if user exists with the same email
            const existingUser = await getUserByEmailForGoogle(email);

            if (existingUser) {
                // Link account
                user = await linkGoogleAccount(email, googleId, avatar || null);
            } else {
                // Create new user
                user = await createGoogleUser(googleId, name || "Google User", email, avatar || null);
            }
        }

        if (!user) {
            throw new Error("Failed to retrieve or create user after authentication");
        }

        const token = generateToken(user.id);

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
            error: process.env.NODE_ENV === 'development' ? error.message : error.message // Showing error message temporarily to help user debug
        });
    }
};


export const verifyGoogleToken = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

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

        if (!payload.email_verified) {
            return res.status(400).json({ message: "Google email not verified" });
        }

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
