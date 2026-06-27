import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiArrowLeft, FiMessageSquare, FiX, FiMoreVertical } from 'react-icons/fi';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const scrollRef = useRef();

  // Initialize Socket
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user_online', user._id);
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.close();
  }, [user._id]);

  // Handle incoming messages & typing
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (currentChat && currentChat.user._id === message.sender) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations(); // Update sidebar
      });

      socket.on('user_typing', (data) => {
        if (currentChat && currentChat.user._id === data.sender) setIsTyping(true);
      });

      socket.on('user_stop_typing', (data) => {
        if (currentChat && currentChat.user._id === data.sender) setIsTyping(false);
      });

      socket.on('message_edited', (editedMsg) => {
        if (currentChat && currentChat.user._id === editedMsg.sender._id) {
          setMessages(prev => prev.map(m => m._id === editedMsg._id ? editedMsg : m));
        }
        fetchConversations();
      });

      socket.on('message_deleted', (deletedMsg) => {
        if (currentChat && currentChat.user._id === deletedMsg.sender._id) {
          setMessages(prev => prev.map(m => m._id === deletedMsg._id ? deletedMsg : m));
        }
        fetchConversations();
      });
    }
    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('message_edited');
        socket.off('message_deleted');
      }
    };
  }, [socket, currentChat]);

  // Fetch Conversations
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line
  }, [location.state]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      let fetchedConvos = res.data;

      if (location.state?.receiverId) {
        const existing = fetchedConvos.find(c => c.user._id === location.state.receiverId);
        if (!existing) {
          const newConvo = {
            user: { _id: location.state.receiverId, name: location.state.receiverName || 'Farmer' },
            lastMessage: 'Start a conversation...',
            unreadCount: 0
          };
          fetchedConvos = [newConvo, ...fetchedConvos];
        }
        const active = fetchedConvos.find(c => c.user._id === location.state.receiverId);
        if (active && !currentChat) setCurrentChat(active);
      }

      setConversations(fetchedConvos);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Messages for current chat
  useEffect(() => {
    const getMessages = async () => {
      if (currentChat) {
        try {
          const res = await api.get(`/messages/${currentChat.user._id}`);
          setMessages(res.data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    getMessages();
  }, [currentChat]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initiateEdit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
    setActiveContextMenu(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDelete = async (msgId) => {
    try {
      const res = await api.delete(`/messages/${msgId}`);
      socket.emit('delete_message', res.data);
      setMessages(messages.map(m => m._id === msgId ? res.data : m));
      setActiveContextMenu(null);
      fetchConversations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    if (editingMessage) {
      try {
        const res = await api.put(`/messages/${editingMessage._id}`, { content: newMessage });
        socket.emit('edit_message', res.data);
        setMessages(messages.map(m => m._id === editingMessage._id ? res.data : m));
        setEditingMessage(null);
        setNewMessage('');
        fetchConversations();
      } catch (error) {
        console.error(error);
      }
      return;
    }

    try {
      const res = await api.post('/messages', {
        receiver: currentChat.user._id,
        content: newMessage,
        field: location.state?.fieldId || null
      });

      socket.emit('send_message', res.data);
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && currentChat) {
      socket.emit('typing', { sender: user._id, receiver: currentChat.user._id });
      setTimeout(() => {
        socket.emit('stop_typing', { sender: user._id, receiver: currentChat.user._id });
      }, 2000);
    }
  };

  return (
    <div className="chat-page">
      <div className="container">
        <div className="chat-container">
          {/* Sidebar */}
          <div className={`chat-sidebar ${currentChat ? 'hidden-mobile' : ''}`}>
            <div className="sidebar-header">
              <h2>Messages</h2>
            </div>
            <div className="conversation-list">
              {conversations.length === 0 ? (
                <div className="no-convos">No conversations yet</div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.user._id}
                    className={`conv-item ${currentChat?.user._id === c.user._id ? 'active' : ''}`}
                    onClick={() => setCurrentChat(c)}
                  >
                    <div className="conv-avatar">
                      {c.user.name.charAt(0).toUpperCase()}
                      {onlineUsers.includes(c.user._id) && <div className="online-dot"></div>}
                    </div>
                    <div className="conv-info">
                      <h4>{c.user.name}</h4>
                      <p>{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && <span className="unread-badge">{c.unreadCount}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`chat-area ${!currentChat ? 'hidden-mobile' : ''}`}>
            {currentChat ? (
              <>
                <div className="chat-header">
                  <button className="back-btn-mobile" onClick={() => setCurrentChat(null)}>
                    <FiArrowLeft />
                  </button>
                  <div className="chat-header-info">
                    <div className="conv-avatar">
                      {currentChat.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{currentChat.user.name}</h3>
                      <span className="status-text">
                        {onlineUsers.includes(currentChat.user._id) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.map((msg, idx) => {
                    const isOwn = msg.sender._id === user._id;
                    return (
                      <div key={idx} className={`message-wrapper ${isOwn ? 'own' : ''}`} ref={idx === messages.length - 1 ? scrollRef : null}>
                        <div className="message-content">
                          {msg.isDeleted ? (
                            <p className="deleted-message"><i>{msg.content}</i></p>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <div className="msg-meta">
                            <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {msg.isEdited && !msg.isDeleted && <span className="msg-edited">(edited)</span>}
                          </div>
                        </div>
                        {isOwn && !msg.isDeleted && (
                          <div className="message-options">
                            <button className="options-btn" onClick={() => setActiveContextMenu(activeContextMenu === msg._id ? null : msg._id)}>
                              <FiMoreVertical />
                            </button>
                            {activeContextMenu === msg._id && (
                              <div className="options-menu">
                                <button onClick={() => initiateEdit(msg)}>Edit</button>
                                <button onClick={() => handleDelete(msg._id)} className="delete-opt">Delete</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="message-wrapper">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef}></div>
                </div>

                <form className={`chat-input-area ${editingMessage ? 'is-editing' : ''}`} onSubmit={handleSend}>
                  {editingMessage && (
                    <div className="editing-banner">
                      <span>Editing message...</span>
                      <button type="button" onClick={cancelEdit}><FiX /></button>
                    </div>
                  )}
                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleTyping}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                      <FiSend />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <FiMessageSquare className="chat-ph-icon" />
                <h3>Your Messages</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
