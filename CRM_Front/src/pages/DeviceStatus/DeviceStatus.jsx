import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GlassCard } from '../../components/ratings/NovaKitComponents';
import { locationsQaService } from '../../lib/locationsQaService';
import { 
  Smartphone, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Filter, 
  X, 
  Clock,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';

const DeviceStatus = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    branch: '',
    status: '', // 'all', 'online', 'offline'
  });
  const [pinging, setPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterKey, setFilterKey] = useState(0);

  const hasPrivilegeCheck = (required) =>
    authData?.privilege_ids?.some((id) => required.includes(id)) || false;

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!authData?.org_id || !hasPrivilege) return;
      try {
        const locations = await locationsQaService.getLocations(authData.org_id);
        const uniqueBranches = Array.from(
          new Set(locations.map((loc) => loc.location_en || loc.location_ar || '').filter(Boolean))
        ).sort();
        setBranches(uniqueBranches);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    if (hasPrivilege && authData?.org_id) {
      fetchBranches();
    }
  }, [authData, hasPrivilege]);

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setHasPrivilege(false);
      setError('No permission to view device status');
      setLoading(false);
      return;
    }

    const allowed = hasPrivilegeCheck([5000, 1]);
    setHasPrivilege(allowed);
    if (!allowed) {
      setError('No permission to view device status');
      setLoading(false);
      return;
    }
    fetchDeviceStatus();
  }, [authData, authLoading, filters.branch, filters.status, filterKey]);

  // Auto-refresh every 15 seconds if enabled (reduced from 30s for more real-time updates)
  useEffect(() => {
    if (!autoRefresh || !hasPrivilege) return;
    
    const interval = setInterval(() => {
      fetchDeviceStatus();
    }, 15000); // 15 seconds - more frequent updates for better real-time status

    return () => clearInterval(interval);
  }, [autoRefresh, hasPrivilege, filters.branch, filters.status]);

  const fetchDeviceStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in.');
      }

      const url = new URL(`${API_URL}/api/devices/status`);
      url.searchParams.append('org_id', authData.org_id);
      if (filters.branch) {
        url.searchParams.append('branch', filters.branch);
      }

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
              throw new Error(`Failed to fetch device status: ${retryResponse.status}`);
            }
            const retryData = await retryResponse.json();
            filterAndSetDevices(retryData.data || []);
            return;
          }
        }
        throw new Error('Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch device status: ${response.status}`);
      }

      const data = await response.json();
      filterAndSetDevices(data.data || []);
    } catch (err) {
      console.error('Error fetching device status:', err);
      setError(err.message || 'Failed to load device status');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSetDevices = (deviceList) => {
    let filtered = [...deviceList];
    
    if (filters.status === 'online') {
      filtered = filtered.filter(d => d.is_online);
    } else if (filters.status === 'offline') {
      filtered = filtered.filter(d => !d.is_online);
    }
    
    setDevices(filtered);
  };

  const handlePing = async (userId = null) => {
    if (!authData?.org_id) {
      setPingMessage('Error: Organization ID not found');
      return;
    }

    setPinging(true);
    setPingMessage('');

    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/devices/ping`, {
        method: 'POST',
        headers: {
          'x-access-tokens': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_id: authData.org_id,
          user_id: userId || undefined,
          branch: filters.branch || undefined,
        }),
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
            const retryResponse = await fetch(`${API_URL}/api/devices/ping`, {
              method: 'POST',
              headers: {
                'x-access-tokens': access_token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                org_id: authData.org_id,
                user_id: userId || undefined,
                branch: filters.branch || undefined,
              }),
            });

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json();
              throw new Error(errorData.error || `Failed to ping: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            setPingMessage(`✅ Ping sent to ${retryData.sent} device(s) successfully!`);
            setTimeout(() => {
              fetchDeviceStatus(); // Refresh status after ping
            }, 2000);
            return;
          }
        }
        throw new Error('Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ping: ${response.status}`);
      }

      const data = await response.json();
      setPingMessage(`✅ Ping sent to ${data.sent} device(s) successfully!`);
      
      // Refresh status after ping - wait longer for devices to respond
      // First refresh after 3 seconds, then again after 8 seconds to catch late responses
      setTimeout(() => {
        fetchDeviceStatus();
      }, 3000);
      setTimeout(() => {
        fetchDeviceStatus();
      }, 8000);
      
      // Clear message after 5 seconds
      setTimeout(() => setPingMessage(''), 5000);
    } catch (err) {
      console.error('Error pinging devices:', err);
      setPingMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setPingMessage(''), 5000);
    } finally {
      setPinging(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Never';
    }
  };

  if (loading && !hasPrivilege) {
    return <LoadingSpinner />;
  }

  if (!hasPrivilege) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 p-6">
            <GlassCard className="p-6">
              <p className="text-red-500">{error}</p>
            </GlassCard>
          </main>
        </div>
      </div>
    );
  }

  const onlineCount = devices.filter(d => d.is_online).length;
  const offlineCount = devices.filter(d => !d.is_online).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6">
          {/* Glowy gradient backdrop */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute left-1/2 top-[-12rem] -translate-x-1/2 transform">
              <div className="aspect-[1108/632] w-[72rem] bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/20 to-cyan-400/20 dark:from-[#ff80b5] dark:to-[#9089fc] opacity-30 dark:opacity-20 blur-3xl" />
            </div>
          </div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <GlassCard className="relative overflow-hidden p-6">
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-3xl" />
              <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Device Status
                      </h1>
                      <p className="text-gray-600 dark:text-white/70 mt-1">
                        Monitor mobile device online status and last activity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        autoRefresh
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {autoRefresh ? '🟢 Auto Refresh ON' : '⚪ Auto Refresh OFF'}
                    </button>
                    <button
                      onClick={fetchDeviceStatus}
                      disabled={loading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <GlassCard className="p-4 border-red-500/50 dark:border-red-500/50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-1">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
                </div>
                <Smartphone className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-1">Online</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{onlineCount}</p>
                </div>
                <Wifi className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-1">Offline</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{offlineCount}</p>
                </div>
                <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Filters and Ping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-700 dark:text-white/70" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters & Actions
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <MapPin className="h-4 w-4" />
                    Branch
                  </label>
                  <select
                    value={filters.branch}
                    onChange={(e) => {
                      setFilters({ ...filters, branch: e.target.value });
                      setFilterKey(prev => prev + 1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch} className="bg-white dark:bg-gray-900">
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Wifi className="h-4 w-4" />
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      setFilterKey(prev => prev + 1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">All Status</option>
                    <option value="online" className="bg-white dark:bg-gray-900">Online Only</option>
                    <option value="offline" className="bg-white dark:bg-gray-900">Offline Only</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handlePing()}
                    disabled={pinging}
                    className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Send className={`h-4 w-4 ${pinging ? 'animate-pulse' : ''}`} />
                    {pinging ? 'Checking...' : 'Check Online Devices'}
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({ branch: '', status: '' });
                      setFilterKey(prev => prev + 1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all shadow-lg font-semibold"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Reset Filters
                  </button>
                </div>
              </div>
              {pingMessage && (
                <div className="mt-4 p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <p className={`text-sm font-medium ${
                    pingMessage.startsWith('✅') 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {pingMessage}
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Devices List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : devices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="p-8 text-center">
                <Smartphone className="h-12 w-12 text-gray-400 dark:text-white/40 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-white/70 text-lg">
                  No devices found
                </p>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device, index) => (
                <motion.div
                  key={device.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <GlassCard className="p-5 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            device.is_online 
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                              : 'bg-red-500/20 text-red-600 dark:text-red-400'
                          }`}>
                            {device.is_online ? (
                              <Wifi className="h-5 w-5" />
                            ) : (
                              <WifiOff className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {device.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-white/50">
                              {device.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 mb-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{device.branch}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        device.is_online
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {device.is_online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
                        <Clock className="h-4 w-4" />
                        <span>
                          {device.last_heartbeat ? 'Last Heartbeat' : 'Last Active'}: {device.time_ago}
                        </span>
                      </div>
                      {device.last_heartbeat && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Heartbeat: {formatDate(device.last_heartbeat)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-white/50">
                        Active: {formatDate(device.last_active)}
                      </div>
                      {device.fcm_token && (
                        <div className="text-xs text-gray-500 dark:text-white/50 font-mono">
                          Token: {device.fcm_token}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handlePing(device.user_id)}
                      disabled={pinging}
                      className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Ping Device
                    </button>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeviceStatus;

