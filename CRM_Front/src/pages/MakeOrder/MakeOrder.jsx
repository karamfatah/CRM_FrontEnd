import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShoppingCart, Plus, Trash2, Phone, User, MapPin, CreditCard,
  FileText, Package, DollarSign, CheckCircle, AlertCircle,
  X, Save, RefreshCcw, Truck, Search, UserPlus, Users,
  Mail, Building, ChevronRight, Store, FolderTree
} from 'lucide-react';
import { sectionQaService } from '../../lib/sectionQaService';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

const MakeOrder = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  // Customer selection state
  const [customerMode, setCustomerMode] = useState(null); // null | 'existing' | 'new'
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isRegisteringCustomer, setIsRegisteringCustomer] = useState(false);

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    phone: '',
    name: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });

  // Locations state
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  
  // Sections state
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [manualDeliveryFee, setManualDeliveryFee] = useState(false);

  // Products catalog state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(null); // item id or null

  // Product filters state
  const [productFilters, setProductFilters] = useState({
    brand_id: '',
    depart_id: '',
    category_id: '',
  });

  // Filter options state
  const [brands, setBrands] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Inventory state for selected location
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    customer_phone: '',
    customer_name: '',
    delivery_address1: '',
    location_serv: '',
    location_qa_id: '', // Store the location ID for fetching sections
    section_id: '',
    payment_method: 'cash',
    notes: '',
    delivery_fee: 0,
    currency: 'EGP',
  });

  // Order items state
  const [items, setItems] = useState([
    { id: 1, product_id: '', product_name: '', sku: '', qty: 1, unit_price: 0, discount: 0, tax_amount: 0 }
  ]);

  const paymentMethods = [
    { value: 'cash', label: t('make_order.cash') },
    { value: 'card', label: t('make_order.card') },
    { value: 'wallet', label: t('make_order.wallet') },
    { value: 'online', label: t('make_order.online') },
  ];

  const currencies = ['EGP', 'USD', 'SAR', 'AED', 'EUR'];

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');

  // Fetch products catalog
  const fetchProducts = useCallback(async (searchTerm = '') => {
    if (!authData?.access_token) return;
    
    setProductsLoading(true);
    try {
      const orgId = authData?.org_id || 1;
      const params = new URLSearchParams({
        org_id: orgId.toString(),
        is_active: 'true',
        per_page: '100', // Increased to show more filtered results
      });
      if (searchTerm) params.append('search', searchTerm);
      if (productFilters.brand_id) params.append('brand_id', productFilters.brand_id);
      if (productFilters.category_id) params.append('category_id', productFilters.category_id);
      
      const response = await fetch(
        `${API_URL}/api/products?${params}`,
        { headers: { 'x-access-tokens': getToken() } }
      );
      
      if (response.ok) {
        const data = await response.json();
        let filteredData = data.data || [];
        
        // Additional client-side filtering for department (via category)
        // Use ref to access current categories without causing dependency issues
        if (productFilters.depart_id && categoriesRef.current.length > 0) {
          const categoryIds = categoriesRef.current
            .filter(cat => cat.depart_id?.toString() === productFilters.depart_id)
            .map(cat => cat.id);
          if (categoryIds.length > 0) {
            filteredData = filteredData.filter(p => 
              categoryIds.includes(p.category_id)
            );
          } else {
            filteredData = []; // No categories in this department
          }
        }
        
        setProducts(filteredData);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, [authData?.access_token, authData?.org_id, productFilters.brand_id, productFilters.category_id, productFilters.depart_id]);

  // Fetch sections based on location_qa_id
  const fetchSections = useCallback(async (locationQaId) => {
    if (!locationQaId || !authData?.org_id) {
      setSections([]);
      return;
    }

    setSectionsLoading(true);
    try {
      const data = await sectionQaService.getSections(authData.org_id, locationQaId);
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  }, [authData?.org_id]);

  // Fetch filter options (brands, departments, categories)
  const fetchFilterOptions = useCallback(async () => {
    if (!authData?.access_token) return;
    
    setFiltersLoading(true);
    try {
      const orgId = authData?.org_id || 1;
      const headers = { 'x-access-tokens': getToken() };
      
      const [brandsRes, departmentsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/brands?org_id=${orgId}&is_active=true`, { headers }),
        fetch(`${API_URL}/api/departments?org_id=${orgId}`, { headers }),
        fetch(`${API_URL}/api/categories?org_id=${orgId}&include_children=true`, { headers }),
      ]);
      
      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.data || []);
      }
      
      if (departmentsRes.ok) {
        const data = await departmentsRes.json();
        setDepartments(data.data || []);
      }
      
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        // Flatten categories tree for dropdown
        const flatten = (items) => {
          let result = [];
          for (const item of items) {
            result.push(item);
            if (item.children?.length) {
              result = result.concat(flatten(item.children));
            }
          }
          return result;
        };
        setCategories(flatten(data.data || []));
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    } finally {
      setFiltersLoading(false);
    }
  }, [authData?.access_token, authData?.org_id]);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      if (!authData?.org_id) return;
      
      setLocationsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/locations_qa?org_id=${authData.org_id}`,
          {
            headers: {
              'x-access-tokens': getToken(),
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

    fetchLocations();
    fetchFilterOptions();
  }, [authData?.org_id, fetchFilterOptions]);

  // Fetch products when filters change (not when categories change to avoid loop)
  useEffect(() => {
    if (authData?.access_token) {
      fetchProducts(productSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData?.access_token, productFilters.brand_id, productFilters.category_id, productFilters.depart_id]);

  // Fetch inventory when location changes
  const fetchInventory = useCallback(async (locationId) => {
    if (!locationId || !authData?.access_token) {
      setInventory([]);
      return;
    }

    setInventoryLoading(true);
    try {
      const orgId = authData?.org_id || 1;
      const response = await fetch(
        `${API_URL}/api/inventory?org_id=${orgId}&location_id=${locationId}`,
        { headers: { 'x-access-tokens': getToken() } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setInventory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [authData?.access_token, authData?.org_id]);

  // Fetch sections and inventory when location changes
  useEffect(() => {
    if (orderForm.location_qa_id) {
      fetchSections(orderForm.location_qa_id);
      fetchInventory(orderForm.location_qa_id);
    } else {
      setSections([]);
      setInventory([]);
      handleFormChange('section_id', '');
    }
  }, [orderForm.location_qa_id, fetchSections, fetchInventory]);

  // Search for customers
  const searchCustomers = useCallback(async (phone) => {
    if (!phone || phone.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const orgId = authData?.org_id || 1;
      const response = await fetch(
        `${API_URL}/api/customer-orders/customers/search?phone=${encodeURIComponent(phone)}&org_id=${orgId}`,
        {
          headers: {
            'x-access-tokens': getToken(),
          },
        }
      );
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [authData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerMode === 'existing' && searchPhone) {
        searchCustomers(searchPhone);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchPhone, customerMode, searchCustomers]);

  // Select an existing customer
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOrderForm(prev => ({
      ...prev,
      customer_phone: customer.phone,
      customer_name: customer.name || '',
      delivery_address1: customer.address || '',
    }));
    setSearchPhone('');
    setSearchResults([]);
  };

  // Register new customer
  const handleRegisterCustomer = async () => {
    if (!newCustomer.phone.trim()) {
      setError(t('make_order.error_phone_required'));
      return;
    }

    setIsRegisteringCustomer(true);
    setError('');

    try {
      const orgId = authData?.org_id || 1;
      const response = await fetch(`${API_URL}/api/customer-orders/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': getToken(),
        },
        body: JSON.stringify({
          org_id: orgId,
          ...newCustomer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(t('make_order.error_customer_exists'));
        } else {
          throw new Error(data.error || t('make_order.error_register_failed'));
        }
        return;
      }

      // Set the newly created customer as selected
      setSelectedCustomer(data.data);
      setOrderForm(prev => ({
        ...prev,
        customer_phone: data.data.phone,
        customer_name: data.data.name || '',
        delivery_address1: data.data.address || '',
      }));
      setSuccess(t('make_order.customer_registered'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Register customer error:', err);
      setError(err.message);
    } finally {
      setIsRegisteringCustomer(false);
    }
  };

  const handleFormChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewCustomerChange = (field, value) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Get inventory info for a product
  const getProductInventory = (productId) => {
    return inventory.find(inv => inv.item_id?.toString() === productId?.toString());
  };

  // Check if product can be added (must exist in inventory for selected location)
  const canAddProduct = (product) => {
    if (!orderForm.location_qa_id) return false; // Location must be selected
    
    const inv = getProductInventory(product.id);
    if (!inv) return false; // Product must exist in inventory for this location
    
    // If qty is 0 and allow_zero_qty is false, cannot add
    if (parseFloat(inv.qty) === 0 && !inv.allow_zero_qty) {
      return false;
    }
    
    return true;
  };

  // Handle product selection from catalog
  const handleSelectProduct = (itemId, product) => {
    // Check if location is selected
    if (!orderForm.location_qa_id) {
      setError(t('make_order.select_location_first') || 'Please select "Will be served from Location" first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check inventory
    if (!canAddProduct(product)) {
      setError(t('make_order.product_zero_qty') || `Unable to add to order - 0 qty at location`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            product_id: product.id.toString(),
            product_name: language === 'ar' && product.name_ar ? product.name_ar : product.name_en,
            sku: product.sku || '',
            qty: 1,
            unit_price: parseFloat(product.unit_price) || 0,
            tax_amount: (parseFloat(product.unit_price) || 0) * (parseFloat(product.tax_rate) || 0) / 100,
          } 
        : item
    ));
    setShowProductDropdown(null);
    setProductSearch('');
  };

  // Filter products based on search and inventory
  const filteredProducts = products.filter(p => {
    // If location is selected, only show products that exist in inventory for that location
    if (orderForm.location_qa_id && inventory.length > 0) {
      const inv = getProductInventory(p.id);
      if (!inv) return false; // Product not in inventory for this location
      // Show all products in inventory (even with 0 qty) - selection will be disabled by canAddProduct
    }
    
    // Search filter
    if (productSearch) {
      const search = productSearch.toLowerCase();
      const matchesSearch = (
        p.name_en?.toLowerCase().includes(search) ||
        p.name_ar?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.barcode?.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
    }
    
    // Additional client-side filters (backup, main filtering is done server-side)
    // These are already applied in fetchProducts, but kept here for consistency
    
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...productFilters, [filterName]: value };
    
    // If department changes, reset category filter
    if (filterName === 'depart_id') {
      newFilters.category_id = '';
    }
    
    setProductFilters(newFilters);
    // Products will be refetched automatically via useEffect when filters change
  };

  // Reset filters
  const resetFilters = () => {
    setProductFilters({ brand_id: '', depart_id: '', category_id: '' });
    // Products will be refetched automatically via useEffect when filters change
  };

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems(prev => [...prev, {
      id: newId,
      product_id: '',
      product_name: '',
      sku: '',
      qty: 1,
      unit_price: 0,
      discount: 0,
      tax_amount: 0
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateLineTotal = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const tax = parseFloat(item.tax_amount) || 0;
    return (qty * price) - discount + tax;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const calculateDiscountTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
  };

  const calculateTaxTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discounts = calculateDiscountTotal();
    const taxes = calculateTaxTotal();
    const delivery = parseFloat(orderForm.delivery_fee) || 0;
    return subtotal - discounts + taxes + delivery;
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `${num.toFixed(2)} ${orderForm.currency}`;
  };

  const resetForm = () => {
    setCustomerMode(null);
    setSelectedCustomer(null);
    setSearchPhone('');
    setSearchResults([]);
    setNewCustomer({
      phone: '',
      name: '',
      email: '',
      address: '',
      city: '',
      notes: '',
    });
    setOrderForm({
      customer_phone: '',
      customer_name: '',
      delivery_address1: '',
      location_serv: '',
      payment_method: 'cash',
      notes: '',
      delivery_fee: 10,
      currency: 'EGP',
    });
    setItems([
      { id: 1, product_id: '', product_name: '', sku: '', qty: 1, unit_price: 0, discount: 0, tax_amount: 0 }
    ]);
    setError('');
    setSuccess('');
    setCreatedOrder(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatedOrder(null);

    // Validation
    if (!selectedCustomer && !orderForm.customer_phone.trim()) {
      setError(t('make_order.error_select_customer'));
      return;
    }

    const validItems = items.filter(item => 
      item.product_name.trim() && parseFloat(item.qty) > 0
    );

    if (validItems.length === 0) {
      setError(t('make_order.error_items_required'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        org_id: authData?.org_id || 1,
        customer_id: selectedCustomer?.id || null,
        customer_phone: orderForm.customer_phone,
        customer_name: orderForm.customer_name || 'Customer',
        delivery_address1: orderForm.delivery_address1,
        location_serv: orderForm.location_serv || null,
        payment_method: orderForm.payment_method,
        notes: orderForm.notes,
        delivery_fee: parseFloat(orderForm.delivery_fee) || 0,
        currency: orderForm.currency,
        items: validItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          qty: parseFloat(item.qty) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          discount: parseFloat(item.discount) || 0,
          tax_amount: parseFloat(item.tax_amount) || 0,
        }))
      };

      const response = await fetch(`${API_URL}/api/customer-orders/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': getToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('make_order.error_create_failed'));
      }

      setSuccess(t('make_order.success_created'));
      setCreatedOrder(data.data);
    } catch (err) {
      console.error('Create order error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {t('make_order.title')}
                </h1>
                <p className="text-gray-600 dark:text-white/70 text-sm">
                  {t('make_order.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors font-semibold text-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              {t('make_order.reset')}
            </button>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {success && createdOrder && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-lg">{success}</h3>
                      <p className="text-sm opacity-90 mt-1">
                        {t('make_order.order_no')}: <span className="font-mono font-bold">{createdOrder.order_no}</span>
                      </p>
                      <p className="text-sm opacity-90">
                        {t('make_order.grand_total')}: <span className="font-bold">{formatCurrency(createdOrder.grand_total)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSuccess(''); setCreatedOrder(null); }}
                    className="p-1 rounded-full hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg bg-white text-emerald-600 font-semibold text-sm hover:bg-white/90"
                  >
                    {t('make_order.create_another')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success for customer registration */}
          <AnimatePresence>
            {success && !createdOrder && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-green-600 dark:text-green-400 font-medium">{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="ml-auto p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Customer Selection */}
          {!selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  {t('make_order.step1_customer')}
                </h2>

                {/* Customer Mode Selection */}
                {!customerMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setCustomerMode('existing')}
                      className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <Users className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 dark:text-white">{t('make_order.existing_customer')}</h3>
                          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">{t('make_order.search_by_phone')}</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setCustomerMode('new')}
                      className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                          <UserPlus className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 dark:text-white">{t('make_order.new_customer')}</h3>
                          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">{t('make_order.register_first')}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Existing Customer Search */}
                {customerMode === 'existing' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => { setCustomerMode(null); setSearchPhone(''); setSearchResults([]); }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        ← {t('make_order.back')}
                      </button>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                            placeholder={t('make_order.search_phone_placeholder')}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                            dir="ltr"
                            autoFocus
                          />
                          {searchLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="h-5 w-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="mt-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] shadow-lg overflow-hidden">
                          {searchResults.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => handleSelectCustomer(customer)}
                              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <User className="h-6 w-6" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {customer.name || t('make_order.unknown_customer')}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-white/60 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                                {customer.address && (
                                  <div className="text-sm text-gray-400 dark:text-white/40 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {customer.address.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      )}

                      {searchPhone.length >= 3 && !searchLoading && searchResults.length === 0 && (
                        <div className="mt-3 p-4 text-center text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-white/5 rounded-lg">
                          <p>{t('make_order.no_customers_found')}</p>
                          <button
                            onClick={() => {
                              setCustomerMode('new');
                              setNewCustomer(prev => ({ ...prev, phone: searchPhone }));
                            }}
                            className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                          >
                            {t('make_order.register_this_number')}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* New Customer Registration */}
                {customerMode === 'new' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => { setCustomerMode(null); setNewCustomer({ phone: '', name: '', email: '', address: '', city: '', notes: '' }); }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        ← {t('make_order.back')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <Phone className="h-4 w-4 inline mr-1" />
                          {t('make_order.phone')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCustomer.phone}
                          onChange={(e) => handleNewCustomerChange('phone', e.target.value)}
                          placeholder={t('make_order.phone_placeholder')}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          dir="ltr"
                        />
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <User className="h-4 w-4 inline mr-1" />
                          {t('make_order.name')}
                        </label>
                        <input
                          type="text"
                          value={newCustomer.name}
                          onChange={(e) => handleNewCustomerChange('name', e.target.value)}
                          placeholder={t('make_order.name_placeholder')}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <Mail className="h-4 w-4 inline mr-1" />
                          {t('make_order.email')}
                        </label>
                        <input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                          placeholder={t('make_order.email_placeholder')}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          dir="ltr"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <Building className="h-4 w-4 inline mr-1" />
                          {t('make_order.city')}
                        </label>
                        <input
                          type="text"
                          value={newCustomer.city}
                          onChange={(e) => handleNewCustomerChange('city', e.target.value)}
                          placeholder={t('make_order.city_placeholder')}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {t('make_order.address')}
                        </label>
                        <textarea
                          value={newCustomer.address}
                          onChange={(e) => handleNewCustomerChange('address', e.target.value)}
                          placeholder={t('make_order.address_placeholder')}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <FileText className="h-4 w-4 inline mr-1" />
                          {t('make_order.customer_notes')}
                        </label>
                        <textarea
                          value={newCustomer.notes}
                          onChange={(e) => handleNewCustomerChange('notes', e.target.value)}
                          placeholder={t('make_order.customer_notes_placeholder')}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleRegisterCustomer}
                        disabled={isRegisteringCustomer || !newCustomer.phone.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegisteringCustomer ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('make_order.registering')}
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            {t('make_order.register_customer')}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Selected Customer & Order Form */}
          {selectedCustomer && (
            <form onSubmit={handleSubmit}>
              {/* Selected Customer Card */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedCustomer.name || t('make_order.unknown_customer')}</h3>
                        <div className="flex items-center gap-4 text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedCustomer.phone}
                          </span>
                          {selectedCustomer.city && (
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {selectedCustomer.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerMode(null);
                        setOrderForm(prev => ({
                          ...prev,
                          customer_phone: '',
                          customer_name: '',
                          delivery_address1: '',
                        }));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
                    >
                      {t('make_order.change_customer')}
                    </button>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:col-span-1"
                >
                  <div className="p-5 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      {t('make_order.order_details')}
                    </h2>

                    <div className="space-y-4">
                      {/* Delivery Address */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {t('make_order.address')}
                        </label>
                        <textarea
                          value={orderForm.delivery_address1}
                          onChange={(e) => handleFormChange('delivery_address1', e.target.value)}
                          placeholder={t('make_order.address_placeholder')}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <CreditCard className="h-4 w-4 inline mr-1" />
                          {t('make_order.payment_method')}
                        </label>
                        <select
                          value={orderForm.payment_method}
                          onChange={(e) => handleFormChange('payment_method', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {paymentMethods.map(pm => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Currency */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          {t('make_order.currency')}
                        </label>
                        <select
                          value={orderForm.currency}
                          onChange={(e) => handleFormChange('currency', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {currencies.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Delivery Fee */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <Truck className="h-4 w-4 inline mr-1" />
                          {t('make_order.delivery_fee') || 'Delivery Fee'}
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id="manualDeliveryFee"
                              checked={manualDeliveryFee}
                              onChange={(e) => {
                                setManualDeliveryFee(e.target.checked);
                                if (!e.target.checked && orderForm.section_id) {
                                  // Restore delivery fee from section
                                  const selectedSection = sections.find(sec => sec.section_qa_id?.toString() === orderForm.section_id);
                                  if (selectedSection && selectedSection.deliveryCost !== null && selectedSection.deliveryCost !== undefined) {
                                    handleFormChange('delivery_fee', selectedSection.deliveryCost);
                                  } else {
                                    handleFormChange('delivery_fee', 0);
                                  }
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="manualDeliveryFee" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                              {t('make_order.manual_delivery_fee') || 'Set delivery fee manually'}
                            </label>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={orderForm.delivery_fee}
                            onChange={(e) => handleFormChange('delivery_fee', e.target.value)}
                            disabled={!manualDeliveryFee && orderForm.section_id}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="0.00"
                          />
                          {!manualDeliveryFee && orderForm.section_id && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('make_order.delivery_fee_from_section') || 'Delivery fee is set from selected section'}
                            </p>
                          )}
                          {manualDeliveryFee && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('make_order.manual_delivery_fee_hint') || 'You can enter a custom delivery fee'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Served From Location */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <Store className="h-4 w-4 inline mr-1" />
                          {t('make_order.served_from_location')}
                        </label>
                        <select
                          value={orderForm.location_qa_id}
                          onChange={(e) => {
                            const selectedLoc = locations.find(loc => (loc.locations_qa_id || loc.id)?.toString() === e.target.value);
                            handleFormChange('location_qa_id', e.target.value);
                            handleFormChange('location_serv', selectedLoc ? (language === 'ar' ? selectedLoc.name_ar || selectedLoc.location_ar : selectedLoc.name_en || selectedLoc.location_en) : '');
                            handleFormChange('section_id', ''); // Reset section when location changes
                            handleFormChange('delivery_fee', 0); // Reset delivery fee when location changes
                          }}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          disabled={locationsLoading}
                        >
                          <option value="">{t('make_order.select_location') || 'Select Location'} *</option>
                          {locations.map(loc => (
                            <option key={loc.locations_qa_id || loc.id} value={(loc.locations_qa_id || loc.id)?.toString()}>
                              {language === 'ar' ? (loc.name_ar || loc.location_ar || loc.name_en || loc.location_en) : (loc.name_en || loc.location_en || loc.name_ar || loc.location_ar)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Section */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <FolderTree className="h-4 w-4 inline mr-1" />
                          {t('make_order.section') || 'Section'}
                        </label>
                        <select
                          value={orderForm.section_id}
                          onChange={(e) => {
                            handleFormChange('section_id', e.target.value);
                            if (!manualDeliveryFee) {
                              const selectedSection = sections.find(sec => sec.section_qa_id?.toString() === e.target.value);
                              if (selectedSection && selectedSection.deliveryCost !== null && selectedSection.deliveryCost !== undefined) {
                                handleFormChange('delivery_fee', selectedSection.deliveryCost);
                              } else {
                                handleFormChange('delivery_fee', 0);
                              }
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          disabled={!orderForm.location_qa_id || sectionsLoading}
                        >
                          <option value="">{t('make_order.select_section') || 'Select Section'}</option>
                          {sectionsLoading ? (
                            <option disabled>{t('common.loading') || 'Loading...'}</option>
                          ) : sections.length === 0 && orderForm.location_qa_id ? (
                            <option disabled>{t('make_order.no_sections') || 'No sections available'}</option>
                          ) : (
                            sections.map(sec => (
                              <option key={sec.section_qa_id} value={sec.section_qa_id?.toString()}>
                                {language === 'ar' ? (sec.section_ar || sec.section_en) : (sec.section_en || sec.section_ar)}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                          <FileText className="h-4 w-4 inline mr-1" />
                          {t('make_order.notes')}
                        </label>
                        <textarea
                          value={orderForm.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          placeholder={t('make_order.notes_placeholder')}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Order Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2 flex flex-col"
                >
                  <div className="p-5 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg flex-1 flex flex-col min-h-[600px] max-h-[80vh]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        {t('make_order.order_items')}
                      </h2>
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-semibold"
                      >
                        <Plus className="h-4 w-4" />
                        {t('make_order.add_item')}
                      </button>
                    </div>

                    {/* Product Filters */}
                    <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          {t('make_order.filter_products') || 'Filter Products'}
                        </label>
                        {(productFilters.brand_id || productFilters.depart_id || productFilters.category_id) && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {t('make_order.reset_filters') || 'Reset'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* Department Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('make_order.department') || 'Department'}
                          </label>
                          <select
                            value={productFilters.depart_id}
                            onChange={(e) => handleFilterChange('depart_id', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">{t('make_order.all_departments') || 'All Departments'}</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {language === 'ar' && dept.name_ar ? dept.name_ar : dept.name_en}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('make_order.category') || 'Category'}
                          </label>
                          <select
                            value={productFilters.category_id}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                            disabled={!productFilters.depart_id}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {productFilters.depart_id 
                                ? (t('make_order.all_categories') || 'All Categories')
                                : (t('make_order.select_department_first') || 'Select Department First')}
                            </option>
                            {categories
                              .filter(cat => !productFilters.depart_id || cat.depart_id?.toString() === productFilters.depart_id)
                              .map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.parent_id ? '  ' : ''}
                                  {language === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Brand Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('make_order.brand') || 'Brand'}
                          </label>
                          <select
                            value={productFilters.brand_id}
                            onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">{t('make_order.all_brands') || 'All Brands'}</option>
                            {brands.map(brand => (
                              <option key={brand.id} value={brand.id}>
                                {language === 'ar' && brand.name_ar ? brand.name_ar : brand.name_en}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                      <div className="overflow-y-auto overflow-x-auto flex-1" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10 shadow-sm">
                            <tr className="border-b-2 border-gray-300 dark:border-white/20">
                              <th className="text-left py-3 px-3 text-gray-700 dark:text-white/90 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-slate-800" colSpan="2">{t('make_order.product')}</th>
                              <th className="text-center py-3 px-3 text-gray-700 dark:text-white/90 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-slate-800 w-20">{t('make_order.qty')}</th>
                              <th className="text-right py-3 px-3 text-gray-700 dark:text-white/90 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-slate-800 w-24">{t('make_order.price')}</th>
                              <th className="text-right py-3 px-3 text-gray-700 dark:text-white/90 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-slate-800 w-24">{t('make_order.discount')}</th>
                              <th className="text-right py-3 px-3 text-gray-700 dark:text-white/90 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-slate-800 w-28">{t('make_order.line_total')}</th>
                              <th className="w-12 bg-white dark:bg-slate-800"></th>
                            </tr>
                          </thead>
                          <tbody>
                          <AnimatePresence>
                            {items.map((item) => (
                              <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="border-b border-gray-100 dark:border-white/5"
                              >
                                <td className="py-3 px-3 relative" colSpan="2">
                                  <div className="relative">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={showProductDropdown === item.id ? productSearch : item.product_name}
                                        onChange={(e) => {
                                          setProductSearch(e.target.value);
                                          if (showProductDropdown !== item.id) {
                                            setShowProductDropdown(item.id);
                                          }
                                        }}
                                        onFocus={() => {
                                          if (!orderForm.location_qa_id) {
                                            setError(t('make_order.select_location_first') || 'Please select "Will be served from Location" first');
                                            setTimeout(() => setError(''), 3000);
                                            return;
                                          }
                                          setShowProductDropdown(item.id);
                                          setProductSearch('');
                                        }}
                                        onBlur={() => {
                                          // Delay to allow click on dropdown item before closing
                                          setTimeout(() => {
                                            setShowProductDropdown(null);
                                            setProductSearch('');
                                          }, 300);
                                        }}
                                        placeholder={orderForm.location_qa_id ? (t('make_order.search_product') || 'Search or select product...') : (t('make_order.select_location_first') || 'Select location first')}
                                        disabled={!orderForm.location_qa_id}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                      {item.sku && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                                          {item.sku}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Product Dropdown */}
                                    <AnimatePresence>
                                      {showProductDropdown === item.id && (
                                        <motion.div
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl max-h-[70vh] min-h-[300px] overflow-y-auto"
                                        >
                                          {productsLoading ? (
                                            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                              <RefreshCcw className="h-4 w-4 animate-spin inline mr-2" />
                                              {t('common.loading')}
                                            </div>
                                          ) : products.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                              <p>{t('make_order.no_products_in_catalog')}</p>
                                              <p className="text-xs mt-1">{t('make_order.add_products_first')}</p>
                                            </div>
                                          ) : filteredProducts.length === 0 ? (
                                            <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                                              {t('make_order.no_products_found')}
                                            </div>
                                          ) : (
                                            filteredProducts.slice(0, 20).map(product => {
                                              const inv = getProductInventory(product.id);
                                              const canAdd = canAddProduct(product);
                                              const isZeroQty = inv && parseFloat(inv.qty) === 0 && !inv.allow_zero_qty;
                                              
                                              return (
                                              <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => handleSelectProduct(item.id, product)}
                                                disabled={!canAdd}
                                                className={`w-full px-3 py-1.5 text-left flex items-center gap-3 border-b border-gray-100 dark:border-white/5 last:border-0 ${
                                                  canAdd 
                                                    ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer' 
                                                    : 'opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/10'
                                                }`}
                                              >
                                                {product.primary_image ? (
                                                  <img 
                                                    src={product.primary_image} 
                                                    alt="" 
                                                    className="w-8 h-8 rounded object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-8 h-8 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                    <Package className="h-4 w-4 text-gray-400" />
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                    {language === 'ar' && product.name_ar ? product.name_ar : product.name_en}
                                                  </p>
                                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {product.sku && <span className="mr-2">{product.sku}</span>}
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                      {parseFloat(product.unit_price || 0).toFixed(2)}
                                                    </span>
                                                    {inv && (
                                                      <span className={`ml-2 ${isZeroQty ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        • Qty: {parseFloat(inv.qty).toFixed(3)}
                                                      </span>
                                                    )}
                                                  </p>
                                                  {isZeroQty && (
                                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                                                      {t('make_order.unable_to_add_zero_qty') || 'Unable to add - 0 qty at location'}
                                                    </p>
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
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.discount}
                                    onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-right font-semibold text-gray-900 dark:text-white">
                                  <span className="text-base">{formatCurrency(calculateLineTotal(item))}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    disabled={items.length === 1}
                                    className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                      {/* Item count indicator */}
                      {items.length > 10 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10 text-xs text-center text-gray-500 dark:text-gray-400">
                          {items.length} {items.length === 1 ? t('make_order.item') : t('make_order.items')} • {t('make_order.scroll_to_see_all')}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>

                {/* Order Summary - Moved outside the items card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8"
                >
                  <div className="p-5 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                    <div className="flex justify-end">
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-white/70">{t('make_order.subtotal')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(calculateSubtotal())}</span>
                        </div>
                        {calculateDiscountTotal() > 0 && (
                          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>{t('make_order.discount_total')}</span>
                            <span>-{formatCurrency(calculateDiscountTotal())}</span>
                          </div>
                        )}
                        {calculateTaxTotal() > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-white/70">{t('make_order.tax_total')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(calculateTaxTotal())}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-white/70">{t('make_order.delivery')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(orderForm.delivery_fee)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-white/10">
                          <span className="font-bold text-gray-900 dark:text-white">{t('make_order.grand_total')}</span>
                          <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{formatCurrency(calculateGrandTotal())}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('make_order.creating')}
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            {t('make_order.create_order')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default MakeOrder;
