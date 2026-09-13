import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `sutra-${cleanBase || 'image'}-${uniqueSuffix}${ext || '.jpg'}`);
  },
});

// Image file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF, SVG, AVIF) are permitted.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB maximum per image
  },
});

/**
 * Single Image Upload Handler
 * POST /api/v1/admin/uploads/single
 */
export async function handleSingleUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided for upload.' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      url: relativeUrl,
      fullUrl,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: relativeUrl,
      },
    });
  } catch (error: any) {
    console.error('Error handling single file upload:', error);
    return res.status(500).json({ error: 'Failed to process image upload.' });
  }
}

/**
 * Multiple Images Upload Handler
 * POST /api/v1/admin/uploads/multiple
 */
export async function handleMultipleUpload(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image files provided for upload.' });
    }

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';

    const uploadedFiles = files.map((file) => {
      const relativeUrl = `/uploads/${file.filename}`;
      const fullUrl = `${protocol}://${host}${relativeUrl}`;
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: relativeUrl,
        fullUrl,
      };
    });

    const urls = uploadedFiles.map((f) => f.url);

    return res.status(200).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully.`,
      urls,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error('Error handling multiple files upload:', error);
    return res.status(500).json({ error: 'Failed to process multiple images upload.' });
  }
}
