import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Calendar, 
  Search, 
  Filter, 
  MessageSquare, 
  Phone, 
  User, 
  ChevronLeft, 
  ChevronRight,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  User as UserIcon,
  Shield
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';

const ChatCustomers = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    phone_number: '',
    name: '',
    start_date: '',
    end_date: '',
  });
  const [filterKey, setFilterKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!authData?.access_token) {
      setError(t('chat_customers.please_login') || 'Please log in to view chat customers');
      setLoading(false);
      return;
    }
    fetchConversations();
  }, [authData, authLoading, page, perPage, filters.status, filters.phone_number, filters.name, filters.start_date, filters.end_date, filterKey]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');

      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error(t('chat_customers.no_access_token') || 'No access token found. Please log in.');
      }

      const url = new URL(`${API_URL}/api/chat-customers/conversations`);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      
      if (filters.status) url.searchParams.append('status', filters.status);
      if (filters.phone_number) url.searchParams.append('phone_number', filters.phone_number);
      if (filters.name) url.searchParams.append('name', filters.name);
      if (filters.start_date) url.searchParams.append('start_date', filters.start_date);
      if (filters.end_date) url.searchParams.append('end_date', filters.end_date);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const { access_token } = await refreshRes.json();
            localStorage.setItem('access_token', access_token);
            // Retry with new token
            const retryResponse = await fetch(url, {
              method: 'GET',
              headers: {
                'x-access-tokens': access_token,
                'Content-Type': 'application/json',
              },
            });
            if (!retryResponse.ok) {
              throw new Error(t('chat_customers.fetch_conversations_error') || `Failed to fetch conversations: ${retryResponse.status}`);
            }
            const retryData = await retryResponse.json();
            setConversations(retryData.data || []);
            setTotalPages(retryData.pagination?.total_pages || 1);
            return;
          }
        }
        throw new Error(t('chat_customers.unauthorized') || 'Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(t('chat_customers.fetch_conversations_error') || `Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();
      setConversations(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || t('chat_customers.load_conversations_error') || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/chat-customers/conversations/${conversationId}/messages?per_page=100`,
        {
          method: 'GET',
          headers: {
            'x-access-tokens': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(t('chat_customers.fetch_messages_error') || `Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || t('chat_customers.fetch_messages_error') || 'Failed to load messages');
    }
  };

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const updateConversationStatus = async (conversationId, status) => {
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/chat-customers/conversations/${conversationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'x-access-tokens': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(t('chat_customers.update_status_error') || `Failed to update status: ${response.status}`);
      }

      // Refresh conversations
      await fetchConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({ ...selectedConversation, status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || t('chat_customers.update_status_error') || 'Failed to update conversation status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.na') || 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return t('common.na') || 'N/A';
    }
  };

  const getSenderIcon = (senderType) => {
    switch (senderType) {
      case 'bot':
        return <Bot className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getSenderColor = (senderType) => {
    switch (senderType) {
      case 'bot':
        return 'bg-blue-500';
      case 'admin':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading && !conversations.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  {t('chat_customers.title') || 'Chat Customers'}
                </h1>
                <p className="text-gray-600 dark:text-white/70 mt-1">
                  {t('chat_customers.subtitle') || 'Manage customer conversations and AI agent chat history'}
                </p>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-700 dark:text-white/70" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('chat_customers.filters') || 'Filters'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <CheckCircle className="h-4 w-4" />
                    {t('chat_customers.status') || 'Status'}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  >
                    <option value="">{t('chat_customers.all_statuses') || 'All Statuses'}</option>
                    <option value="open">{t('chat_customers.open') || 'Open'}</option>
                    <option value="closed">{t('chat_customers.closed') || 'Closed'}</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Phone className="h-4 w-4" />
                    {t('chat_customers.phone') || 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={filters.phone_number}
                    onChange={(e) => {
                      setFilters({ ...filters, phone_number: e.target.value });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                    }}
                    placeholder={t('chat_customers.phone_placeholder') || 'Search phone...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <User className="h-4 w-4" />
                    {t('chat_customers.name') || 'Name'}
                  </label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => {
                      setFilters({ ...filters, name: e.target.value });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                    }}
                    placeholder={t('chat_customers.name_placeholder') || 'Search name...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Calendar className="h-4 w-4" />
                    {t('chat_customers.start_date') || 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => {
                      setFilters({ ...filters, start_date: e.target.value });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Calendar className="h-4 w-4" />
                    {t('chat_customers.end_date') || 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => {
                      setFilters({ ...filters, end_date: e.target.value });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                    }}
                    min={filters.start_date || undefined}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({
                        status: '',
                        phone_number: '',
                        name: '',
                        start_date: '',
                        end_date: '',
                      });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all shadow-lg font-semibold"
                  >
                    {t('chat_customers.reset') || 'Reset'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-[calc(100vh-300px)] overflow-y-auto"
              >
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg'
                          : 'bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-semibold">{conversation.name || t('chat_customers.unknown') || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm opacity-80">
                            <Phone className="h-3 w-3" />
                            <span>{conversation.phone_number || t('common.na') || 'N/A'}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          conversation.status === 'open'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {conversation.status === 'open' 
                            ? (t('chat_customers.open') || 'Open')
                            : (t('chat_customers.closed') || 'Closed')}
                        </div>
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(conversation.last_message_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('common.previous') || 'Previous'}
                  </button>
                  <span className="text-gray-700 dark:text-white/70">
                    {t('common.page') || 'Page'} {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next') || 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Messages View */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-[calc(100vh-300px)] flex flex-col bg-white/80 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg"
                >
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedConversation.name || t('chat_customers.unknown') || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-white/70">
                        {selectedConversation.phone_number || t('common.na') || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateConversationStatus(
                          selectedConversation.id,
                          selectedConversation.status === 'open' ? 'closed' : 'open'
                        )}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                          selectedConversation.status === 'open'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {selectedConversation.status === 'open' 
                          ? (t('chat_customers.close') || 'Close')
                          : (t('chat_customers.reopen') || 'Reopen')}
                      </button>
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="p-2 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.message_direction === 'incoming' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl p-3 ${
                            message.message_direction === 'incoming'
                              ? 'bg-gray-100 dark:bg-white/10'
                              : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1 rounded ${getSenderColor(message.sender_type)} text-white`}>
                              {getSenderIcon(message.sender_type)}
                            </div>
                            <span className="text-xs font-semibold opacity-80">
                              {message.sender_type === 'bot' 
                                ? (t('chat_customers.sender_bot') || 'Bot')
                                : message.sender_type === 'admin'
                                ? (t('chat_customers.sender_admin') || 'Admin')
                                : message.sender_type === 'customer'
                                ? (t('chat_customers.sender_customer') || 'Customer')
                                : message.sender_type}
                            </span>
                            <span className="text-xs opacity-60">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{message.message_text || t('chat_customers.no_text') || 'No text'}</p>
                          {message.message_type !== 'text' && (
                            <span className="text-xs opacity-70 mt-1 block">
                              {t('chat_customers.type') || 'Type'}: {message.message_type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="h-[calc(100vh-300px)] flex items-center justify-center bg-white/80 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 dark:text-white/40 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-white/70 text-lg">
                      {t('chat_customers.select_conversation') || 'Select a conversation to view messages'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatCustomers;


