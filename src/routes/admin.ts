import express from 'express';
import {
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAllArtworks,
  deleteArtwork
} from '../controllers/adminController';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User management routes
router.get('/users', authorize('super_admin'), getAllUsers);
router.delete('/users/:id', authorize('super_admin'), deleteUser);
router.put('/users/:id/toggle-status', authorize('super_admin'), toggleUserStatus);

// Artwork management routes
router.get('/artworks', getAllArtworks);
router.delete('/artworks/:id', deleteArtwork);

export default router;
