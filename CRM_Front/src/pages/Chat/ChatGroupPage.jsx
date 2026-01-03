import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { chatService } from '../../lib/chatService';
import { io } from 'socket.io-client';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player';

const ChatGroupPage = ({ groupId = '685ad6f60b2211528803b772', groupName = 'QA Chat' }) => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const userImageCache = useRef({});
  const messagesPerPage = 20;

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Error playing notification sound:', err));
    }
  };

  // Scroll to bottom
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

  // Initialize socket and fetch initial data
  useEffect(() => {
    if (authLoading || !authData?.access_token || !authData?.user_id) return;

    // Initialize Socket.IO with explicit token in auth object
    socketRef.current = io('http://192.168.100.23:5055', {
      transports: ['websocket', 'polling'],
      auth: { token: authData.access_token },
      query: { token: authData.access_token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setError('');
      socket.emit('join_chat', `chat:${groupId}`);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(t('chat.socket_error', { message: err.message }) || `Socket connection error: ${err.message}`);
      startPeriodicPolling();
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      setError(t('chat.socket_error', { message: err.message }) || `Socket error: ${err.message}`);
    });

    socket.on('message', async (message) => {
      try {
        const newMessage = { ...message, createdAt: new Date(message.createdAt) };
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === newMessage._id);
          const tempMessageIndex = newMessage.clientMessageId
            ? prev.findIndex(msg => msg.clientMessageId === newMessage.clientMessageId)
            : -1;
          if (messageExists) return prev;
          if (tempMessageIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[tempMessageIndex] = {
              ...newMessage,
              isTemporary: false,
              hasError: false,
              isSynced: true,
            };
            playNotificationSound();
            updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            return updatedMessages;
          }
          playNotificationSound();
          const updatedMessages = [...prev, newMessage];
          updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updatedMessages;
        });
        // Cache sender image
        if (!userImageCache.current[message.sender_id._id]) {
          const image = await chatService.fetchUserProfileImage(message.sender_id._id);
          userImageCache.current[message.sender_id._id] = image;
        }
      } catch (err) {
        console.error('Error processing socket message:', err);
      }
    });

    const initializeData = async () => {
      setLoading(true);
      try {
        // Fetch initial messages
        const response = await chatService.getMessages(groupId, { limit: messagesPerPage, page: 1 });
        // Handle non-array response
        const messagesData = Array.isArray(response) ? response : response.messages || [];
        const total = response.total || messagesData.length;
        const lastMessage = messagesData[messagesData.length - 1];
        setMessages(messagesData);
        setTotalMessages(total);
        setHasMore(messagesData.length < total);
        setLastMessageTimestamp(lastMessage ? new Date(lastMessage.createdAt) : null);
        // Cache sender images
        const senderIds = [...new Set(messagesData.map(msg => msg.sender_id._id))];
        for (const senderId of senderIds) {
          if (!userImageCache.current[senderId]) {
            const image = await chatService.fetchUserProfileImage(senderId);
            userImageCache.current[senderId] = image;
          }
        }
        setError('');
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err.message || t('chat.fetch_error', { defaultValue: 'Failed to fetch messages' }));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    socket.emit('join_chat', `chat:${groupId}`);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authData, authLoading, groupId, t]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll for loading more messages
  const handleScroll = () => {
    if (
      messagesTopRef.current?.getBoundingClientRect().top >= 0 &&
      !isLoadingMore &&
      hasMore
    ) {
      loadMoreMessages();
    }
  };

  // Periodic polling as fallback
  const startPeriodicPolling = () => {
    const interval = setInterval(async () => {
      if (socketRef.current?.connected) {
        clearInterval(interval);
        return;
      }
      await fetchNewMessages();
    }, 15000);
    return () => clearInterval(interval);
  };

  // Fetch new messages
  const fetchNewMessages = async () => {
    try {
      const params = lastMessageTimestamp
        ? { limit: messagesPerPage, before: lastMessageTimestamp.toISOString() }
        : { limit: messagesPerPage };
      const response = await chatService.getMessages(groupId, params);
      // Handle non-array response
      const newMessagesData = Array.isArray(response) ? response : response.messages || [];
      const newMessages = newMessagesData.filter(msg => !messages.some(m => m._id === msg._id));
      if (newMessages.length > 0) {
        setMessages(prev => {
          const updated = [...prev, ...newMessages];
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        });
        setTotalMessages(prev => prev + newMessages.length);
        setLastMessageTimestamp(new Date(newMessages[newMessages.length - 1].createdAt));
        // Cache sender images
        const senderIds = [...new Set(newMessages.map(msg => msg.sender_id._id))];
        for (const senderId of senderIds) {
          if (!userImageCache.current[senderId]) {
            const image = await chatService.fetchUserProfileImage(senderId);
            userImageCache.current[senderId] = image;
          }
        }
        playNotificationSound();
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching new messages:', err);
      setError(err.message || t('chat.fetch_messages_error', { defaultValue: 'Failed to fetch new messages' }));
    }
  };

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await chatService.getMessages(groupId, { limit: messagesPerPage, page: nextPage });
      // Handle non-array response
      const newMessagesData = Array.isArray(response) ? response : response.messages || [];
      const newMessages = newMessagesData.filter(msg => !messages.some(m => m._id === msg._id));
      setMessages(prev => {
        const updated = [...newMessages, ...prev];
        updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return updated;
      });
      setCurrentPage(nextPage);
      setTotalMessages(response.total || newMessagesData.length + messages.length);
      setHasMore(newMessagesData.length >= messagesPerPage);
      // Cache sender images
      const senderIds = [...new Set(newMessages.map(msg => msg.sender_id._id))];
      for (const senderId of senderIds) {
        if (!userImageCache.current[senderId]) {
          const image = await chatService.fetchUserProfileImage(senderId);
          userImageCache.current[senderId] = image;
        }
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      setError(err.message || t('chat.fetch_messages_error', { defaultValue: 'Failed to load more messages' }));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    const clientMessageId = Date.now().toString();
    const tempMessage = {
      _id: clientMessageId,
      chat_id: groupId,
      sender_id: { _id: authData.user_id, name: authData.name || 'User' },
      content: messageInput,
      media_type: 'text',
      createdAt: new Date(),
      isTemporary: true,
      hasError: false,
      isSynced: false,
      clientMessageId,
    };
    setMessages(prev => {
      const updated = [...prev, tempMessage];
      updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return updated;
    });
    setMessageInput('');
    scrollToBottom();
    try {
      const sentMessage = await chatService.sendMessage(groupId, messageInput, clientMessageId);
      setMessages(prev => {
        const index = prev.findIndex(m => m._id === tempMessage._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...sentMessage, isTemporary: false, hasError: false, isSynced: true };
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => {
        const index = prev.findIndex(m => m._id === tempMessage._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...tempMessage, hasError: true };
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        }
        return prev;
      });
      setError(err.message || t('chat.send_message_error', { defaultValue: 'Failed to send message' }));
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const clientMessageId = Date.now().toString();
    const mediaType = file.type.startsWith('audio') ? 'voice' : file.type.startsWith('video') ? 'video' : 'file';
    const tempMessage = {
      _id: clientMessageId,
      chat_id: groupId,
      sender_id: { _id: authData.user_id, name: authData.name || 'User' },
      content: null,
      media_type: mediaType,
      media_url: URL.createObjectURL(file),
      createdAt: new Date(),
      isTemporary: true,
      hasError: false,
      isSynced: false,
      clientMessageId,
    };
    setMessages(prev => {
      const updated = [...prev, tempMessage];
      updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return updated;
    });
    scrollToBottom();
    try {
      const sentMessage = await chatService.uploadMedia(groupId, file);
      setMessages(prev => {
        const index = prev.findIndex(m => m._id === tempMessage._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...sentMessage, isTemporary: false, hasError: false, isSynced: true };
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        }
        return prev;
      });
      fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error uploading file:', err);
      setMessages(prev => {
        const index = prev.findIndex(m => m._id === tempMessage._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...tempMessage, hasError: true };
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        }
        return prev;
      });
      setError(err.message || t('chat.upload_error', { defaultValue: 'Failed to upload file' }));
    }
  };

  // Sync unsynced messages (simplified, assuming local storage or IndexedDB)
  const syncUnsyncedMessages = async () => {
    setIsSyncing(true);
    try {
      console.log('Syncing unsynced messages...');
      // Implement local storage or IndexedDB syncing if needed
    } catch (err) {
      console.error('Error syncing messages:', err);
      setError(err.message || t('chat.sync_error', { defaultValue: 'Failed to sync messages' }));
    } finally {
      setIsSyncing(false);
    }
  };

  // Error boundary fallback
  if (authLoading || loading) return <LoadingSpinner />;
  if (error && !messages.length) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error', { defaultValue: 'Dismiss error' })}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {groupName} ({totalMessages} {t('chat.messages', { defaultValue: 'messages' })})
              </h1>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error', { defaultValue: 'Dismiss error' })}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {isSyncing && (
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                {t('chat.syncing_messages', { defaultValue: 'Syncing messages...' })}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-96 overflow-y-auto" onScroll={handleScroll}>
              {hasMore && (
                <div ref={messagesTopRef} className="text-center">
                  {isLoadingMore ? (
                    <LoadingSpinner />
                  ) : (
                    <button
                      onClick={loadMoreMessages}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
                    >
                      {t('chat.load_more', { defaultValue: 'Load more' })}
                    </button>
                  )}
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`mb-4 flex ${msg.sender_id._id === authData.user_id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start max-w-xs">
                    {msg.sender_id._id !== authData.user_id && (
                      <div className="mr-2">
                        {userImageCache.current[msg.sender_id._id] ? (
                          <img
                            src={getImageSrc(userImageCache.current[msg.sender_id._id])}
                            alt={msg.sender_id.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600">{msg.sender_id.name?.[0] || '?'}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender_id._id === authData.user_id
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                      } ${msg.isTemporary ? 'opacity-50' : ''}`}
                    >
                      {msg.isTemporary && (
                        <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin mb-2"></div>
                      )}
                      {msg.hasError && (
                        <div className="text-red-500 mb-2">
                          <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
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
                    {msg.sender_id._id === authData.user_id && (
                      <div className="ml-2">
                        {userImageCache.current[msg.sender_id._id] ? (
                          <img
                            src={getImageSrc(userImageCache.current[msg.sender_id._id])}
                            alt={msg.sender_id.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600">{msg.sender_id.name?.[0] || '?'}</span>
                          </div>
                        )}
                      </div>
                    )}
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
                placeholder={t('chat.type_message', { defaultValue: 'Type a message...' })}
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg"
              >
                {t('chat.send', { defaultValue: 'Send' })}
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
          </div>
        </main>
      </div>
    </div>
  );
};

// Error boundary component
class ChatGroupPageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen overflow-hidden">
          <Sidebar sidebarOpen={false} setSidebarOpen={() => {}} />
          <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Header sidebarOpen={false} setSidebarOpen={() => {}} />
            <main>
              <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span>Something went wrong: {this.state.error?.message || 'Unknown error'}</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ChatGroupPageWithErrorBoundary(props) {
  return (
    <ChatGroupPageErrorBoundary>
      <ChatGroupPage {...props} />
    </ChatGroupPageErrorBoundary>
  );
}