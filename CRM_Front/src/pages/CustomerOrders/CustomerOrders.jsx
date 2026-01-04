import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
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

const CustomerOrders = () => {
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
  const [perPage, setPerPage] = useState(25);
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

  useEffect(() => {
    if (authLoading) return;
    if (!authData?.access_token) {
      setError(t('customer_orders.please_login') || 'Please log in to view customer orders');
      setLoading(false);
      return;
    }
    fetchOrders();
    fetchStats();
    fetchLocations();
  }, [authData, authLoading, page, perPage, filterKey]);

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
        throw new Error(t('customer_orders.no_access_token') || 'No access token found. Please log in.');
      }

      const url = new URL(`${API_URL}/api/customer-orders/orders`);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      
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
        throw new Error(t('customer_orders.unauthorized') || 'Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(t('customer_orders.fetch_orders_error') || `Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalOrders(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || t('customer_orders.load_orders_error') || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/customer-orders/stats`, {
        method: 'GET',
        headers: { 'x-access-tokens': accessToken, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
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
        throw new Error(t('customer_orders.fetch_details_error') || `Failed to fetch order details`);
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
    setEditingLocation(false); // Reset editing state when selecting a new order
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
      setError(t('customer_orders.update_status_error') || 'Failed to update order status');
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
      setError(t('customer_orders.update_payment_error') || 'Failed to update payment status');
    }
  };

  // Validate if all order items have inventory at the new location
  const validateItemsForLocation = async (locationServ) => {
    // If no location selected, allow (but warn if there are items)
    if (!locationServ) {
      if (orderDetails.length > 0) {
        return { 
          valid: false, 
          invalidItems: orderDetails.map(item => ({ ...item, reason: 'no_location' }))
        };
      }
      return { valid: true, invalidItems: [] };
    }

    // If no items in order, allow location change
    if (orderDetails.length === 0) {
      return { valid: true, invalidItems: [] };
    }

    // Find location_id from locations array by matching location_serv name
    const location = locations.find(loc => {
      const locNameEn = loc.name_en || loc.location_en || '';
      const locNameAr = loc.name_ar || loc.location_ar || '';
      return locNameEn === locationServ || locNameAr === locationServ;
    });

    if (!location) {
      // Location not found - this is an error, don't allow change
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
      // Fetch inventory for the new location
      const orgId = authData?.org_id || 1;
      const response = await fetch(
        `${API_URL}/api/inventory?org_id=${orgId}&location_id=${locationId}`,
        {
          headers: { 'x-access-tokens': authData?.access_token || localStorage.getItem('access_token') }
        }
      );

      if (!response.ok) {
        // If we can't fetch inventory, don't allow the change (fail closed for safety)
        console.error('Failed to fetch inventory for validation:', response.status);
        return { 
          valid: false, 
          invalidItems: orderDetails.map(item => ({ ...item, reason: 'inventory_fetch_failed' }))
        };
      }

      const data = await response.json();
      const newLocationInventory = data.data || [];

      // Check each order item
      const invalidItems = [];
      for (const item of orderDetails) {
        const productId = item.product_id?.toString();
        if (!productId) {
          // Item without product_id is invalid
          invalidItems.push({ ...item, reason: 'no_product_id' });
          continue;
        }

        const inv = newLocationInventory.find(inv => inv.item_id?.toString() === productId);
        
        // Item must exist in inventory and have qty > 0 OR allow_zero_qty = true
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
      // On error, don't allow the change (fail closed for safety)
      return { 
        valid: false, 
        invalidItems: orderDetails.map(item => ({ ...item, reason: 'validation_error' }))
      };
    }
  };

  const updateOrderLocation = async (orderId, locationServ) => {
    try {
      setUpdatingLocation(true);

      // Validate all items have inventory at the new location
      const validation = await validateItemsForLocation(locationServ);
      
      if (!validation.valid) {
        // Build error message with list of invalid items
        const itemNames = validation.invalidItems.map(item => item.product_name).join(', ');
        const errorMsg = t('customer_orders.cannot_change_location_items') 
          ? t('customer_orders.cannot_change_location_items').replace('{{items}}', itemNames)
          : `Unable to change "Served From Location" because the following items are not available at the new location: ${itemNames}. Please remove these items first.`;
        
        setError(errorMsg);
        setTimeout(() => setError(''), 8000);
        
        // Reset location dropdown to original value
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
        // Inventory will be refetched automatically via useEffect when selectedOrder.location_serv changes
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
          body: JSON.stringify({ delivery_address1: address || '' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update address');
      }

      const data = await response.json();
      
      await fetchOrders(true);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, delivery_address1: address || '' });
      }
      setEditingAddress(false);
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
      setItemEditValues({ ...itemEditValues, [itemId]: undefined });
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message || t('customer_orders.update_item_error') || 'Failed to update item');
    } finally {
      setUpdatingItems({ ...updatingItems, [itemId]: false });
    }
  };

  const removeOrderItem = async (orderId, itemId) => {
    if (!window.confirm(t('customer_orders.confirm_remove_item') || 'Are you sure you want to remove this item?')) {
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
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || t('customer_orders.remove_item_error') || 'Failed to remove item');
    } finally {
      setUpdatingItems({ ...updatingItems, [itemId]: false });
    }
  };

  // Fetch products catalog
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

  // Fetch inventory for the selected order's location
  const fetchInventory = useCallback(async () => {
    if (!selectedOrder?.location_serv || !authData?.access_token) {
      setInventory([]);
      return;
    }

    // Find location_id from locations array by matching location_serv name
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

  // Fetch inventory when order or location changes
  useEffect(() => {
    if (selectedOrder?.location_serv && locations.length > 0) {
      fetchInventory();
    } else {
      setInventory([]);
    }
  }, [selectedOrder?.location_serv, locations, fetchInventory]);

  // Get inventory info for a product
  const getProductInventory = (productId) => {
    return inventory.find(inv => inv.item_id?.toString() === productId?.toString());
  };

  // Check if product can be added (must exist in inventory for order's location)
  const canAddProduct = (product) => {
    if (!selectedOrder?.location_serv) return false; // Location must be set
    
    const inv = getProductInventory(product.id);
    if (!inv) return false; // Product must exist in inventory for this location
    
    // If qty is 0 and allow_zero_qty is false, cannot add
    if (parseFloat(inv.qty) === 0 && !inv.allow_zero_qty) {
      return false;
    }
    
    return true;
  };

  // Filter products based on search and inventory
  const filteredProducts = products.filter(p => {
    // If order has location, only show products that exist in inventory for that location
    if (selectedOrder?.location_serv && inventory.length > 0) {
      const inv = getProductInventory(p.id);
      if (!inv) return false; // Product not in inventory for this location
      // Show all products in inventory (even with 0 qty) - selection will be disabled by canAddProduct
    }
    
    // Search filter
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

  // Handle product selection
  const handleSelectProduct = (product) => {
    // Check if order has location
    if (!selectedOrder?.location_serv) {
      setError(t('make_order.select_location_first') || 'Order must have a "Served From Location" set first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check inventory
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

  // Add new item to order
  const addOrderItem = async (orderId) => {
    // Validation check
    if (!newItem.product_name || !newItem.qty || !newItem.unit_price || parseFloat(newItem.unit_price) <= 0) {
      setError(t('customer_orders.fill_item_fields') || 'Please fill all required fields');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Prevent double submission
    if (savingItem) {
      return;
    }

    try {
      setSavingItem(true);
      setError(''); // Clear any previous errors
      
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      console.log('Adding item to order:', orderId, newItem); // Debug log
      
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

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.error || `Failed to add item: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Item added successfully:', data); // Debug log
      
      // Refresh orders and order details
      await fetchOrders(true);
      await fetchOrderDetails(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.data);
      }

      // Reset form
      setNewItem({
        product_id: '',
        product_name: '',
        sku: '',
        qty: 1,
        unit_price: 0,
        discount: 0,
        tax_amount: 0
      });
      setShowProductDropdown(false);
      setProductSearch('');
      setShowAddItemForm(false);
      setSavingItem(false);
      
      // Show success message
      setSuccess(t('customer_orders.add_item_success') || 'Item added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.message || t('customer_orders.add_item_error') || 'Failed to add item');
      setTimeout(() => setError(''), 5000);
      setSavingItem(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return '—';
    }
  };

  const formatCurrency = (amount, currency = 'EGP') => {
    if (amount === null || amount === undefined) return `0 ${currency}`;
    const num = parseFloat(amount);
    if (num >= 1000) return `${(num/1000).toFixed(1)}K ${currency}`;
    return `${num.toFixed(2)} ${currency}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getNextStatus = (currentStatus) => {
    const idx = statusWorkflow.indexOf(currentStatus);
    if (idx === -1 || idx === statusWorkflow.length - 1) return null;
    return statusWorkflow[idx + 1];
  };

  const resetFilters = () => {
    setFilters({
      status: '', payment_status: '', customer_phone: '',
      customer_name: '', order_no: '', start_date: '', end_date: '',
    });
    setPage(1);
    setFilterKey(prev => prev + 1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  if (loading && !orders.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0f]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Compact Header Bar */}
          <div className="flex-shrink-0 px-4 py-2 bg-white dark:bg-[#12121a] border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Title & Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t('customer_orders.title') || 'Customer Orders'}
                    </h1>
                  </div>
                </div>

                {/* Inline Stats */}
                {stats && (
                  <div className="hidden md:flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5">
                      <span className="text-slate-500 dark:text-slate-400">Total:</span>
                      <span className="font-semibold text-slate-700 dark:text-white">{stats.total_orders || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20">
                      <Package className="h-3 w-3 text-blue-600" />
                      <span className="font-semibold text-blue-700 dark:text-blue-400">{stats.in_processing_orders || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20">
                      <Truck className="h-3 w-3 text-indigo-600" />
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400">{stats.shipped_orders || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20">
                      <Truck className="h-3 w-3 text-purple-600" />
                      <span className="font-semibold text-purple-700 dark:text-purple-400">{stats.out_for_delivery_orders || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{stats.delivered_orders || 0}</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal-50 dark:bg-teal-900/20">
                      <TrendingUp className="h-3 w-3 text-teal-600" />
                      <span className="font-semibold text-teal-700 dark:text-teal-400">{formatCurrency(stats.total_revenue)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOrders(true)}
                  disabled={refreshing}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                      {Object.values(filters).filter(v => v).length}
                    </span>
                  )}
                  {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Collapsible Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                      <select
                        value={filters.status}
                        onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">{t('customer_orders.status') || 'Status'}</option>
                        {Object.keys(statusConfig).map(s => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                      <select
                        value={filters.payment_status}
                        onChange={(e) => { setFilters({ ...filters, payment_status: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">{t('customer_orders.payment') || 'Payment'}</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <input
                        type="text"
                        value={filters.order_no}
                        onChange={(e) => { setFilters({ ...filters, order_no: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        placeholder="Order #"
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={filters.customer_phone}
                        onChange={(e) => { setFilters({ ...filters, customer_phone: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        placeholder="Phone"
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={filters.customer_name}
                        onChange={(e) => { setFilters({ ...filters, customer_name: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        placeholder="Name"
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => { setFilters({ ...filters, start_date: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => { setFilters({ ...filters, end_date: e.target.value }); setPage(1); setFilterKey(prev => prev + 1); }}
                        min={filters.start_date || undefined}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex-shrink-0 mx-4 mt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</p>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="flex-shrink-0 mx-4 mt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex-1">{success}</p>
                <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Orders Table */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${selectedOrder ? 'lg:w-1/2' : 'w-full'}`}>
              {/* Table Header */}
              <div className="flex-shrink-0 grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="col-span-2">Order</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Payment</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1 text-right">Time</div>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No orders found</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {orders.map((order) => {
                      const status = statusConfig[order.status] || statusConfig.in_processing;
                      const payment = paymentConfig[order.payment_status] || paymentConfig.unpaid;
                      const StatusIcon = status.icon;
                      const isSelected = selectedOrder?.id === order.id;

                      return (
                        <div
                          key={order.id}
                          onClick={() => handleOrderClick(order)}
                          className={`grid grid-cols-12 gap-2 px-4 py-2.5 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02] ${
                            isSelected ? 'bg-emerald-50 dark:bg-emerald-900/10 border-l-2 border-emerald-500' : ''
                          }`}
                        >
                          {/* Order # */}
                          <div className="col-span-2 flex items-center">
                            <span className="font-mono text-xs font-medium text-slate-700 dark:text-white truncate">
                              {order.order_no}
                            </span>
                          </div>

                          {/* Customer */}
                          <div className="col-span-3 min-w-0">
                            <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                              {order.customer_name || 'Unknown'}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {order.customer_phone || '—'}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-2 flex items-center">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              <span className="hidden sm:inline">{status.label}</span>
                            </span>
                          </div>

                          {/* Payment */}
                          <div className="col-span-2 flex items-center">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${payment.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${payment.dot}`} />
                              {order.payment_status}
                            </span>
                          </div>

                          {/* Total */}
                          <div className="col-span-2 flex items-center justify-end">
                            <span className="text-xs font-semibold text-slate-800 dark:text-white">
                              {formatCurrency(order.grand_total, order.currency)}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="col-span-1 flex items-center justify-end">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {formatDate(order.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white dark:bg-[#12121a] border-t border-slate-200 dark:border-white/5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalOrders)} of {totalOrders}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-xs text-slate-600 dark:text-slate-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Order Details Panel */}
            <AnimatePresence>
              {selectedOrder && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:flex flex-col w-1/2 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#12121a] overflow-hidden"
                >
                  {/* Detail Header */}
                  <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
                          {selectedOrder.order_no}
                        </span>
                        <button
                          onClick={() => copyToClipboard(selectedOrder.order_no)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5"
                          title="Copy order number"
                        >
                          <Copy className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusConfig[selectedOrder.status]?.color}`}>
                        {statusConfig[selectedOrder.status]?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex-shrink-0 px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {t('customer_orders.change_status') || 'Change Status:'}
                        </label>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            if (e.target.value !== selectedOrder.status) {
                              updateOrderStatus(selectedOrder.id, e.target.value);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
                        >
                          {Object.keys(statusConfig).map(status => (
                            <option key={status} value={status}>
                              {statusConfig[status].label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Quick Status Actions */}
                      {getNextStatus(selectedOrder.status) && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status))}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                        >
                          {React.createElement(statusConfig[getNextStatus(selectedOrder.status)]?.icon || CheckCircle, { className: 'h-3.5 w-3.5' })}
                          {t('customer_orders.mark_as') || 'Mark as'} {statusConfig[getNextStatus(selectedOrder.status)]?.label}
                        </button>
                      )}
                      
                      {/* Payment Status */}
                      {selectedOrder.payment_status === 'unpaid' && (
                        <button
                          onClick={() => updatePaymentStatus(selectedOrder.id, 'paid')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {t('customer_orders.mark_paid') || 'Mark Paid'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-white/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-slate-800 dark:text-white">
                            {selectedOrder.customer_name || 'Unknown Customer'}
                          </div>
                          <div className="text-[10px] text-slate-500">Customer</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-slate-800 dark:text-white">
                            {selectedOrder.customer_phone || '—'}
                          </div>
                          <div className="text-[10px] text-slate-500">Phone</div>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          {editingAddress ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={selectedOrder.delivery_address1 || ''}
                                onChange={(e) => {
                                  setSelectedOrder({ ...selectedOrder, delivery_address1: e.target.value });
                                }}
                                disabled={updatingAddress}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                                placeholder={t('customer_orders.address_placeholder') || 'Enter delivery address...'}
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateOrderAddress(selectedOrder.id, selectedOrder.delivery_address1)}
                                  disabled={updatingAddress}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                  {updatingAddress ? '...' : t('common.save') || 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingAddress(false);
                                    fetchOrders(true);
                                  }}
                                  disabled={updatingAddress}
                                  className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50 transition-colors"
                                >
                                  {t('common.cancel') || 'Cancel'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="flex-1">
                                <div className="text-xs font-medium text-slate-800 dark:text-white">
                                  {selectedOrder.delivery_address1 || t('customer_orders.no_address') || 'No address'}
                                </div>
                                <div className="text-[10px] text-slate-500">Delivery Address</div>
                              </div>
                              <button
                                onClick={() => setEditingAddress(true)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-opacity"
                                title={t('customer_orders.edit_address') || 'Edit address'}
                              >
                                <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Location Served */}
                      <div className="col-span-2 flex items-start gap-2">
                        <Truck className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          {editingLocation ? (
                            <div className="space-y-1">
                              <select
                                value={selectedOrder.location_serv || ''}
                                onChange={(e) => {
                                  const newLocation = e.target.value;
                                  setSelectedOrder({ ...selectedOrder, location_serv: newLocation });
                                }}
                                disabled={updatingLocation}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                              >
                                <option value="">{t('customer_orders.no_location') || 'No location'}</option>
                                {locations.map(loc => (
                                  <option 
                                    key={loc.id || loc.locations_qa_id} 
                                    value={language === 'ar' ? (loc.name_ar || loc.location_ar || loc.name_en || loc.location_en) : (loc.name_en || loc.location_en || loc.name_ar || loc.location_ar)}
                                  >
                                    {language === 'ar' ? (loc.name_ar || loc.location_ar || loc.name_en || loc.location_en) : (loc.name_en || loc.location_en || loc.name_ar || loc.location_ar)}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateOrderLocation(selectedOrder.id, selectedOrder.location_serv)}
                                  disabled={updatingLocation}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                  {updatingLocation ? '...' : t('common.save') || 'Save'}
                                </button>
                              <button
                                onClick={() => {
                                  // Reset to original value
                                  if (selectedOrder && originalLocation !== null) {
                                    setSelectedOrder({ ...selectedOrder, location_serv: originalLocation });
                                  }
                                  setEditingLocation(false);
                                  setOriginalLocation(null);
                                }}
                                disabled={updatingLocation}
                                className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50 transition-colors"
                              >
                                {t('common.cancel') || 'Cancel'}
                              </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div>
                                <div className="text-xs font-medium text-slate-800 dark:text-white">
                                  {selectedOrder.location_serv || t('customer_orders.no_location') || 'No location'}
                                </div>
                                <div className="text-[10px] text-slate-500">{t('customer_orders.served_from_location') || 'Served From Location'}</div>
                              </div>
                              <button
                                onClick={() => {
                                  setOriginalLocation(selectedOrder.location_serv || null);
                                  setEditingLocation(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-opacity"
                                title={t('customer_orders.edit_location') || 'Edit location'}
                              >
                                <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-white">
                          Items ({orderDetails.length})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (!selectedOrder?.location_serv) {
                            setError(t('make_order.select_location_first') || 'Order must have a "Served From Location" set first');
                            setTimeout(() => setError(''), 3000);
                            return;
                          }
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
                        <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
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
                            
                            {/* Product Search */}
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
                                className="w-full px-2 py-1.5 text-[10px] rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              
                              {/* Product Dropdown */}
                              <AnimatePresence>
                                {showProductDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl max-h-[300px] overflow-y-auto"
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

                            {/* Item Details */}
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
                                      className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                                      className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                                      className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-emerald-700 dark:text-emerald-400 mb-0.5">Line Total</label>
                                    <div className="w-full px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-slate-900 dark:text-white text-xs font-semibold">
                                      {formatCurrency(
                                        (parseFloat(newItem.qty) || 0) * (parseFloat(newItem.unit_price) || 0) - (parseFloat(newItem.discount) || 0) + (parseFloat(newItem.tax_amount) || 0),
                                        selectedOrder?.currency || 'EGP'
                                      )}
                                    </div>
                                  </div>
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
                          const isUpdating = updatingItems[item.id];
                          const editValues = itemEditValues[item.id] || {
                            qty: item.qty,
                            unit_price: item.unit_price,
                            discount: item.discount || 0
                          };
                          
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                                  {item.product_name || 'Unnamed Product'}
                                </div>
                                {isEditing ? (
                                  <div className="mt-1 space-y-1">
                                    <div className="flex items-center gap-1">
                                      <label className="text-[10px] text-slate-500 w-8">Qty:</label>
                                      <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={editValues.qty}
                                        onChange={(e) => setItemEditValues({ ...itemEditValues, [item.id]: { ...editValues, qty: e.target.value } })}
                                        disabled={isUpdating}
                                        className="flex-1 px-1.5 py-0.5 text-[10px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <label className="text-[10px] text-slate-500 w-8">Price:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editValues.unit_price}
                                        onChange={(e) => setItemEditValues({ ...itemEditValues, [item.id]: { ...editValues, unit_price: e.target.value } })}
                                        disabled={isUpdating}
                                        className="flex-1 px-1.5 py-0.5 text-[10px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <label className="text-[10px] text-slate-500 w-8">Disc:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editValues.discount}
                                        onChange={(e) => setItemEditValues({ ...itemEditValues, [item.id]: { ...editValues, discount: e.target.value } })}
                                        disabled={isUpdating}
                                        className="flex-1 px-1.5 py-0.5 text-[10px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <button
                                        onClick={() => updateOrderItem(selectedOrder.id, item.id, {
                                          qty: editValues.qty,
                                          unit_price: editValues.unit_price,
                                          discount: editValues.discount,
                                          tax_amount: item.tax_amount || 0
                                        })}
                                        disabled={isUpdating}
                                        className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                      >
                                        {isUpdating ? '...' : t('common.save') || 'Save'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingItems({ ...editingItems, [item.id]: false });
                                          setItemEditValues({ ...itemEditValues, [item.id]: undefined });
                                        }}
                                        disabled={isUpdating}
                                        className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50 transition-colors"
                                      >
                                        {t('common.cancel') || 'Cancel'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-500">
                                    {parseFloat(item.qty)} × {formatCurrency(item.unit_price)}
                                    {parseFloat(item.discount) > 0 && (
                                      <span className="text-emerald-600 ml-1">-{formatCurrency(item.discount)}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-semibold text-slate-800 dark:text-white">
                                  {formatCurrency(item.line_total)}
                                </div>
                                {!isEditing && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setEditingItems({ ...editingItems, [item.id]: true });
                                        setItemEditValues({ ...itemEditValues, [item.id]: {
                                          qty: item.qty,
                                          unit_price: item.unit_price,
                                          discount: item.discount || 0
                                        }});
                                      }}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                      title={t('customer_orders.edit_item') || 'Edit item'}
                                    >
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    {orderDetails.length > 1 && (
                                      <button
                                        onClick={() => removeOrderItem(selectedOrder.id, item.id)}
                                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        title={t('customer_orders.remove_item') || 'Remove item'}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex-shrink-0 px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                      </div>
                      {parseFloat(selectedOrder.discount_total) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(selectedOrder.discount_total, selectedOrder.currency)}</span>
                        </div>
                      )}
                      {parseFloat(selectedOrder.tax_total) > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Tax</span>
                          <span>{formatCurrency(selectedOrder.tax_total, selectedOrder.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Delivery</span>
                        <span>{formatCurrency(selectedOrder.delivery_fee, selectedOrder.currency)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-white">
                        <span>Total</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-base">
                          {formatCurrency(selectedOrder.grand_total, selectedOrder.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {selectedOrder.payment_method || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatFullDate(selectedOrder.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Detail Modal */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedOrder(null)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-[#12121a] rounded-t-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Mobile Detail Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
                        #{selectedOrder.order_no}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusConfig[selectedOrder.status]?.color}`}>
                        {statusConfig[selectedOrder.status]?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Content */}
                  <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-4 space-y-4">
                    {/* Customer */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-800 dark:text-white">
                          {selectedOrder.customer_name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {selectedOrder.customer_phone || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {orderDetails.map((item) => (
                        <div key={item.id} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                          <div>
                            <div className="text-xs font-medium text-slate-800 dark:text-white">{item.product_name}</div>
                            <div className="text-[10px] text-slate-500">{item.qty} × {formatCurrency(item.unit_price)}</div>
                          </div>
                          <div className="text-xs font-semibold">{formatCurrency(item.line_total)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(selectedOrder.grand_total, selectedOrder.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t('customer_orders.status') || 'Status:'}
                      </label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          if (e.target.value !== selectedOrder.status) {
                            updateOrderStatus(selectedOrder.id, e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.keys(statusConfig).map(status => (
                          <option key={status} value={status}>
                            {statusConfig[status].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      {getNextStatus(selectedOrder.status) && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status))}
                          className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                        >
                          {t('customer_orders.mark_as') || 'Mark as'} {statusConfig[getNextStatus(selectedOrder.status)]?.label}
                        </button>
                      )}
                      {selectedOrder.payment_status === 'unpaid' && (
                        <button
                          onClick={() => updatePaymentStatus(selectedOrder.id, 'paid')}
                          className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium"
                        >
                          {t('customer_orders.mark_paid') || 'Mark Paid'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CustomerOrders;
