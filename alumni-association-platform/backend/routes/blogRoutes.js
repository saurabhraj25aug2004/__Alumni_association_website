const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  addReply,
  updateComment,
  getMyBlogs,
  getFeaturedBlogs,
  searchBlogs
} = require('../controllers/blogController');
const { protect, alumniAndAdmin } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

// Public routes
router.get('/', getAllBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/search', searchBlogs);
router.get('/:id', getBlogById);

// Protected routes
router.use(protect);

// Blog management (Alumni only)
router.post('/', alumniAndAdmin, uploadSingle, createBlog);
router.put('/:id', alumniAndAdmin, uploadSingle, updateBlog);
router.delete('/:id', alumniAndAdmin, deleteBlog);
router.get('/my-blogs', alumniAndAdmin, getMyBlogs);

// Blog interactions (All authenticated users)
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.post('/:id/comments/:commentId/replies', addReply);
router.put('/:id/comments/:commentId', updateComment);

module.exports = router;
