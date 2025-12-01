const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// OneDrive kilit sorunlarını azaltmak için dış dizin kullan
const uploadsDir = process.env.UPLOAD_DIR || path.join('C:\\', 'snapmeal_uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { console.error('Upload dir create error:', e); }
}

// Bellek tabanlı multer
const storage = multer.memoryStorage();

// Uzantı + MIME filtreleme
const fileFilter = (req, file, cb) => {
  const allowedExt = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!allowedExt.includes(ext)) {
    return cb(new Error('Geçersiz dosya türü. İzin verilen: ' + allowedExt.join(', ')));
  }
  const allowedMime = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'];
  if (file.mimetype && !allowedMime.includes(file.mimetype)) {
    return cb(new Error('Desteklenmeyen MIME türü: ' + file.mimetype));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya gerekli' });

    const maxSide = 1200;
    const thumbSize = 400;
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
    const base = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = base + ext;
    const filePath = path.join(uploadsDir, fileName);
    const thumbName = 'thumb-' + base + ext;
    const thumbPath = path.join(uploadsDir, thumbName);

    let meta = await sharp(req.file.buffer).metadata();
    let { width, height } = meta;
    let resized = false;

    let imagePipeline = sharp(req.file.buffer, { failOnError: false });
    if (width && height && (width > maxSide || height > maxSide)) {
      if (width >= height) {
        imagePipeline = imagePipeline.resize({ width: maxSide });
      } else {
        imagePipeline = imagePipeline.resize({ height: maxSide });
      }
      resized = true;
    }
    await imagePipeline.toFile(filePath);

    if (resized) {
      const newMeta = await sharp(filePath).metadata();
      width = newMeta.width;
      height = newMeta.height;
    }

    // Thumbnail: kare içine orantılı sığdır (zoom yok), arka plan beyaz dolgu
    await sharp(req.file.buffer)
      .resize(thumbSize, thumbSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(thumbPath);

    return res.status(201).json({
      path: '/uploads/' + fileName,
      thumb_path: '/uploads/' + thumbName,
      original_width: width,
      original_height: height,
      resized,
      thumb_size: thumbSize
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Yükleme hatası', error: error.message });
  }
});

module.exports = router;
