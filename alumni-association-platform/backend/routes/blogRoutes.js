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
const { validateObjectIdParams } = require('../middlewares/validation');

// Public routes
router.get('/', getAllBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/search', searchBlogs);
<<<<<<< HEAD
=======
router.get('/:id', validateObjectIdParams('id'), getBlogById);
>>>>>>> 03b7d11 (workshop page debug done)

// Protected routes
router.use(protect);

// Blog management (Alumni only)
router.post('/', alumniAndAdmin, uploadSingle, createBlog);
router.put('/:id', validateObjectIdParams('id'), alumniAndAdmin, uploadSingle, updateBlog);
router.delete('/:id', validateObjectIdParams('id'), alumniAndAdmin, deleteBlog);
router.get('/my-blogs', alumniAndAdmin, getMyBlogs);

// Blog interactions (All authenticated users)
router.post('/:id/like', validateObjectIdParams('id'), toggleLike);
router.post('/:id/comments', validateObjectIdParams('id'), addComment);
router.post('/:id/comments/:commentId/replies', validateObjectIdParams('id', 'commentId'), addReply);
router.put('/:id/comments/:commentId', validateObjectIdParams('id', 'commentId'), updateComment);

// Public route with param should be last to avoid shadowing specific paths
router.get('/:id', getBlogById);

module.exports = router;
