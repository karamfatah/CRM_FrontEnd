import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const StreamingChat = ({ webhookUrl }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsStreaming(true);
    setCurrentStreamingMessage('');

    try {
      // Try streaming first (Server-Sent Events or fetch streaming)
      await streamResponse(userMessage);
    } catch (error) {
      console.error('Streaming error, falling back to regular request:', error);
      // Fallback to regular request
      await regularRequest(userMessage);
    }
  };

  const streamResponse = async (userMessage) => {
    try {
      // Try Server-Sent Events first
      const eventSource = new EventSource(
        `${webhookUrl}?message=${encodeURIComponent(userMessage)}&stream=true`
      );

      let assistantMessageId = Date.now();
      let fullResponse = '';

      eventSource.onmessage = (event) => {
        const data = event.data;
        
        if (data === '[DONE]') {
          eventSource.close();
          setIsStreaming(false);
          setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
          }]);
          setCurrentStreamingMessage('');
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.content || parsed.text || parsed.message || data;
          fullResponse += chunk;
          setCurrentStreamingMessage(fullResponse);
        } catch {
          // If not JSON, treat as plain text
          fullResponse += data;
          setCurrentStreamingMessage(fullResponse);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        throw new Error('SSE connection failed');
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (isStreaming) {
          eventSource.close();
          setIsStreaming(false);
          if (fullResponse) {
            setMessages(prev => [...prev, {
              id: assistantMessageId,
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date(),
            }]);
          }
          setCurrentStreamingMessage('');
        }
      }, 30000);

    } catch (error) {
      // If SSE fails, try fetch streaming
      await fetchStreaming(userMessage);
    }
  };

  const fetchStreaming = async (userMessage) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ 
          message: userMessage,
          stream: true 
        }),
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageId = Date.now();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
          }]);
          setCurrentStreamingMessage('');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              setMessages(prev => [...prev, {
                id: assistantMessageId,
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date(),
              }]);
              setCurrentStreamingMessage('');
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const chunk = parsed.content || parsed.text || parsed.message || data;
              fullResponse += chunk;
              setCurrentStreamingMessage(fullResponse);
            } catch {
              fullResponse += data;
              setCurrentStreamingMessage(fullResponse);
            }
          }
        }
      }
    } catch (error) {
      console.error('Fetch streaming error:', error);
      throw error;
    }
  };

  const regularRequest = async (userMessage) => {
    try {
      // Try POST first (standard webhook)
      let response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          question: userMessage, // n8n might use 'question'
          query: userMessage,    // or 'query'
        }),
      });

      // If POST fails, try GET with query params
      if (!response.ok) {
        const urlWithParams = new URL(webhookUrl);
        urlWithParams.searchParams.append('message', userMessage);
        urlWithParams.searchParams.append('question', userMessage);
        response = await fetch(urlWithParams.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse as JSON, fallback to text
      let assistantMessage;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        assistantMessage = data.response || data.message || data.text || data.content || 
                          data.answer || data.output || JSON.stringify(data);
      } else {
        assistantMessage = await response.text();
      }

      if (!assistantMessage || assistantMessage.trim() === '') {
        assistantMessage = 'No response received from the server.';
      }

      // Simulate streaming for better UX even if backend doesn't support it
      await simulateStreaming(assistantMessage);
    } catch (error) {
      console.error('Regular request error:', error);
      setIsStreaming(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true,
      }]);
    }
  };

  const simulateStreaming = async (text) => {
    const assistantMessageId = Date.now();
    let displayedText = '';
    
    // Stream character by character for ChatGPT-like effect
    for (let i = 0; i < text.length; i++) {
      displayedText += text[i];
      setCurrentStreamingMessage(displayedText);
      await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay per character
    }

    setIsStreaming(false);
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: displayedText,
      timestamp: new Date(),
    }]);
    setCurrentStreamingMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg mb-4">
              <Bot className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-600 dark:text-white/70 text-sm">
              Ask me anything and I'll respond with streaming text
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : message.error
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' 
                  ? 'text-indigo-100' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming Message */}
        {isStreaming && currentStreamingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              <div className="whitespace-pre-wrap break-words">
                {currentStreamingMessage}
                <span className="inline-block w-2 h-4 bg-indigo-600 dark:bg-indigo-400 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {isStreaming && !currentStreamingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold hover:from-indigo-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamingChat;

