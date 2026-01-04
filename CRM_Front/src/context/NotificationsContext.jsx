import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../lib/socketService';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { authData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = React.useRef(null);

  useEffect(() => {
    if (!authData?.access_token || !authData?.org_id) {
      console.log('NotificationsContext: Missing auth data, skipping socket setup');
      return;
    }

    const userBranch = authData.branch || localStorage.getItem('branch') || '';
    console.log('NotificationsContext: Setting up socket with branch:', userBranch, 'org_id:', authData.org_id);

    const socket = getSocket(authData.access_token, authData.org_id, userBranch);
    socketRef.current = socket;

    // Handler for new orders
    const handleNewOrder = (data) => {
      console.log('NotificationsContext: Received new_order event:', data);
      if (data.order) {
        // Only show notification if order is for user's branch
        const orderBranch = data.order.location_serv;
        console.log('NotificationsContext: Order branch:', orderBranch, 'User branch:', userBranch);
        
        // Show notification if branch matches or if user has no branch assigned (show all)
        if (!userBranch || orderBranch === userBranch) {
          setNotifications(prev => {
            // Check if notification for this order already exists (prevent duplicates)
            const orderId = data.order.id;
            const existingNotification = prev.find(n => n.order?.id === orderId && n.type === 'new_order');
            if (existingNotification) {
              console.log('NotificationsContext: Notification already exists for order:', data.order.order_no);
              return prev; // Don't add duplicate
            }
            
            console.log('NotificationsContext: Adding notification for order:', data.order.order_no);
            const notification = {
              id: `new_order_${orderId}_${Date.now()}`, // More unique ID based on order ID
              type: 'new_order',
              title: 'New Order Received',
              message: `Order ${data.order.order_no} from ${data.order.customer_name || 'Customer'}`,
              order: data.order,
              timestamp: new Date(),
              read: false,
            };
            const updated = [notification, ...prev].slice(0, 50);
            console.log('NotificationsContext: Notifications updated, count:', updated.length);
            return updated;
          });
        } else {
          console.log('NotificationsContext: Ignoring order - branch mismatch. Order branch:', orderBranch, 'User branch:', userBranch);
        }
      }
    };

    // Handler for order updates
    const handleOrderUpdate = (data) => {
      console.log('NotificationsContext: Received order_updated event:', data);
      if (data.order) {
        const orderBranch = data.order.location_serv;
        if (!userBranch || orderBranch === userBranch) {
          setNotifications(prev => {
            // Check if a recent notification for this order update already exists (prevent duplicates)
            const orderId = data.order.id;
            const recentThreshold = 5000; // 5 seconds
            const existingNotification = prev.find(n => {
              if (n.order?.id !== orderId || n.type !== 'order_updated') return false;
              const timeDiff = Date.now() - new Date(n.timestamp).getTime();
              return timeDiff < recentThreshold;
            });
            
            if (existingNotification) {
              console.log('NotificationsContext: Recent update notification already exists for order:', data.order.order_no);
              return prev; // Don't add duplicate
            }
            
            console.log('NotificationsContext: Adding update notification for order:', data.order.order_no);
            const notification = {
              id: `order_updated_${orderId}_${Date.now()}`, // More unique ID based on order ID
              type: 'order_updated',
              title: 'Order Updated',
              message: `Order ${data.order.order_no} status changed to ${data.newValue || data.order.status}`,
              order: data.order,
              timestamp: new Date(),
              read: false,
            };
            const updated = [notification, ...prev].slice(0, 50);
            console.log('NotificationsContext: Order update notification added');
            return updated;
          });
        }
      }
    };

    // Remove any existing listeners first to prevent duplicates
    console.log('NotificationsContext: Removing existing listeners before attaching new ones');
    socket.off('new_order');
    socket.off('order_updated');
    socket.off('connect');

    // Set up listeners - always attach them, socket.io will queue events if not connected
    console.log('NotificationsContext: Attaching socket listeners');
    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdate);

    // Also listen for connect event to ensure we're connected and joined rooms
    const handleConnect = () => {
      console.log('NotificationsContext: Socket connected, ID:', socket.id);
      // Re-join rooms on reconnect
      if (authData.org_id) {
        socket.emit('join_org', { org_id: authData.org_id });
        console.log('NotificationsContext: Joined org room:', `org:${authData.org_id}`);
      }
      if (userBranch) {
        socket.emit('join_branch', { branch: userBranch });
        console.log('NotificationsContext: Joined branch room:', `branch:${userBranch}`);
      }
    };

    // Set up connect handler
    socket.on('connect', handleConnect);

    // If already connected, join rooms immediately
    if (socket.connected) {
      console.log('NotificationsContext: Socket already connected');
      handleConnect();
    }

    return () => {
      console.log('NotificationsContext: Cleaning up socket listeners');
      if (socketRef.current) {
        socketRef.current.off('new_order', handleNewOrder);
        socketRef.current.off('order_updated', handleOrderUpdate);
        socketRef.current.off('connect', handleConnect);
      }
    };
  }, [authData]);

  // Sync unreadCount with notifications
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
    console.log('NotificationsContext: Synced unreadCount to:', unread, 'from', notifications.length, 'notifications');
  }, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

