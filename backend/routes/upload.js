const express = require('express');
const {
  uploadImage,
  uploadVideo,
  deleteFile
} = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Protected routes (Admin/Moderator only)
router.use(protect);
router.use(restrictTo('admin', 'moderator'));

router.post('/image', upload.single('image'), uploadImage);
router.post('/video', upload.single('video'), uploadVideo);
router.delete('/file/:publicId', deleteFile);

module.exports = router;
