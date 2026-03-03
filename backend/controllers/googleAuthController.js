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

        
        let user = await getUserByGoogleId(googleId);

        if (!user) {
            
            const existingUser = await getUserByEmailForGoogle(email);

            if (existingUser) {
         
                user = await linkGoogleAccount(email, googleId, avatar);
            } else {
         
                user = await createGoogleUser(googleId, name, email, avatar);
            }
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
        console.error("Google auth error:", error);
        res.status(500).json({ message: "Server error during Google authentication" });
    }
};


export const verifyGoogleToken = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        const { OAuth2Client } = await import("google-auth-library");
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

        return googleAuthCallback(req, res);
    } catch (error) {
        console.error("Google token verification error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};
