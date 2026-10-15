import express from 'express';
import { getPublicMenu, recordScan } from '../controllers/dinerController.js';

const router = express.Router();

// Public routes for the diners
router.get('/:slug', getPublicMenu);
router.post('/:slug/scan', recordScan);

export default router;