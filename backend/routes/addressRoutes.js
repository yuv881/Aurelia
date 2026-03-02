import express from 'express';
import { getAddresses, addAddress, removeAddress, makeDefault, editAddress } from '../controllers/addressController.js';

const router = express.Router();

router.get('/', getAddresses);             // GET    /api/addresses
router.post('/', addAddress);              // POST   /api/addresses
router.put('/:id', editAddress);           // PUT    /api/addresses/:id
router.delete('/:id', removeAddress);      // DELETE /api/addresses/:id
router.patch('/:id/default', makeDefault); // PATCH  /api/addresses/:id/default

export default router;
