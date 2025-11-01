const Blog = require('../models/Blog');
const User = require('../models/User');
const { cloudinary } = require('../middlewares/upload');

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private (Alumni only)
const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      tags,
      category,
      status,
      seo,
      allowComments,
      imageUrl
    } = req.body;

    // Parse tags if it's a JSON string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    // Handle image upload
    let imageData = null;
    if (req.file) {
      imageData = {
        url: req.file.path,
        public_id: req.file.filename
      };
    } else if (imageUrl) {
      imageData = {
        url: imageUrl,
        public_id: null
      };
    }

    // Normalize inputs
    const normalizedTags = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string' && tags.trim() !== ''
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : []);
    const normalizedAllowComments = typeof allowComments === 'string'
      ? allowComments === 'true' || allowComments === '1'
      : Boolean(allowComments);

    // Ensure excerpt exists to satisfy schema requirement
    const safeExcerpt = (excerpt && excerpt.trim().length > 0)
      ? excerpt
      : (content ? content.substring(0, 200) + (content.length > 200 ? '...' : '') : '');

    const publishTimestamp = status === 'published' ? new Date() : undefined;

    const blog = await Blog.create({
      title,
      content,
      excerpt: safeExcerpt,
      author: req.user.id,
      imageUrl: imageData,
<<<<<<< HEAD
      tags: normalizedTags,
=======
      tags: parsedTags,
>>>>>>> 03b7d11 (workshop page debug done)
      category,
      status,
      publishedAt: publishTimestamp,
      seo,
      allowComments: normalizedAllowComments
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'name email');

    res.status(201).json({
      message: 'Blog post created successfully',
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all published blogs with filters
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const category = req.query.category;
    const author = req.query.author;
    const featured = req.query.featured === 'true';

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { status: 'published' };
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (author) filter.author = author;
    if (featured) filter.isFeatured = true;

    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('likes.user', 'name')
      .populate('comments.user', 'name email')
      .populate('comments.replies.user', 'name email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Blog author only)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Parse tags if it's a JSON string
    if (updateData.tags && typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (error) {
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the blog author
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this blog post' });
    }

    // Normalize fields
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
    if (typeof updateData.allowComments === 'string') {
      updateData.allowComments = updateData.allowComments === 'true' || updateData.allowComments === '1';
    }

    // Set publishedAt when transitioning to published
    if (updateData.status === 'published' && !blog.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (blog.imageUrl && blog.imageUrl.public_id) {
        try {
          await cloudinary.uploader.destroy(blog.imageUrl.public_id);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Update with new image
      updateData.imageUrl = {
        url: req.file.path,
        public_id: req.file.filename
      };
    } else if (updateData.imageUrl && typeof updateData.imageUrl === 'string') {
      updateData.imageUrl = {
        url: updateData.imageUrl,
        public_id: blog.imageUrl?.public_id || null
      };
    }

    // Ensure excerpt exists if it was cleared
    if (updateData && (updateData.excerpt === '' || updateData.excerpt == null) && updateData.content) {
      updateData.excerpt = updateData.content.substring(0, 200) + (updateData.content.length > 200 ? '...' : '');
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Blog author only)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the blog author
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this blog post' });
    }

    // Delete image from Cloudinary if exists
    if (blog.imageUrl && blog.imageUrl.public_id) {
      try {
        await cloudinary.uploader.destroy(blog.imageUrl.public_id);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Blog.findByIdAndDelete(id);

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/unlike a blog post
// @route   POST /api/blogs/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const existingLike = blog.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      blog.likes.push({
        user: req.user.id
      });
    }

    await blog.save();

    const updatedBlog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('likes.user', 'name');

    res.json({
      message: existingLike ? 'Blog post unliked' : 'Blog post liked',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to blog post
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (!blog.allowComments) {
      return res.status(400).json({ message: 'Comments are disabled for this blog post' });
    }

    blog.comments.push({
      user: req.user.id,
      content
    });

    await blog.save();

    const updatedBlog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('comments.user', 'name email')
      .populate('comments.replies.user', 'name email');

    res.json({
      message: 'Comment added successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reply to a comment
// @route   POST /api/blogs/:id/comments/:commentId/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.replies.push({
      user: req.user.id,
      content
    });

    await blog.save();

    const updatedBlog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('comments.user', 'name email')
      .populate('comments.replies.user', 'name email');

    res.json({
      message: 'Reply added successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve/delete comment
// @route   PUT /api/blogs/:id/comments/:commentId
// @access  Private (Blog author or admin)
const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { isApproved, action } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the blog author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify comments' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (action === 'delete') {
      comment.remove();
    } else {
      comment.isApproved = isApproved;
    }

    await blog.save();

    const updatedBlog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('comments.user', 'name email')
      .populate('comments.replies.user', 'name email');

    res.json({
      message: action === 'delete' ? 'Comment deleted successfully' : 'Comment updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's blog posts
// @route   GET /api/blogs/my-blogs
// @access  Private (Blog author)
const getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = { author: req.user.id };
    if (status) filter.status = status;

    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json(blogs);
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
const searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const blogs = await Blog.find({
      status: 'published',
      $text: { $search: q }
    })
      .populate('author', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({
      status: 'published',
      $text: { $search: q }
    });

    res.json({
      blogs,
      query: q,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
