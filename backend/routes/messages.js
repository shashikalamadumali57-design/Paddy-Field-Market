const express = require('express');
const { protect } = require('../middleware/auth');
const store = require('../data/store');
const crypto = require('crypto');

const router = express.Router();

const getPopulatedMessage = (msg) => {
  const sender = store.users.find(u => u._id === msg.sender) || {};
  const receiver = store.users.find(u => u._id === msg.receiver) || {};
  return { 
    ...msg, 
    sender: { _id: sender._id, name: sender.name, avatar: sender.avatar },
    receiver: { _id: receiver._id, name: receiver.name, avatar: receiver.avatar }
  };
};

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, (req, res) => {
  try {
    const { receiver, content, field } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const newMessage = {
      _id: crypto.randomBytes(12).toString('hex'),
      sender: req.user._id,
      receiver,
      content,
      field: field || null,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.messages.push(newMessage);
    res.status(201).json(getPopulatedMessage(newMessage));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the logged in user
// @access  Private
router.get('/conversations', protect, (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is sender or receiver
    const userMessages = store.messages.filter(m => m.sender === userId || m.receiver === userId);

    // Group by other user
    const conversationsMap = {};

    userMessages.forEach(msg => {
      const otherUserId = msg.sender === userId ? msg.receiver : msg.sender;
      
      if (!conversationsMap[otherUserId]) {
        const otherUser = store.users.find(u => u._id === otherUserId) || { _id: otherUserId, name: 'Unknown' };
        conversationsMap[otherUserId] = {
          user: { _id: otherUser._id, name: otherUser.name, avatar: otherUser.avatar },
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0
        };
      } else {
        // Update last message if newer
        if (new Date(msg.createdAt) > new Date(conversationsMap[otherUserId].lastMessageAt)) {
          conversationsMap[otherUserId].lastMessage = msg.content;
          conversationsMap[otherUserId].lastMessageAt = msg.createdAt;
        }
      }

      // Count unread (only if received by current user)
      if (msg.receiver === userId && !msg.read) {
        conversationsMap[otherUserId].unreadCount += 1;
      }
    });

    const conversations = Object.values(conversationsMap).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:userId
// @desc    Get chat history with a specific user
// @access  Private
router.get('/:userId', protect, (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const chatHistory = store.messages.filter(m => 
      (m.sender === currentUserId && m.receiver === otherUserId) ||
      (m.sender === otherUserId && m.receiver === currentUserId)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Mark as read
    let readCount = 0;
    chatHistory.forEach(msg => {
      if (msg.receiver === currentUserId && !msg.read) {
        msg.read = true;
        readCount++;
      }
    });

    res.json(chatHistory.map(getPopulatedMessage));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', protect, (req, res) => {
  try {
    const { content } = req.body;
    const msgIndex = store.messages.findIndex(m => m._id === req.params.id);
    
    if (msgIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (store.messages[msgIndex].sender !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    store.messages[msgIndex].content = content;
    store.messages[msgIndex].isEdited = true;
    store.messages[msgIndex].updatedAt = new Date();

    res.json(getPopulatedMessage(store.messages[msgIndex]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:id', protect, (req, res) => {
  try {
    const msgIndex = store.messages.findIndex(m => m._id === req.params.id);
    
    if (msgIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (store.messages[msgIndex].sender !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    store.messages[msgIndex].content = "🚫 This message was deleted";
    store.messages[msgIndex].isDeleted = true;
    store.messages[msgIndex].updatedAt = new Date();

    res.json(getPopulatedMessage(store.messages[msgIndex]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
