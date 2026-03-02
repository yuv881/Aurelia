import jwt from 'jsonwebtoken';
import {
    getAddressesByUserId,
    createAddress,
    deleteAddress,
    setDefaultAddress,
    updateAddress,
} from '../queries/addressQueries.js';
import { getUserById } from '../queries/userQueries.js';

// ── JWT helper ────────────────────────────────────────────────
const extractUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized — no token provided' });
        return null;
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const user = await getUserById(decoded.id);
        if (!user) {
            res.status(401).json({ message: 'Unauthorized — user not found' });
            return null;
        }
        return user;
    } catch {
        res.status(401).json({ message: 'Unauthorized — invalid token' });
        return null;
    }
};

// ── GET /api/addresses ────────────────────────────────────────
export const getAddresses = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;

    try {
        const addresses = await getAddressesByUserId(user.id);
        res.status(200).json(addresses);
    } catch (error) {
        console.error('getAddresses error:', error);
        res.status(500).json({ message: 'Server error fetching addresses' });
    }
};

// ── POST /api/addresses ───────────────────────────────────────
export const addAddress = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;

    const { type, fullName, phone, street, city, state, pincode } = req.body;

    if (!type || !fullName || !phone || !street || !city || !state || !pincode) {
        return res.status(400).json({ message: 'All address fields are required' });
    }

    try {
        // Check if this is the first address → make it default
        const existing = await getAddressesByUserId(user.id);
        const isDefault = existing.length === 0;

        const newAddress = await createAddress(user.id, {
            type, fullName, phone, street, city, state, pincode, isDefault
        });
        res.status(201).json(newAddress);
    } catch (error) {
        console.error('addAddress error:', error);
        res.status(500).json({ message: error?.message || 'Server error saving address' });
    }
};

// ── DELETE /api/addresses/:id ─────────────────────────────────
export const removeAddress = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;

    try {
        const deleted = await deleteAddress(user.id, req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted', id: deleted.id });
    } catch (error) {
        console.error('removeAddress error:', error);
        res.status(500).json({ message: 'Server error deleting address' });
    }
};

// ── PATCH /api/addresses/:id/default ─────────────────────────
export const makeDefault = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;

    try {
        const updated = await setDefaultAddress(user.id, req.params.id);
        if (!updated) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(updated);
    } catch (error) {
        console.error('makeDefault error:', error);
        res.status(500).json({ message: 'Server error updating default address' });
    }
};

// ── PUT /api/addresses/:id ────────────────────────────────────
export const editAddress = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;

    const { type, fullName, phone, street, city, state, pincode } = req.body;
    if (!type || !fullName || !phone || !street || !city || !state || !pincode) {
        return res.status(400).json({ message: 'All address fields are required' });
    }

    try {
        const updated = await updateAddress(user.id, req.params.id, {
            type, fullName, phone, street, city, state, pincode
        });
        if (!updated) return res.status(404).json({ message: 'Address not found' });
        res.status(200).json(updated);
    } catch (error) {
        console.error('editAddress error:', error);
        res.status(500).json({ message: error?.message || 'Server error updating address' });
    }
};
