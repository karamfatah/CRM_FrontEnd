import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSocket, disconnectSocket } from '../../lib/socketService';
import { 
  Calendar, 
  Search, 
  Filter, 
  ShoppingCart, 
  Phone, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  Hash,
  FileText,
  RefreshCw,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Copy,
  ExternalLink,
  Trash2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';

const OrderTaker = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [originalLocation, setOriginalLocation] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [editingItems, setEditingItems] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const [itemEditValues, setItemEditValues] = useState({});
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    product_id: '',
    product_name: '',
    sku: '',
    qty: 1,
    unit_price: 0,
    discount: 0,
    tax_amount: 0
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    customer_phone: '',
    customer_name: '',
    order_no: '',
    start_date: '',
    end_date: '',
  });
  const [filterKey, setFilterKey] = useState(0);

  // Get user's branch location
  const userBranch = authData?.branch || localStorage.getItem('branch') || '';
  
  // Debug logging
  useEffect(() => {
    console.log('OrderTaker - authData:', authData);
    console.log('OrderTaker - userBranch:', userBranch);
    console.log('OrderTaker - localStorage branch:', localStorage.getItem('branch'));
  }, [authData, userBranch]);

  // Status configuration with colors and icons
  const statusConfig = {
    in_processing: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: Package, label: t('customer_orders.in_processing') || 'In Processing' },
    shipped: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400', icon: Truck, label: t('customer_orders.shipped') || 'Shipped' },
    out_for_delivery: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400', icon: Truck, label: t('customer_orders.out_for_delivery') || 'Out for Delivery' },
    delivered: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: CheckCircle, label: t('customer_orders.delivered') || 'Delivered' },
    on_hold: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: Clock, label: t('customer_orders.on_hold') || 'On Hold' },
    failed: { color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400', icon: XCircle, label: t('customer_orders.failed') || 'Failed' },
    returned: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400', icon: RefreshCw, label: t('customer_orders.returned') || 'Returned' },
    refunded: { color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400', icon: DollarSign, label: t('customer_orders.refunded') || 'Refunded' },
    canceled: { color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400', icon: XCircle, label: t('customer_orders.canceled') || 'Canceled' },
  };

  const paymentConfig = {
    unpaid: { color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
    paid: { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
    refunded: { color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
    partial: { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  };

  // Status workflow order for quick actions
  const statusWorkflow = ['in_processing', 'shipped', 'out_for_delivery', 'delivered'];

  const socketRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authData?.access_token) {
      setError(t('order_taker.please_login') || 'Please log in to view orders');
      setLoading(false);
      return;
    }
    if (!userBranch) {
      setError(t('order_taker.no_branch_assigned') || 'No branch assigned to your account. Please contact administrator.');
      setLoading(false);
      return;
    }
    fetchOrders();
    fetchStats();
    fetchLocations();

    // Setup Socket.io for real-time updates
    const socket = getSocket(authData.access_token, authData.org_id, userBranch);
    socketRef.current = socket;

    // Handler functions for socket events
    const handleNewOrder = (data) => {
      console.log('OrderTaker: New order received:', data);
      if (data.order && data.order.location_serv === userBranch) {
        // Refresh orders list and stats
        fetchOrders(true);
        fetchStats();
        // Show success message
        setSuccess(t('order_taker.new_order_received') || `New order received: ${data.order.order_no}`);
        setTimeout(() => setSuccess(''), 5000);
      }
    };

    const handleOrderUpdate = (data) => {
      console.log('OrderTaker: Order updated:', data);
      if (data.order && data.order.location_serv === userBranch) {
        // Refresh orders list and stats
        fetchOrders(true);
        fetchStats();
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder(data.order);
        }
      }
    };

    // Remove any existing listeners first to prevent duplicates
    socket.off('new_order', handleNewOrder);
    socket.off('order_updated', handleOrderUpdate);

    // Listen for new orders
    socket.on('new_order', handleNewOrder);

    // Listen for order updates
    socket.on('order_updated', handleOrderUpdate);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_order', handleNewOrder);
        socketRef.current.off('order_updated', handleOrderUpdate);
      }
    };
  }, [authData, authLoading, page, perPage, filterKey, userBranch]);

  // Separate effect to handle order updates for selected order
  useEffect(() => {
    if (!socketRef.current || !selectedOrder) return;

    const handleSelectedOrderUpdate = (data) => {
      if (data.order && data.order.id === selectedOrder.id) {
        setSelectedOrder(data.order);
        fetchOrderDetails(data.order.id);
      }
    };

    // Remove existing listener first to prevent duplicates
    socketRef.current.off('order_updated', handleSelectedOrderUpdate);
    socketRef.current.on('order_updated', handleSelectedOrderUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('order_updated', handleSelectedOrderUpdate);
      }
    };
  }, [selectedOrder]);

  const fetchLocations = async () => {
    if (!authData?.org_id) return;
    setLocationsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/locations_qa?org_id=${authData.org_id}`,
        {
          headers: {
            'x-access-tokens': authData?.access_token || localStorage.getItem('access_token'),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error(t('order_taker.no_access_token') || 'No access token found. Please log in.');
      }

      const url = new URL(`${API_URL}/api/customer-orders/orders`);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      
      // Filter by user's branch location
      url.searchParams.append('location_serv', userBranch);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

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
            const retryResponse = await fetch(url, {
              method: 'GET',
              headers: { 'x-access-tokens': access_token, 'Content-Type': 'application/json' },
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              setOrders(retryData.data || []);
              setTotalPages(retryData.pagination?.total_pages || 1);
              setTotalOrders(retryData.pagination?.total || 0);
              return;
            }
          }
        }
        throw new Error(t('order_taker.unauthorized') || 'Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(t('order_taker.fetch_orders_error') || `Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalOrders(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || t('order_taker.load_orders_error') || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const url = new URL(`${API_URL}/api/customer-orders/stats`);
      url.searchParams.append('location_serv', userBranch);
      url.searchParams.append('org_id', authData?.org_id || 1);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend stats to frontend format
        const statsData = data.data || {};
        const mappedStats = {
          total: parseInt(statsData.total_orders) || 0,
          in_processing: parseInt(statsData.in_processing_orders) || 0,
          shipped: parseInt(statsData.shipped_orders) || 0,
          out_for_delivery: parseInt(statsData.out_for_delivery_orders) || 0,
          delivered: parseInt(statsData.delivered_orders) || 0,
          on_hold: parseInt(statsData.on_hold_orders) || 0,
          failed: parseInt(statsData.failed_orders) || 0,
          returned: parseInt(statsData.returned_orders) || 0,
          refunded: parseInt(statsData.refunded_orders) || 0,
          canceled: parseInt(statsData.canceled_orders) || 0,
          total_revenue: parseFloat(statsData.total_revenue) || 0,
          avg_order_value: parseFloat(statsData.avg_order_value) || 0,
        };
        console.log('OrderTaker - Raw stats from backend:', statsData);
        console.log('OrderTaker - Mapped stats:', mappedStats);
        setStats(mappedStats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/details`,
        {
          method: 'GET',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(t('order_taker.fetch_details_error') || `Failed to fetch order details`);
      }

      const data = await response.json();
      setOrderDetails(data.data || []);
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOrderClick = useCallback(async (order) => {
    setSelectedOrder(order);
    setEditingLocation(false);
    await fetchOrderDetails(order.id);
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      await fetchOrders(true);
      await fetchStats();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(t('order_taker.update_status_error') || 'Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/payment-status`,
        {
          method: 'PATCH',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status: paymentStatus }),
        }
      );

      if (!response.ok) throw new Error('Failed to update payment status');

      await fetchOrders(true);
      await fetchStats();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError(t('order_taker.update_payment_error') || 'Failed to update payment status');
    }
  };

  // Validate if all order items have inventory at the new location
  const validateItemsForLocation = async (locationServ) => {
    if (!locationServ || orderDetails.length === 0) return { valid: true, invalidItems: [] };

    const location = locations.find(loc => {
      const locNameEn = loc.name_en || loc.location_en || '';
      const locNameAr = loc.name_ar || loc.location_ar || '';
      return locNameEn === locationServ || locNameAr === locationServ;
    });

    if (!location) {
      console.warn('Location not found for validation:', locationServ);
      return { 
        valid: false, 
        invalidItems: orderDetails.map(item => ({ ...item, reason: 'location_not_found' }))
      };
    }

    const locationId = location.id || location.locations_qa_id || location._id;
    if (!locationId) {
      console.warn('Location ID not found for validation:', location);
      return { 
        valid: false, 
        invalidItems: orderDetails.map(item => ({ ...item, reason: 'location_id_not_found' }))
      };
    }

    try {
      const orgId = authData?.org_id || 1;
      const response = await fetch(
        `${API_URL}/api/inventory?org_id=${orgId}&location_id=${locationId}`,
        {
          headers: { 'x-access-tokens': authData?.access_token || localStorage.getItem('access_token') }
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch inventory for validation:', response.status);
        return { 
          valid: false, 
          invalidItems: orderDetails.map(item => ({ ...item, reason: 'inventory_fetch_failed' }))
        };
      }

      const data = await response.json();
      const newLocationInventory = data.data || [];

      const invalidItems = [];
      for (const item of orderDetails) {
        const productId = item.product_id?.toString();
        if (!productId) {
          invalidItems.push({ ...item, reason: 'no_product_id' });
          continue;
        }

        const inv = newLocationInventory.find(inv => inv.item_id?.toString() === productId);
        
        if (!inv) {
          invalidItems.push({ ...item, reason: 'not_in_inventory' });
        } else if (parseFloat(inv.qty) === 0 && !inv.allow_zero_qty) {
          invalidItems.push({ ...item, reason: 'zero_qty' });
        }
      }

      console.log('Validation result:', { valid: invalidItems.length === 0, invalidItemsCount: invalidItems.length });

      return {
        valid: invalidItems.length === 0,
        invalidItems
      };
    } catch (err) {
      console.error('Error validating items for location:', err);
      return { 
        valid: false, 
        invalidItems: orderDetails.map(item => ({ ...item, reason: 'validation_error' }))
      };
    }
  };

  const updateOrderLocation = async (orderId, locationServ) => {
    try {
      setUpdatingLocation(true);

      const validation = await validateItemsForLocation(locationServ);
      
      if (!validation.valid) {
        const itemNames = validation.invalidItems.map(item => item.product_name).join(', ');
        const errorMsg = t('customer_orders.cannot_change_location_items') 
          ? t('customer_orders.cannot_change_location_items').replace('{{items}}', itemNames)
          : `Unable to change "Served From Location" because the following items are not available at the new location: ${itemNames}. Please remove these items first.`;
        
        setError(errorMsg);
        setTimeout(() => setError(''), 8000);
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, location_serv: originalLocation });
        }
        setEditingLocation(false);
        setOriginalLocation(null);
        setUpdatingLocation(false);
        return;
      }

      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/location`,
        {
          method: 'PATCH',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ location_serv: locationServ || null }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update location');
      }

      const data = await response.json();
      
      await fetchOrders(true);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, location_serv: locationServ || null });
      }
      setEditingLocation(false);
      setOriginalLocation(null);
      setSuccess(t('customer_orders.update_location_success') || 'Location updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.message || t('customer_orders.update_location_error') || 'Failed to update location');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const updateOrderAddress = async (orderId, address) => {
    try {
      setUpdatingAddress(true);
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/address`,
        {
          method: 'PATCH',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_address1: address }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update address');
      }

      await fetchOrders(true);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, delivery_address1: address });
      }
      setEditingAddress(false);
      setSuccess(t('customer_orders.update_address_success') || 'Address updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating address:', err);
      setError(err.message || t('customer_orders.update_address_error') || 'Failed to update address');
    } finally {
      setUpdatingAddress(false);
    }
  };

  const updateOrderItem = async (orderId, itemId, updates) => {
    try {
      setUpdatingItems({ ...updatingItems, [itemId]: true });
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update item');
      }

      const data = await response.json();
      await fetchOrders(true);
      await fetchOrderDetails(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.data);
      }
      setEditingItems({ ...editingItems, [itemId]: false });
      setItemEditValues({ ...itemEditValues, [itemId]: {} });
      setSuccess(t('customer_orders.update_item_success') || 'Item updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message || t('customer_orders.update_item_error') || 'Failed to update item');
      setUpdatingItems({ ...updatingItems, [itemId]: false });
    }
  };

  const removeOrderItem = async (orderId, itemId) => {
    if (!window.confirm(t('customer_orders.remove_item_confirm') || 'Are you sure you want to remove this item?')) {
      return;
    }

    try {
      setUpdatingItems({ ...updatingItems, [itemId]: true });
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/items/${itemId}`,
        {
          method: 'DELETE',
          headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to remove item');
      }

      const data = await response.json();
      await fetchOrders(true);
      await fetchOrderDetails(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.data);
      }
      setSuccess(t('customer_orders.remove_item_success') || 'Item removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || t('customer_orders.remove_item_error') || 'Failed to remove item');
    } finally {
      setUpdatingItems({ ...updatingItems, [itemId]: false });
    }
  };

  const fetchProducts = useCallback(async (searchTerm = '') => {
    if (!authData?.access_token) return;
    
    setProductsLoading(true);
    try {
      const orgId = authData?.org_id || 1;
      const params = new URLSearchParams({
        org_id: orgId.toString(),
        is_active: 'true',
        per_page: '50',
      });
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(
        `${API_URL}/api/products?${params}`,
        { headers: { 'x-access-tokens': authData?.access_token || localStorage.getItem('access_token') } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, [authData?.access_token, authData?.org_id]);

  const fetchInventory = useCallback(async () => {
    if (!selectedOrder?.location_serv || !authData?.access_token) {
      setInventory([]);
      return;
    }

    const location = locations.find(loc => {
      const locNameEn = loc.name_en || loc.location_en || '';
      const locNameAr = loc.name_ar || loc.location_ar || '';
      return locNameEn === selectedOrder.location_serv || locNameAr === selectedOrder.location_serv;
    });

    if (!location) {
      setInventory([]);
      return;
    }

    const locationId = location.id || location.locations_qa_id || location._id;
    if (!locationId) {
      setInventory([]);
      return;
    }

    setInventoryLoading(true);
    try {
      const orgId = authData?.org_id || 1;
      const response = await fetch(
        `${API_URL}/api/inventory?org_id=${orgId}&location_id=${locationId}`,
        {
          headers: { 'x-access-tokens': authData?.access_token || localStorage.getItem('access_token') }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInventory(data.data || []);
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [selectedOrder?.location_serv, locations, authData?.access_token, authData?.org_id]);

  useEffect(() => {
    if (selectedOrder?.location_serv && locations.length > 0) {
      fetchInventory();
    } else {
      setInventory([]);
    }
  }, [selectedOrder?.location_serv, locations, fetchInventory]);

  const getProductInventory = (productId) => {
    return inventory.find(inv => inv.item_id?.toString() === productId?.toString());
  };

  const canAddProduct = (product) => {
    if (!selectedOrder?.location_serv) return false;
    
    const inv = getProductInventory(product.id);
    if (!inv) return false;
    
    if (parseFloat(inv.qty) === 0 && !inv.allow_zero_qty) {
      return false;
    }
    
    return true;
  };

  const filteredProducts = products.filter(p => {
    if (selectedOrder?.location_serv && inventory.length > 0) {
      const inv = getProductInventory(p.id);
      if (!inv) return false;
    }
    
    if (productSearch) {
      const search = productSearch.toLowerCase();
      return (
        (p.name_en && p.name_en.toLowerCase().includes(search)) ||
        (p.name_ar && p.name_ar.toLowerCase().includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search)) ||
        (p.barcode && p.barcode.toLowerCase().includes(search))
      );
    }
    
    return true;
  });

  const handleSelectProduct = (product) => {
    if (!selectedOrder?.location_serv) {
      setError(t('make_order.select_location_first') || 'Order must have a "Served From Location" set first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!canAddProduct(product)) {
      setError(t('make_order.product_zero_qty') || `Unable to add to order - 0 qty at location`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setNewItem({
      product_id: product.id.toString(),
      product_name: language === 'ar' && product.name_ar ? product.name_ar : product.name_en,
      sku: product.sku || '',
      qty: 1,
      unit_price: parseFloat(product.unit_price) || 0,
      discount: 0,
      tax_amount: (parseFloat(product.unit_price) || 0) * (parseFloat(product.tax_rate) || 0) / 100,
    });
    setShowProductDropdown(false);
    setProductSearch('');
  };

  const addOrderItem = async (orderId) => {
    if (!newItem.product_name || !newItem.qty || !newItem.unit_price || parseFloat(newItem.unit_price) <= 0) {
      setError(t('customer_orders.fill_item_fields') || 'Please fill all required fields');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (savingItem) {
      return;
    }

    try {
      setSavingItem(true);
      setError('');
      
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await fetch(
        `${API_URL}/api/customer-orders/orders/${orderId}/items`,
        {
          method: 'POST',
          headers: { 
            'x-access-tokens': accessToken, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(newItem),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add item: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      await fetchOrders(true);
      await fetchOrderDetails(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.data);
      }

      setNewItem({
        product_id: '',
        product_name: '',
        sku: '',
        qty: 1,
        unit_price: 0,
        discount: 0,
        tax_amount: 0
      });
      setShowAddItemForm(false);
      setShowProductDropdown(false);
      setProductSearch('');
      setSuccess(t('customer_orders.add_item_success') || 'Item added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.message || t('customer_orders.add_item_error') || 'Failed to add item');
    } finally {
      setSavingItem(false);
    }
  };

  const formatCurrency = (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleLogout = () => {
    // This will be handled by the AuthContext
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!userBranch) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      {t('order_taker.no_branch_assigned') || 'No Branch Assigned'}
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 mt-2">
                      {t('order_taker.no_branch_message') || 'Your account is not assigned to any branch. Please contact your administrator.'}
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 mt-2 text-sm">
                      {t('order_taker.no_branch_hint') || 'If you recently logged in, please log out and log back in to refresh your branch assignment.'}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          localStorage.clear();
                          window.location.href = '/login';
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('order_taker.logout_and_relogin') || 'Logout and Login Again'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('order_taker.title') || 'Order Taker'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('order_taker.subtitle')?.replace('{{branch}}', userBranch) || `Orders for ${userBranch}`}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">{success}</p>
                </div>
              </div>
            )}

            {/* Stats Cards - Compact */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">{t('order_taker.total_orders') || 'Total Orders'}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
                    </div>
                    <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">{t('order_taker.in_processing') || 'In Processing'}</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.in_processing || 0}</p>
                    </div>
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">{t('order_taker.delivered') || 'Delivered'}</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.delivered || 0}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">{t('order_taker.revenue') || 'Revenue'}</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.total_revenue || 0, selectedOrder?.currency || 'EGP')}
                      </p>
                    </div>
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('order_taker.filters') || 'Filters'}
                    </span>
                    {(filters.status || filters.payment_status || filters.customer_phone || filters.customer_name || filters.order_no || filters.start_date || filters.end_date) && (
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                        {Object.values(filters).filter(v => v).length}
                      </span>
                    )}
                  </div>
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {showFilters && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.status') || 'Status'}
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, status: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('order_taker.all_statuses') || 'All Statuses'}</option>
                      {Object.keys(statusConfig).map(status => (
                        <option key={status} value={status}>
                          {statusConfig[status].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.payment_status') || 'Payment Status'}
                    </label>
                    <select
                      value={filters.payment_status}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, payment_status: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('order_taker.all_payment_statuses') || 'All Payment Statuses'}</option>
                      {Object.keys(paymentConfig).map(status => (
                        <option key={status} value={status}>
                          {paymentConfig[status].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.phone') || 'Phone'}
                    </label>
                    <input
                      type="text"
                      value={filters.customer_phone}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, customer_phone: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      placeholder={t('order_taker.search_phone') || 'Search by phone...'}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Customer Name Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.customer_name') || 'Customer Name'}
                    </label>
                    <input
                      type="text"
                      value={filters.customer_name}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, customer_name: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      placeholder={t('order_taker.search_customer') || 'Search by name...'}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Order No Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.order_no') || 'Order #'}
                    </label>
                    <input
                      type="text"
                      value={filters.order_no}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, order_no: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      placeholder={t('order_taker.search_order_no') || 'Search by order #...'}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Start Date Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.start_date') || 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, start_date: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                      {t('order_taker.end_date') || 'End Date'}
                    </label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, end_date: e.target.value }));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Reset Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters({
                          status: '',
                          payment_status: '',
                          customer_phone: '',
                          customer_name: '',
                          order_no: '',
                          start_date: '',
                          end_date: '',
                        });
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      {t('order_taker.reset_filters') || 'Reset Filters'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('order_taker.orders_list') || 'Orders List'}
                  </h2>
                  <button
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{t('order_taker.no_orders') || 'No orders found'}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.status]?.icon || Package;
                    const statusColor = statusConfig[order.status]?.color || 'bg-gray-100 text-gray-700';
                    const paymentColor = paymentConfig[order.payment_status]?.color || 'bg-gray-50 text-gray-600';

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                        className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="font-semibold text-xs text-gray-900 dark:text-white">{order.order_no}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor}`}>
                                <StatusIcon className="h-2.5 w-2.5 inline mr-0.5" />
                                {statusConfig[order.status]?.label || order.status}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${paymentColor}`}>
                                {order.payment_status || 'unpaid'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-600 dark:text-gray-400 flex-wrap">
                              <div className="flex items-center gap-0.5">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{order.customer_name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Phone className="h-3 w-3" />
                                <span>{order.customer_phone}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[80px]">{order.location_serv || t('order_taker.no_location') || 'No location'}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <DollarSign className="h-3 w-3" />
                                <span className="font-semibold">{formatCurrency(order.grand_total, order.currency)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">
                      {t('order_taker.showing') || 'Showing'} {(page - 1) * perPage + 1} - {Math.min(page * perPage, totalOrders)} {t('order_taker.of') || 'of'} {totalOrders}
                    </span>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                        setFilterKey(prev => prev + 1);
                      }}
                      className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    >
                      <option value={10}>10 {t('order_taker.per_page') || 'per page'}</option>
                      <option value={25}>25 {t('order_taker.per_page') || 'per page'}</option>
                      <option value={50}>50 {t('order_taker.per_page') || 'per page'}</option>
                      <option value={100}>100 {t('order_taker.per_page') || 'per page'}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 px-2">
                      {t('order_taker.page') || 'Page'} {page} {t('order_taker.of') || 'of'} {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details Sidebar */}
            {selectedOrder && (
              <AnimatePresence>
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('order_taker.order_details') || 'Order Details'}
                    </h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">{t('order_taker.order_no') || 'Order #'}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{selectedOrder.order_no}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">{t('order_taker.status') || 'Status'}</div>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                          className="mt-1 w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                        >
                          {Object.keys(statusConfig).map(status => (
                            <option key={status} value={status}>
                              {statusConfig[status].label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">{t('order_taker.customer') || 'Customer'}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customer_name || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">{t('order_taker.phone') || 'Phone'}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customer_phone}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-600 dark:text-gray-400">{t('order_taker.address') || 'Address'}</div>
                        {editingAddress ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={selectedOrder.delivery_address1 || ''}
                              onChange={(e) => setSelectedOrder({ ...selectedOrder, delivery_address1: e.target.value })}
                              disabled={updatingAddress}
                              className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              autoFocus
                            />
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateOrderAddress(selectedOrder.id, selectedOrder.delivery_address1)}
                                disabled={updatingAddress}
                                className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {updatingAddress ? '...' : t('common.save') || 'Save'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAddress(false);
                                  fetchOrders(true);
                                }}
                                disabled={updatingAddress}
                                className="px-2 py-0.5 text-[10px] bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50"
                              >
                                {t('common.cancel') || 'Cancel'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-800 dark:text-white">
                                {selectedOrder.delivery_address1 || t('order_taker.no_address') || 'No address'}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingAddress(true)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-opacity"
                            >
                              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-600 dark:text-gray-400">{t('order_taker.location') || 'Location'}</div>
                        <div className="text-xs font-medium text-gray-800 dark:text-white">
                          {selectedOrder.location_serv || t('order_taker.no_location') || 'No location'}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-white">
                            {t('order_taker.items') || 'Items'} ({orderDetails.length})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowAddItemForm(true);
                            fetchProducts();
                          }}
                          disabled={!selectedOrder?.location_serv}
                          className="px-2 py-1 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <Package className="h-3 w-3" />
                          {t('customer_orders.add_item') || 'Add Item'}
                        </button>
                      </div>

                      {detailsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Add Item Form */}
                          {showAddItemForm && (
                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                  {t('customer_orders.add_new_item') || 'Add New Item'}
                                </span>
                                <button
                                  onClick={() => {
                                    setShowAddItemForm(false);
                                    setShowProductDropdown(false);
                                    setProductSearch('');
                                    setNewItem({
                                      product_id: '',
                                      product_name: '',
                                      sku: '',
                                      qty: 1,
                                      unit_price: 0,
                                      discount: 0,
                                      tax_amount: 0
                                    });
                                  }}
                                  className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder={t('customer_orders.search_product') || 'Search product...'}
                                  value={productSearch}
                                  onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    if (e.target.value.length > 0) {
                                      fetchProducts(e.target.value);
                                      setShowProductDropdown(true);
                                    } else {
                                      setShowProductDropdown(false);
                                    }
                                  }}
                                  onFocus={() => {
                                    if (!selectedOrder?.location_serv) {
                                      setError(t('make_order.select_location_first') || 'Order must have a "Served From Location" set first');
                                      setTimeout(() => setError(''), 3000);
                                      return;
                                    }
                                    if (products.length === 0) fetchProducts();
                                    if (productSearch.length > 0) setShowProductDropdown(true);
                                  }}
                                  disabled={!selectedOrder?.location_serv}
                                  className="w-full px-2 py-1.5 text-[10px] rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                
                                <AnimatePresence>
                                  {showProductDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl max-h-[300px] overflow-y-auto"
                                    >
                                      {productsLoading ? (
                                        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                          <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                          {t('common.loading')}
                                        </div>
                                      ) : filteredProducts.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                                          {t('customer_orders.no_products_found') || 'No products found'}
                                        </div>
                                      ) : (
                                        filteredProducts.slice(0, 15).map((product) => {
                                          const inv = getProductInventory(product.id);
                                          const canAdd = canAddProduct(product);
                                          const isZeroQty = inv && parseFloat(inv.qty) === 0 && !inv.allow_zero_qty;
                                          
                                          return (
                                            <button
                                              key={product.id}
                                              type="button"
                                              onClick={() => handleSelectProduct(product)}
                                              disabled={!canAdd}
                                              className={`w-full px-2 py-1.5 text-left flex items-center gap-2 border-b border-gray-100 dark:border-white/5 last:border-0 ${
                                                canAdd 
                                                  ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer' 
                                                  : 'opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/10'
                                              }`}
                                            >
                                              {product.primary_image ? (
                                                <img 
                                                  src={product.primary_image} 
                                                  alt="" 
                                                  className="w-6 h-6 rounded object-cover"
                                                />
                                              ) : (
                                                <div className="w-6 h-6 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                  <Package className="h-3 w-3 text-gray-400" />
                                                </div>
                                              )}
                                              <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                                  {language === 'ar' && product.name_ar ? product.name_ar : product.name_en}
                                                </div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                  {product.sku && <span className="mr-2">{product.sku}</span>}
                                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(product.unit_price || 0, selectedOrder?.currency || 'EGP')}
                                                  </span>
                                                  {inv && (
                                                    <span className={`ml-2 ${isZeroQty ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                      • Qty: {parseFloat(inv.qty).toFixed(3)}
                                                    </span>
                                                  )}
                                                </div>
                                                {isZeroQty && (
                                                  <div className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">
                                                    {t('make_order.unable_to_add_zero_qty') || 'Unable to add - 0 qty at location'}
                                                  </div>
                                                )}
                                              </div>
                                            </button>
                                          );
                                        })
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {newItem.product_name && (
                                <>
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                      <label className="block text-emerald-700 dark:text-emerald-400 mb-0.5">Qty</label>
                                      <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={newItem.qty}
                                        onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                                        className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-emerald-700 dark:text-emerald-400 mb-0.5">Price</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newItem.unit_price}
                                        onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                                        className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-emerald-700 dark:text-emerald-400 mb-0.5">Discount</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newItem.discount}
                                        onChange={(e) => setNewItem({ ...newItem, discount: e.target.value })}
                                        className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-emerald-700 dark:text-emerald-400 mb-0.5">Tax</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newItem.tax_amount}
                                        onChange={(e) => setNewItem({ ...newItem, tax_amount: e.target.value })}
                                        className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                    {t('order_taker.line_total') || 'Line Total'}: {formatCurrency(
                                      (parseFloat(newItem.qty) || 0) * (parseFloat(newItem.unit_price) || 0) - (parseFloat(newItem.discount) || 0) + (parseFloat(newItem.tax_amount) || 0),
                                      selectedOrder?.currency || 'EGP'
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!savingItem && selectedOrder?.id) {
                                        addOrderItem(selectedOrder.id);
                                      }
                                    }}
                                    disabled={savingItem || !newItem.product_name || !newItem.qty || !newItem.unit_price || parseFloat(newItem.unit_price) <= 0}
                                    className="w-full px-2 py-1.5 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {savingItem ? (t('common.saving') || 'Saving...') : (t('customer_orders.add_item') || 'Add Item')}
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {orderDetails.map((item) => {
                            const isEditing = editingItems[item.id];
                            const editValues = itemEditValues[item.id] || {};

                            return (
                              <div key={item.id} className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{item.product_name}</div>
                                    {item.sku && (
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">SKU: {item.sku}</div>
                                    )}
                                  </div>
                                  {!isEditing && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingItems({ ...editingItems, [item.id]: true });
                                          setItemEditValues({
                                            ...itemEditValues,
                                            [item.id]: {
                                              qty: item.qty,
                                              unit_price: item.unit_price,
                                              discount: item.discount || 0,
                                              tax_amount: item.tax_amount || 0
                                            }
                                          });
                                        }}
                                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        title={t('customer_orders.edit_item') || 'Edit item'}
                                      >
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => removeOrderItem(selectedOrder.id, item.id)}
                                        disabled={updatingItems[item.id]}
                                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                        title={t('customer_orders.remove_item') || 'Remove item'}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      <div>
                                        <label className="block text-gray-700 dark:text-gray-300 mb-0.5">Qty</label>
                                        <input
                                          type="number"
                                          min="0.001"
                                          step="0.001"
                                          value={editValues.qty || item.qty}
                                          onChange={(e) => setItemEditValues({
                                            ...itemEditValues,
                                            [item.id]: { ...editValues, qty: e.target.value }
                                          })}
                                          className="w-full px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-gray-700 dark:text-gray-300 mb-0.5">Price</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={editValues.unit_price || item.unit_price}
                                          onChange={(e) => setItemEditValues({
                                            ...itemEditValues,
                                            [item.id]: { ...editValues, unit_price: e.target.value }
                                          })}
                                          className="w-full px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-gray-700 dark:text-gray-300 mb-0.5">Discount</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={editValues.discount || item.discount || 0}
                                          onChange={(e) => setItemEditValues({
                                            ...itemEditValues,
                                            [item.id]: { ...editValues, discount: e.target.value }
                                          })}
                                          className="w-full px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-gray-700 dark:text-gray-300 mb-0.5">Tax</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={editValues.tax_amount || item.tax_amount || 0}
                                          onChange={(e) => setItemEditValues({
                                            ...itemEditValues,
                                            [item.id]: { ...editValues, tax_amount: e.target.value }
                                          })}
                                          className="w-full px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          updateOrderItem(selectedOrder.id, item.id, editValues);
                                        }}
                                        disabled={updatingItems[item.id]}
                                        className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                                      >
                                        {updatingItems[item.id] ? '...' : t('common.save') || 'Save'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingItems({ ...editingItems, [item.id]: false });
                                          setItemEditValues({ ...itemEditValues, [item.id]: {} });
                                        }}
                                        disabled={updatingItems[item.id]}
                                        className="px-2 py-0.5 text-[10px] bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50"
                                      >
                                        {t('common.cancel') || 'Cancel'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-500">Qty:</span> {parseFloat(item.qty).toFixed(3)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-500">Price:</span> {formatCurrency(item.unit_price, selectedOrder?.currency || 'EGP')}
                                    </div>
                                    <div className="text-right font-semibold text-gray-900 dark:text-white">
                                      {formatCurrency(item.line_total, selectedOrder?.currency || 'EGP')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Order Totals */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('order_taker.subtotal') || 'Subtotal'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrder.subtotal || 0, selectedOrder.currency || 'EGP')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('order_taker.discount') || 'Discount'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrder.discount_total || 0, selectedOrder.currency || 'EGP')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('order_taker.tax') || 'Tax'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrder.tax_total || 0, selectedOrder.currency || 'EGP')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('order_taker.delivery') || 'Delivery'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedOrder.delivery_fee || 0, selectedOrder.currency || 'EGP')}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span className="text-gray-900 dark:text-white">{t('order_taker.total') || 'Total'}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(selectedOrder.grand_total || 0, selectedOrder.currency || 'EGP')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderTaker;

