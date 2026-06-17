const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sameCollege = (a = '', b = '') => a.trim().toLowerCase() === b.trim().toLowerCase();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const rawConversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email college')
      .populate('productId', 'title price image')
      .sort({ lastMessageTime: -1 });

    const conversations = rawConversations.filter((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) => String(participant._id) !== String(req.user._id)
      );

      if (!otherParticipant) return false;
      return sameCollege(otherParticipant.college, req.user.college || '');
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/conversations/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate('participants', 'college');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (participant) => String(participant._id) === String(req.user._id)
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    const otherParticipant = conversation.participants.find(
      (participant) => String(participant._id) !== String(req.user._id)
    );

    if (!otherParticipant || !sameCollege(otherParticipant.college, req.user.college || '')) {
      return res.status(403).json({ message: 'Cross-college conversations are not allowed' });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        receiverId: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages/send
// @desc    Send a message
// @access  Private
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, text, productId } = req.body;

    if (!receiverId || !text.trim()) {
      return res.status(400).json({ message: 'Receiver and message text are required' });
    }

    if (String(receiverId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (!sameCollege(receiver.college, req.user.college || '')) {
      return res.status(403).json({ message: 'You can only message users from your college' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
        productId: productId || null,
      });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      receiverId: receiverId,
      text,
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: text,
      lastMessageTime: new Date(),
    });

    const populatedMessage = await message.populate('senderId', 'name email');

    res.status(201).json({
      conversation: conversation._id,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (only sender can delete)
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (String(message.senderId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get count of unread messages
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
