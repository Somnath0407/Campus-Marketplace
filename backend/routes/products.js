const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, uploadImage, deleteImage } = require('../utils/cloudinary');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sameCollege = (a = '', b = '') => a.trim().toLowerCase() === b.trim().toLowerCase();

// @route   GET /api/products
// @desc    Get all products filtered by user's college + optional search/category
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    const college = (req.user.college || '').trim();

    if (!college) {
      return res.status(400).json({ message: 'User college is missing' });
    }

    // Always scope to user's college
    const query = { college: { $regex: `^${escapeRegex(college)}$`, $options: 'i' } };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('sellerId', 'name email phone college')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'sellerId',
      'name email phone college'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!sameCollege(product.college, req.user.college || '')) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product listing
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, price, description, category } = req.body;

    if (!title || !price || !description || !category) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const product = await Product.create({
      title,
      price: parseFloat(price),
      description,
      category,
      image: imageUrl,
      sellerId: req.user._id,
      college: req.user.college,
    });

    await product.populate('sellerId', 'name email phone college');
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (status, title, price, description)
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('sellerId', 'name email phone college');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product listing
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete image from Supabase or local disk
    await deleteImage(product.image);

    // Remove from all users' wishlists
    await User.updateMany(
      { wishlist: product._id },
      { $pull: { wishlist: product._id } }
    );

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/:id/wishlist
// @desc    Toggle product in user's wishlist
// @access  Private
router.post('/:id/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!sameCollege(product.college, req.user.college || '')) {
      return res.status(403).json({ message: 'You can wishlist only your college listings' });
    }

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
