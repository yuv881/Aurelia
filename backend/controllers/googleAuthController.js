import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { upsertGoogleUser } from "../queries/googleAuthQueries.js";

// Initialize client once at module level for reuse and caching of Google certs
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
        expiresIn: "30d",
    });

export const googleAuthCallback = async (req, res) => {
    try {
        const { sub: googleId, name, email, picture: avatar } = req.googleUser;

        if (!googleId || !email) {
            return res.status(400).json({ message: "Invalid Google user data received" });
        }

        // Optimized: Single database round trip for find/create/link
        const user = await upsertGoogleUser(googleId, name, email, avatar);

        if (!user) {
            throw new Error("Failed to process user after authentication");
        }

        const token = generateToken(user.id);
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            authProvider: user.auth_provider,
        };

        res.status(200).json({
            message: "Google login successful",
            token,
            user: userData,
        });
    } catch (error) {
        console.error("Google auth callback error:", error);
        res.status(500).json({
            message: "Server error during Google authentication",
            error: error.message
        });
    }
};

export const verifyGoogleToken = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: "Google OAuth is not configured on the server" });
        }

        // Efficiently verify token - certs are cached by the library
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
        console.error("Google token verification error:", error.message);
        res.status(401).json({ message: "Invalid Google token", error: error.message });
    }
};
