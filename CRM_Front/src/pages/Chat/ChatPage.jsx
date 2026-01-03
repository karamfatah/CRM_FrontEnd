import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { chatService } from '../../lib/chatService';
import { io } from 'socket.io-client';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import GroupChatModal from './GroupChatModal';
import { PaperClipIcon, PlusIcon } from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player';

const ChatPage = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isPollingActive, setIsPollingActive] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error playing notification sound:', err);
      });
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert base64 image to data URL
  const getImageSrc = (base64Image) => {
    if (base64Image && base64Image.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${base64Image}`;
    }
    return null;
  };

  // Fetch current user profile and other users
  useEffect(() => {
    if (authLoading || !authData?.access_token || !authData?.user_id) return;

    // Initialize Socket.IO
    console.log('Initializing Socket.IO with token:', authData.access_token);
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token: authData.access_token },
      query: { token: authData.access_token },
      extraHeaders: { 'x-access-tokens': authData.access_token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setError('');
      setIsPollingActive(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(t('chat.socket_error', { message: err.message }) || `Socket connection error: ${err.message}`);
      setIsPollingActive(true);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      setError(t('chat.socket_error', { message: err.message }) || `Socket error: ${err.message}`);
    });

    socket.on('message', (message) => {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg._id === message._id);
        if (!messageExists) {
          playNotificationSound();
          return [...prev, message];
        }
        return prev;
      });
    });

    socket.on('room_users', (data) => {
      console.log('Room users:', data);
    });

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user profile
        const userProfile = await chatService.getUserProfile(authData.user_id);
        console.log('Fetched current user profile:', userProfile);
        setCurrentUserProfile(userProfile);

        // Fetch other users
        const userData = await chatService.getUsers(authData.org_id);
        console.log('Fetched users:', userData.map(u => u.name));
        const normalizedUsers = userData.map(user => ({
          ...user,
          id: user._id || user.id,
        }));
        console.log('Normalized users:', normalizedUsers.map(u => ({ id: u.id, name: u.name })));
        setUsers(normalizedUsers);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || t('chat.fetch_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsPollingActive(false);
    };
  }, [authData, authLoading, t]);

  // Fetch messages and join chat room
  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join_chat', `chat:${activeChat._id}`);
      const fetchMessages = async () => {
        try {
          const messagesData = await chatService.getMessages(activeChat._id);
          console.log(`Fetched ${messagesData.length} messages for chat ${activeChat._id}`);
          setMessages(messagesData);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError(err.message || t('chat.fetch_messages_error'));
          setIsPollingActive(true);
        }
      };
      fetchMessages();
    }
  }, [activeChat, t]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for messages as a fallback
  useEffect(() => {
    if (!activeChat || !isPollingActive) return;

    const pollMessages = async () => {
      try {
        const messagesData = await chatService.getMessages(activeChat._id);
        console.log(`Polling fetched ${messagesData.length} messages for chat ${activeChat._id}`);
        setMessages(prev => {
          const newMessages = messagesData.filter(msg => !prev.some(p => p._id === msg._id));
          if (newMessages.length > 0) {
            playNotificationSound();
          }
          return [...prev, ...newMessages];
        });
      } catch (err) {
        console.error('Polling error:', err);
        setError(err.message || t('chat.fetch_messages_error'));
      }
    };

    const interval = setInterval(() => {
      if (!isPollingActive) {
        clearInterval(interval);
        return;
      }
      pollMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeChat, isPollingActive, t]);

  const startChat = async (user) => {
    try {
      console.log('Starting chat with user:', user);
      console.log('User ID:', user.id, 'Org ID:', authData.org_id);
      if (!user.id) {
        throw new Error('User ID is undefined');
      }
      const orgIdNumber = Number(authData.org_id);
      if (isNaN(orgIdNumber)) {
        throw new Error('Invalid org_id: Not a number');
      }
      const { chat_id } = await chatService.createIndividualChat(user.id, orgIdNumber);
      const newChat = { _id: chat_id, type: 'individual', name: user.name, members: [{ user_id: user.id }, { user_id: authData.user_id }] };
      console.log(`Created new chat with ${user.name}: ${chat_id}`);
      setActiveChat(newChat);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError(err.message || t('chat.start_chat_error'));
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;
    try {
      await chatService.sendMessage(activeChat._id, messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || t('chat.send_message_error'));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    try {
      await chatService.uploadMedia(activeChat._id, file);
      fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || t('chat.upload_error'));
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t('chat.title')}
              </h1>
              <button
                onClick={() => setShowGroupModal(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                <PlusIcon className="w-5 h-5 inline mr-1" />
                {t('chat.create_group')}
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                {/* Card for the current user at the top */}
                {currentUserProfile && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                    <div className="flex items-center">
                      {currentUserProfile.user_image ? (
                        <img
                          src={getImageSrc(currentUserProfile.user_image)}
                          alt={currentUserProfile.name}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                          <span className="text-gray-600 text-xl">
                            {currentUserProfile.name?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
                          {currentUserProfile.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of other users below the card */}
                <h2 className="text-lg font-semibold mb-4">{t('chat.user_list')}</h2>
                {users
                  .filter(user => user._id !== authData.user_id)
                  .map(user => (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => startChat(user)}
                    >
                      <div className="flex items-center">
                        {user.user_image ? (
                          <img src={getImageSrc(user.user_image)} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                            <span className="text-gray-600">{user.name?.[0] || '?'}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-800 dark:text-gray-100">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.is_online
                              ? t('chat.online')
                              : t('chat.last_seen', { time: new Date(user.last_active).toLocaleTimeString() })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="lg:col-span-3">
                {activeChat ? (
                  <>
                    <h2 className="text-lg font-semibold mb-4">{activeChat.name}</h2>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-96 overflow-y-auto">
                      {messages.map(msg => (
                        <div
                          key={msg._id}
                          className={`mb-4 flex ${msg.sender_id._id === authData.user_id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.sender_id._id === authData.user_id
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            {msg.media_type === 'text' && <p>{msg.content}</p>}
                            {msg.media_type === 'voice' && (
                              <audio controls src={msg.media_url} className="w-full" />
                            )}
                            {msg.media_type === 'video' && (
                              <ReactPlayer url={msg.media_url} controls width="100%" height="auto" />
                            )}
                            {msg.media_type === 'file' && (
                              <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="underline">
                                {msg.media_url.split('/').pop()}
                              </a>
                            )}
                            <p className="text-xs mt-1 opacity-75">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={t('chat.type_message')}
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg"
                      >
                        {t('chat.send')}
                      </button>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500"
                      >
                        <PaperClipIcon className="w-6 h-6" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,video/mp4,audio/mp3,application/pdf"
                        className="hidden"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">{t('chat.select_chat')}</p>
                )}
              </div>
            </div>
          </div>
        </main>
        {showGroupModal && (
          <GroupChatModal
            users={users}
            org_id={authData.org_id}
            onClose={() => setShowGroupModal(false)}
            onCreate={(newChat) => {
              setActiveChat(newChat);
              setShowGroupModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;