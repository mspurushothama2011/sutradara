import { Router } from 'express';
import { upload, handleSingleUpload, handleMultipleUpload } from '../../controllers/admin/upload.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// Single image upload (accepts field name 'image' or 'file')
router.post('/single', requireAuth, upload.single('image'), handleSingleUpload);

// Multiple image upload (accepts field name 'images' or 'files', max 10 images)
router.post('/multiple', requireAuth, upload.array('images', 10), handleMultipleUpload);

export default router;
