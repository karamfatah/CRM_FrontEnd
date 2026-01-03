import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bot, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';
import './ChatWithAICustomer.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';

const ChatWithAICustomer = () => {
  const [searchParams] = useSearchParams();
  const [webhookUrl, setWebhookUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const orgId = searchParams.get('org_id');

  useEffect(() => {
    const fetchWebhookUrl = async () => {
      if (!orgId) {
        setError('Organization ID is required. Please provide org_id as a URL parameter.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/orgs/${orgId}/chat-webhook`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Organization not found');
          }
          throw new Error(`Failed to fetch webhook URL: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.chat_webhook_url) {
          throw new Error('Chat webhook URL is not configured for this organization');
        }

        setWebhookUrl(data.chat_webhook_url);
      } catch (err) {
        console.error('Error fetching webhook URL:', err);
        setError(err.message || 'Failed to load chat. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    fetchWebhookUrl();
  }, [orgId]);

  // Handle fullscreen toggle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-white/70">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12] p-4">
        <div className="text-center p-6 sm:p-8 bg-white/90 dark:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl max-w-md w-full">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Load Chat
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/70 mb-4">{error}</p>
          {!orgId && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-white/50">
              Please access this page with: /chat_withai_customer?org_id=2
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      {/* Modern Header - Responsive */}
      <div className="chat-header h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-white/5 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
            AI Customer Support
          </h1>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-white/70" />
          ) : (
            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-white/70" />
          )}
        </button>
      </div>

      {/* Chat Container - Fully Responsive */}
      <div className="chat-container w-full" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {webhookUrl && (
          <iframe
            ref={iframeRef}
            src={webhookUrl}
            title="AI Customer Chat"
            allow="microphone; camera; geolocation"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            loading="eager"
            allowFullScreen
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              minHeight: '100%',
              border: 'none',
              margin: 0,
              padding: 0,
              overflow: 'visible'
            }}
            onLoad={() => {
              console.log('Iframe loaded successfully');
              // Try to focus the iframe to ensure it's interactive
              if (iframeRef.current) {
                try {
                  iframeRef.current.contentWindow?.focus();
                } catch (e) {
                  console.log('Cannot access iframe content (cross-origin)');
                }
              }
            }}
          />
        )}
      </div>

    </div>
  );
};

export default ChatWithAICustomer;

