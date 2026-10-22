import express from 'express';
import { 
  getUserMenus, 
  uploadAndExtract, 
  getMenuById, 
  updateMenu,
  publishMenu,
  getQrCode,
  deleteMenu
} from '../controllers/menuController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Get all menus for the dashboard
router.get('/', authenticateToken, getUserMenus);

// Upload and trigger Gemini AI (Supports single or multiple images)
router.post('/upload', authenticateToken, upload.any(), uploadAndExtract);

// Fetch a single menu for the Verification Dashboard
router.get('/:id', authenticateToken, getMenuById);

// Save manager edits to dishes and allergens
router.put('/:id', authenticateToken, updateMenu);

// publish route
router.patch('/:id/publish', authenticateToken, publishMenu);

// QR code route
router.get('/:id/qr', authenticateToken, getQrCode);

// delete route
router.delete('/:id', authenticateToken, deleteMenu);
export default router;