import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, Outlet } from 'react-router-dom';

// Simple API service
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3000/api';

// Simple auth hook
function useAuth() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
}

// Navigation items
const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: '🏠' },
  { name: 'Utilisateurs', href: '/users', icon: '👥' },
  { name: 'Messages', href: '/messages', icon: '💬' },
  { name: 'Opportunités', href: '/opportunities', icon: '🏢' },
  { name: 'Événements', href: '/events', icon: '📅' },
  { name: 'Ressources', href: '/resources', icon: '📚' },
];

// Layout with Sidebar
function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const wsUrl = import.meta.env.VITE_WS_URL ? `${import.meta.env.VITE_WS_URL}/notifications?token=${token}` : `ws://localhost:3000/notifications?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔗 WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          console.log('📢 New notification:', notification);
          
          // Add new notification to the list
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            });
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setWsConnected(false);
        // Try to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user]);

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.data.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition-transform`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <h1 className="ml-3 text-lg font-semibold text-gray-900">PME 360</h1>
            </div>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.profileType}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                PME 360 - Plateforme d'entraide
              </div>
              
              {/* WebSocket Status Indicator */}
              <div className="flex items-center text-xs text-gray-400">
                <div className={`w-2 h-2 rounded-full mr-1 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {wsConnected ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>

            {/* Notifications */}
            <div className="relative notifications-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Tout marquer lu
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="text-4xl mb-2">📭</div>
                        <p>Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Voir toutes les notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Users Page with API integration
function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        console.log('Users data:', data);
        
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erreur de chargement des utilisateurs');
        console.error('Users fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600">Découvrez et connectez-vous avec d'autres membres de PME 360</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Membres de la communauté ({users.length})
          </h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Inviter un membre
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{user.profileType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    user.profileType === 'STARTUP' ? 'bg-green-100 text-green-800' :
                    user.profileType === 'INVESTOR' ? 'bg-purple-100 text-purple-800' :
                    user.profileType === 'EXPERT' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.profileType}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                {user.companyName && (
                  <p className="text-sm font-medium text-gray-900">{user.companyName}</p>
                )}
                {user.sector && (
                  <p className="text-sm text-gray-600">{user.sector}</p>
                )}
                {user.location && (
                  <p className="text-sm text-gray-500">📍 {user.location}</p>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Se connecter
                </button>
                <Link 
                  to="/messages"
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 text-gray-700 rounded hover:bg-gray-50 text-center"
                >
                  Message
                </Link>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        // Fetch analytics data
        const [analyticsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/analytics/activity`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const analyticsData = await analyticsRes.json();
        const activityData = await activityRes.json();

        if (analyticsData.success) {
          setAnalytics(analyticsData.data);
        }
        if (activityData.success) {
          setRecentActivity(activityData.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set mock data for demo purposes
        setAnalytics({
          totalUsers: 1247,
          newUsersThisMonth: 87,
          totalMessages: 3421,
          avgResponseTime: 2.4,
          totalOpportunities: 156,
          activeOpportunities: 73,
          totalEvents: 34,
          upcomingEvents: 8,
          totalResources: 89,
          totalDownloads: 2341,
          engagementRate: 78.5,
          dailyActiveUsers: 234,
          totalConnections: 892,
          messageResponseRate: 92.3,
          opportunitySuccessRate: 65.7,
          eventAttendanceRate: 84.2,
          userSatisfactionRate: 89.1,
          userGrowthRate: 12.5,
          activeUsersThisMonth: 986,
          totalMonthlyActivity: 5678,
          monthlyMessages: 1234,
          monthlyOpportunities: 45,
          overallScore: 85
        });
        setRecentActivity([
          { type: 'message', title: 'Nouveau message', description: 'De Marie Dubois à propos du projet PME', createdAt: new Date(Date.now() - 5*60*1000).toISOString() },
          { type: 'opportunity', title: 'Opportunité publiée', description: 'Recherche partenaire pour expansion', createdAt: new Date(Date.now() - 15*60*1000).toISOString() },
          { type: 'event', title: 'Événement créé', description: 'Webinaire Finance pour PME', createdAt: new Date(Date.now() - 30*60*1000).toISOString() },
          { type: 'user', title: 'Nouvel utilisateur', description: 'Jean Martin a rejoint la plateforme', createdAt: new Date(Date.now() - 2*60*60*1000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatPercentage = (num) => {
    if (!num) return '0%';
    return `${num.toFixed(1)}%`;
  };

  const getActivityIcon = (type) => {
    const icons = {
      message: '💬',
      opportunity: '🏢', 
      event: '📅',
      resource: '📚',
      user: '👥',
      notification: '🔔'
    };
    return icons[type] || '📝';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue, {user?.firstName} {user?.lastName} ! 👋
        </h1>
        <p className="text-gray-600">Voici un aperçu de l'activité sur PME 360</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-100">Total Utilisateurs</h3>
              <p className="text-2xl font-bold">{formatNumber(analytics?.totalUsers)}</p>
              <p className="text-xs text-blue-100 mt-1">
                +{analytics?.newUsersThisMonth || 0} ce mois
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">💬</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-green-100">Messages</h3>
              <p className="text-2xl font-bold">{formatNumber(analytics?.totalMessages)}</p>
              <p className="text-xs text-green-100 mt-1">
                {analytics?.avgResponseTime}h temps de réponse
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🏢</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-purple-100">Opportunités</h3>
              <p className="text-2xl font-bold">{formatNumber(analytics?.totalOpportunities)}</p>
              <p className="text-xs text-purple-100 mt-1">
                {analytics?.activeOpportunities || 0} actives
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-orange-100">Événements</h3>
              <p className="text-2xl font-bold">{formatNumber(analytics?.totalEvents)}</p>
              <p className="text-xs text-orange-100 mt-1">
                {analytics?.upcomingEvents || 0} à venir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Ressources</h3>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics?.totalResources)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics?.totalDownloads || 0} téléchargements
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Engagement</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics?.engagementRate)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Taux moyen mensuel
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Activité</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics?.dailyActiveUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Utilisateurs actifs/jour
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Connexions</h3>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalConnections || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Relations créées
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Activité Récente</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm py-2">
                <span className="flex-shrink-0 text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <span className="text-gray-900 font-medium">{activity.title}</span>
                  <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                </div>
                <span className="text-gray-400 text-xs">{formatTimeAgo(activity.createdAt)}</span>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📭</div>
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Métriques de Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taux de réponse messages</span>
                <span className="font-medium">{formatPercentage(analytics?.messageResponseRate || 0)}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{width: `${analytics?.messageResponseRate || 0}%`}}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Opportunités concrétisées</span>
                <span className="font-medium">{formatPercentage(analytics?.opportunitySuccessRate || 0)}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{width: `${analytics?.opportunitySuccessRate || 0}%`}}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Participation événements</span>
                <span className="font-medium">{formatPercentage(analytics?.eventAttendanceRate || 0)}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{width: `${analytics?.eventAttendanceRate || 0}%`}}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Satisfaction utilisateurs</span>
                <span className="font-medium">{formatPercentage(analytics?.userSatisfactionRate || 0)}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{width: `${analytics?.userSatisfactionRate || 0}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance Utilisateurs</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              +{formatPercentage((analytics?.userGrowthRate || 0))}
            </div>
            <p className="text-sm text-gray-600">Ce mois vs précédent</p>
            <div className="mt-4 flex justify-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Nouveaux: {analytics?.newUsersThisMonth || 0}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Actifs: {analytics?.activeUsersThisMonth || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Mensuelle</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatNumber(analytics?.totalMonthlyActivity || 0)}
            </div>
            <p className="text-sm text-gray-600">Actions ce mois</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-purple-600">{analytics?.monthlyMessages || 0}</div>
                <div className="text-gray-500">Messages</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{analytics?.monthlyOpportunities || 0}</div>
                <div className="text-gray-500">Opportunités</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Globale</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {analytics?.overallScore || 0}<span className="text-lg">/100</span>
            </div>
            <p className="text-sm text-gray-600">Score de performance</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{width: `${analytics?.overallScore || 0}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {navigation.slice(1).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:border-blue-300 group"
            >
              <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-medium text-gray-900">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Messages Page with full functionality
function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.filter(u => u.id !== user?.id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || !subject || !newMessage) return;

    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          subject,
          content: newMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setSubject('');
        setShowNewMessage(false);
        setSelectedUser(null);
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communiquez avec les membres de PME 360</p>
        </div>
        <button
          onClick={() => setShowNewMessage(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          ✏️ Nouveau message
        </button>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-96">
          {/* Messages List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Boîte de réception ({messages.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !message.isRead && message.receiverId === user?.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !message.isRead && message.receiverId === user?.id && markAsRead(message.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
                        </div>
                        <div className="ml-2">
                          <p className={`text-sm ${!message.isRead && message.receiverId === user?.id ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {message.senderId === user?.id ? `À: ${message.receiver?.firstName} ${message.receiver?.lastName}` : `${message.sender?.firstName} ${message.sender?.lastName}`}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${!message.isRead && message.receiverId === user?.id ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.content.substring(0, 50)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{formatDate(message.createdAt)}</p>
                      {!message.isRead && message.receiverId === user?.id && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-auto"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>📭</p>
                  <p className="mt-2">Aucun message</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-center text-gray-500 mt-20">
                <p className="text-4xl mb-4">💬</p>
                <p>Sélectionnez un message pour le lire</p>
                <p className="text-sm mt-2">Ou cliquez sur "Nouveau message" pour commencer une conversation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouveau message</h3>
              <button
                onClick={() => {
                  setShowNewMessage(false);
                  setSelectedUser(null);
                  setSubject('');
                  setNewMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find(u => u.id === e.target.value);
                    setSelectedUser(user || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choisir un destinataire...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.profileType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Objet du message"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Écrivez votre message..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={sendMessage}
                  disabled={sending || !selectedUser || !subject || !newMessage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    '📤 Envoyer'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowNewMessage(false);
                    setSelectedUser(null);
                    setSubject('');
                    setNewMessage('');
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  
  // New opportunity form
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    type: 'FUNDING',
    budget: '',
    location: '',
    deadline: '',
    requirements: ''
  });
  
  // Application form
  const [application, setApplication] = useState({
    coverLetter: '',
    proposedBudget: ''
  });
  
  const [creating, setCreating] = useState(false);
  const [applying, setApplying] = useState(false);

  const opportunityTypes = [
    { value: 'FUNDING', label: 'Financement', icon: '💰', color: 'bg-green-100 text-green-800' },
    { value: 'PARTNERSHIP', label: 'Partenariat', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
    { value: 'CONTRACT', label: 'Contrat', icon: '📋', color: 'bg-purple-100 text-purple-800' },
    { value: 'MENTORSHIP', label: 'Mentorat', icon: '🎓', color: 'bg-orange-100 text-orange-800' },
    { value: 'INVESTMENT', label: 'Investissement', icon: '📈', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/opportunities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async () => {
    if (!newOpportunity.title || !newOpportunity.description) return;

    setCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newOpportunity,
          budget: newOpportunity.budget ? parseFloat(newOpportunity.budget) : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewOpportunity({
          title: '',
          description: '',
          type: 'FUNDING',
          budget: '',
          location: '',
          deadline: '',
          requirements: ''
        });
        setShowCreateModal(false);
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
    } finally {
      setCreating(false);
    }
  };

  const applyToOpportunity = async () => {
    if (!application.coverLetter) return;

    setApplying(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/opportunities/${selectedOpportunity.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter: application.coverLetter,
          proposedBudget: application.proposedBudget ? parseFloat(application.proposedBudget) : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setApplication({ coverLetter: '', proposedBudget: '' });
        setShowApplicationModal(false);
        setSelectedOpportunity(null);
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Error applying to opportunity:', error);
    } finally {
      setApplying(false);
    }
  };

  const getTypeInfo = (type) => {
    return opportunityTypes.find(t => t.value === type) || opportunityTypes[0];
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filter === 'ALL') return true;
    if (filter === 'MY') return opp.createdById === user?.id;
    return opp.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des opportunités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace d'Opportunités</h1>
          <p className="text-gray-600">Découvrez et publiez des opportunités d'affaires</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          ➕ Publier une opportunité
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({opportunities.length})
          </button>
          <button
            onClick={() => setFilter('MY')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'MY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes opportunités ({opportunities.filter(o => o.createdById === user?.id).length})
          </button>
          {opportunityTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filter === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label} ({opportunities.filter(o => o.type === type.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opportunity) => {
          const typeInfo = getTypeInfo(opportunity.type);
          const isMyOpportunity = opportunity.createdById === user?.id;
          const hasApplied = opportunity.applications?.some(app => app.userId === user?.id);
          
          return (
            <div key={opportunity.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    {isMyOpportunity && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        👤 Votre annonce
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{opportunity.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {opportunity.budget && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">💰</span>
                    Budget: {formatCurrency(opportunity.budget)}
                  </div>
                )}
                {opportunity.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    {opportunity.location}
                  </div>
                )}
                {opportunity.deadline && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    Échéance: {formatDate(opportunity.deadline)}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👥</span>
                  {opportunity._count?.applications || 0} candidature{(opportunity._count?.applications || 0) !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                    {opportunity.createdBy?.firstName?.[0]}{opportunity.createdBy?.lastName?.[0]}
                  </div>
                  Par {opportunity.createdBy?.firstName} {opportunity.createdBy?.lastName}
                </div>
                
                {!isMyOpportunity && (
                  <button
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setShowApplicationModal(true);
                    }}
                    disabled={hasApplied}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      hasApplied
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasApplied ? '✅ Candidature envoyée' : '🚀 Postuler'}
                  </button>
                )}
                
                {isMyOpportunity && (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
                      📊 Candidatures ({opportunity._count?.applications || 0})
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune opportunité trouvée</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'ALL' 
              ? "Il n'y a pas encore d'opportunités publiées."
              : `Aucune opportunité ne correspond au filtre "${opportunityTypes.find(t => t.value === filter)?.label || filter}".`
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Être le premier à publier
          </button>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Publier une nouvelle opportunité</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewOpportunity({
                    title: '', description: '', type: 'FUNDING', budget: '', location: '', deadline: '', requirements: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={newOpportunity.title}
                  onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Recherche investisseur pour expansion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={newOpportunity.type}
                  onChange={(e) => setNewOpportunity({...newOpportunity, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {opportunityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Décrivez votre opportunité en détail..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                  <input
                    type="number"
                    value={newOpportunity.budget}
                    onChange={(e) => setNewOpportunity({...newOpportunity, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={newOpportunity.location}
                    onChange={(e) => setNewOpportunity({...newOpportunity, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Paris, France"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                <input
                  type="date"
                  value={newOpportunity.deadline}
                  onChange={(e) => setNewOpportunity({...newOpportunity, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exigences</label>
                <textarea
                  value={newOpportunity.requirements}
                  onChange={(e) => setNewOpportunity({...newOpportunity, requirements: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Précisez vos critères et exigences..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={createOpportunity}
                  disabled={creating || !newOpportunity.title || !newOpportunity.description}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Publication...
                    </>
                  ) : (
                    '🚀 Publier l\'opportunité'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewOpportunity({
                      title: '', description: '', type: 'FUNDING', budget: '', location: '', deadline: '', requirements: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Postuler à l'opportunité</h3>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedOpportunity(null);
                  setApplication({ coverLetter: '', proposedBudget: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedOpportunity.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedOpportunity.description.substring(0, 100)}...</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation *</label>
                <textarea
                  value={application.coverLetter}
                  onChange={(e) => setApplication({...application, coverLetter: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Expliquez pourquoi vous êtes la personne idéale pour cette opportunité..."
                  required
                />
              </div>

              {selectedOpportunity.type === 'FUNDING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant proposé (€)</label>
                  <input
                    type="number"
                    value={application.proposedBudget}
                    onChange={(e) => setApplication({...application, proposedBudget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre proposition de financement"
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={applyToOpportunity}
                  disabled={applying || !application.coverLetter}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {applying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    '📤 Envoyer ma candidature'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedOpportunity(null);
                    setApplication({ coverLetter: '', proposedBudget: '' });
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  
  // New event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'CONFERENCE',
    startDate: '',
    endDate: '',
    location: '',
    capacity: '',
    isVirtual: false,
    registrationFee: '',
    requirements: ''
  });
  
  const [registering, setRegistering] = useState(false);
  const [creating, setCreating] = useState(false);

  const eventTypes = [
    { value: 'CONFERENCE', label: 'Conférence', icon: '🎤', color: 'bg-blue-100 text-blue-800' },
    { value: 'WORKSHOP', label: 'Atelier', icon: '🔧', color: 'bg-green-100 text-green-800' },
    { value: 'NETWORKING', label: 'Networking', icon: '🤝', color: 'bg-purple-100 text-purple-800' },
    { value: 'TRAINING', label: 'Formation', icon: '📚', color: 'bg-orange-100 text-orange-800' },
    { value: 'WEBINAR', label: 'Webinaire', icon: '💻', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'MEETUP', label: 'Meetup', icon: '☕', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.startDate) return;

    setCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newEvent,
          capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null,
          registrationFee: newEvent.registrationFee ? parseFloat(newEvent.registrationFee) : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewEvent({
          title: '', description: '', type: 'CONFERENCE', startDate: '', endDate: '', 
          location: '', capacity: '', isVirtual: false, registrationFee: '', requirements: ''
        });
        setShowCreateModal(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setCreating(false);
    }
  };

  const registerForEvent = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/events/${selectedEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setShowRegistrationModal(false);
        setSelectedEvent(null);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setRegistering(false);
    }
  };

  const getTypeInfo = (type) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const isEventPast = (startDate) => {
    return new Date(startDate) < new Date();
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'ALL') return true;
    if (filter === 'MY') return event.createdById === user?.id;
    if (filter === 'REGISTERED') return event.registrations?.some(reg => reg.userId === user?.id);
    if (filter === 'UPCOMING') return !isEventPast(event.startDate);
    if (filter === 'PAST') return isEventPast(event.startDate);
    return event.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Événements & Formations</h1>
          <p className="text-gray-600">Participez aux événements de la communauté PME</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          📅 Organiser un événement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({events.length})
          </button>
          <button
            onClick={() => setFilter('MY')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'MY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes événements ({events.filter(e => e.createdById === user?.id).length})
          </button>
          <button
            onClick={() => setFilter('REGISTERED')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'REGISTERED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes inscriptions ({events.filter(e => e.registrations?.some(reg => reg.userId === user?.id)).length})
          </button>
          <button
            onClick={() => setFilter('UPCOMING')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'UPCOMING' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            À venir ({events.filter(e => !isEventPast(e.startDate)).length})
          </button>
          <button
            onClick={() => setFilter('PAST')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'PAST' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Passés ({events.filter(e => isEventPast(e.startDate)).length})
          </button>
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filter === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label} ({events.filter(e => e.type === type.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const typeInfo = getTypeInfo(event.type);
          const isMyEvent = event.createdById === user?.id;
          const hasRegistered = event.registrations?.some(reg => reg.userId === user?.id);
          const isPast = isEventPast(event.startDate);
          const spotsLeft = event.capacity ? event.capacity - (event._count?.registrations || 0) : null;
          
          return (
            <div key={event.id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${
              isPast ? 'border-gray-400' : 'border-blue-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2 flex-wrap gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    {event.isVirtual && (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        💻 Virtuel
                      </span>
                    )}
                    {isMyEvent && (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        👤 Votre événement
                      </span>
                    )}
                    {isPast && (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        🕐 Terminé
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🗓️</span>
                  Début: {formatDateTime(event.startDate)}
                </div>
                {event.endDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🏁</span>
                    Fin: {formatDateTime(event.endDate)}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    {event.location}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">💰</span>
                  {formatCurrency(event.registrationFee)}
                </div>
                {event.capacity && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    {event._count?.registrations || 0}/{event.capacity} participants
                    {spotsLeft > 0 && <span className="text-green-600 ml-1">({spotsLeft} places restantes)</span>}
                    {spotsLeft === 0 && <span className="text-red-600 ml-1">(Complet)</span>}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                    {event.createdBy?.firstName?.[0]}{event.createdBy?.lastName?.[0]}
                  </div>
                  Par {event.createdBy?.firstName} {event.createdBy?.lastName}
                </div>
                
                {!isMyEvent && !isPast && (
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowRegistrationModal(true);
                    }}
                    disabled={hasRegistered || (event.capacity && spotsLeft === 0)}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      hasRegistered
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : (event.capacity && spotsLeft === 0)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasRegistered ? '✅ Inscrit' : (event.capacity && spotsLeft === 0) ? '❌ Complet' : '📝 S\'inscrire'}
                  </button>
                )}
                
                {isMyEvent && (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
                      👥 Participants ({event._count?.registrations || 0})
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'ALL' 
              ? "Il n'y a pas encore d'événements organisés."
              : `Aucun événement ne correspond au filtre sélectionné.`
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Organiser le premier événement
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Organiser un nouvel événement</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewEvent({
                    title: '', description: '', type: 'CONFERENCE', startDate: '', endDate: '', 
                    location: '', capacity: '', isVirtual: false, registrationFee: '', requirements: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'événement *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Conférence PME & Innovation 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement *</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Décrivez votre événement, le programme, les intervenants..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVirtual"
                  checked={newEvent.isVirtual}
                  onChange={(e) => setNewEvent({...newEvent, isVirtual: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700">
                  💻 Événement virtuel
                </label>
              </div>

              {!newEvent.isVirtual && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adresse du lieu"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre max de participants"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais d'inscription (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEvent.registrationFee}
                    onChange={(e) => setNewEvent({...newEvent, registrationFee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0 pour gratuit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
                <textarea
                  value={newEvent.requirements}
                  onChange={(e) => setNewEvent({...newEvent, requirements: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Prérequis ou recommandations pour les participants..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={createEvent}
                  disabled={creating || !newEvent.title || !newEvent.description || !newEvent.startDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création...
                    </>
                  ) : (
                    '🎉 Créer l\'événement'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewEvent({
                      title: '', description: '', type: 'CONFERENCE', startDate: '', endDate: '', 
                      location: '', capacity: '', isVirtual: false, registrationFee: '', requirements: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Inscription à l'événement</h3>
              <button
                onClick={() => {
                  setShowRegistrationModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
              <p className="text-sm text-gray-600 mt-1">📅 {formatDateTime(selectedEvent.startDate)}</p>
              <p className="text-sm text-gray-600">💰 {formatCurrency(selectedEvent.registrationFee)}</p>
            </div>

            <p className="text-gray-600 mb-6">
              Confirmez-vous votre inscription à cet événement ?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={registerForEvent}
                disabled={registering}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {registering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Inscription...
                  </>
                ) : (
                  '✅ Confirmer l\'inscription'
                )}
              </button>
              <button
                onClick={() => {
                  setShowRegistrationModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New resource form
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'DOCUMENT',
    category: 'BUSINESS',
    url: '',
    fileUrl: null,
    tags: '',
    isPremium: false,
    price: ''
  });
  
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resourceTypes = [
    { value: 'DOCUMENT', label: 'Document', icon: '📄', color: 'bg-blue-100 text-blue-800' },
    { value: 'TEMPLATE', label: 'Template', icon: '📋', color: 'bg-green-100 text-green-800' },
    { value: 'GUIDE', label: 'Guide', icon: '📖', color: 'bg-purple-100 text-purple-800' },
    { value: 'TOOL', label: 'Outil', icon: '🔧', color: 'bg-orange-100 text-orange-800' },
    { value: 'VIDEO', label: 'Vidéo', icon: '🎥', color: 'bg-red-100 text-red-800' },
    { value: 'AUDIO', label: 'Audio', icon: '🎵', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const resourceCategories = [
    { value: 'BUSINESS', label: 'Business', icon: '💼' },
    { value: 'FINANCE', label: 'Finance', icon: '💰' },
    { value: 'MARKETING', label: 'Marketing', icon: '📢' },
    { value: 'LEGAL', label: 'Juridique', icon: '⚖️' },
    { value: 'HR', label: 'RH', icon: '👥' },
    { value: 'TECH', label: 'Technologie', icon: '💻' },
    { value: 'MANAGEMENT', label: 'Management', icon: '🎯' },
    { value: 'SALES', label: 'Ventes', icon: '🤝' }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/resources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setResources(data.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier ne peut pas dépasser 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'audio/mpeg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      };
      
      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('POST', `${API_BASE}/files/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const createResource = async () => {
    if (!newResource.title || !newResource.description) return;

    setCreating(true);
    try {
      let fileUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        if (uploadResult.success) {
          fileUrl = uploadResult.data.url;
        }
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newResource,
          fileUrl,
          price: newResource.price ? parseFloat(newResource.price) : null,
          tags: newResource.tags ? newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewResource({
          title: '', description: '', type: 'DOCUMENT', category: 'BUSINESS', 
          url: '', fileUrl: null, tags: '', isPremium: false, price: ''
        });
        setSelectedFile(null);
        setShowCreateModal(false);
        fetchResources();
      }
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setCreating(false);
    }
  };

  const downloadResource = async (resourceId) => {
    setDownloading({...downloading, [resourceId]: true});
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/resources/${resourceId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Handle download logic here
        const data = await response.json();
        if (data.success) {
          // Update download count
          fetchResources();
        }
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
    } finally {
      setDownloading({...downloading, [resourceId]: false});
    }
  };

  const getTypeInfo = (type) => {
    return resourceTypes.find(t => t.value === type) || resourceTypes[0];
  };

  const getCategoryInfo = (category) => {
    return resourceCategories.find(c => c.value === category) || resourceCategories[0];
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredResources = resources.filter(resource => {
    // Filter by category/type
    let matchesFilter = true;
    if (filter !== 'ALL') {
      if (filter === 'MY') {
        matchesFilter = resource.uploadedById === user?.id;
      } else if (filter === 'PREMIUM') {
        matchesFilter = resource.isPremium;
      } else if (filter === 'FREE') {
        matchesFilter = !resource.isPremium;
      } else {
        // Check if it's a type or category filter
        matchesFilter = resource.type === filter || resource.category === filter;
      }
    }

    // Filter by search query
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement de la bibliothèque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque de Ressources</h1>
          <p className="text-gray-600">Partagez et découvrez des ressources utiles pour votre PME</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          📚 Partager une ressource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">🔍</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher par titre, description ou tags..."
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({resources.length})
          </button>
          <button
            onClick={() => setFilter('MY')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'MY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes ressources ({resources.filter(r => r.uploadedById === user?.id).length})
          </button>
          <button
            onClick={() => setFilter('PREMIUM')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'PREMIUM' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💎 Premium ({resources.filter(r => r.isPremium).length})
          </button>
          <button
            onClick={() => setFilter('FREE')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'FREE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🆓 Gratuit ({resources.filter(r => !r.isPremium).length})
          </button>
          
          {/* Type Filters */}
          {resourceTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filter === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label} ({resources.filter(r => r.type === type.value).length})
            </button>
          ))}

          {/* Category Filters */}
          {resourceCategories.map(category => (
            <button
              key={category.value}
              onClick={() => setFilter(category.value)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filter === category.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label} ({resources.filter(r => r.category === category.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const typeInfo = getTypeInfo(resource.type);
          const categoryInfo = getCategoryInfo(resource.category);
          const isMyResource = resource.uploadedById === user?.id;
          
          return (
            <div key={resource.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {categoryInfo.icon} {categoryInfo.label}
                  </span>
                </div>
                {resource.isPremium && (
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-medium">
                    💎 Premium
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                      #{tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    📥 {resource.downloadCount || 0} téléchargements
                  </span>
                  {resource.rating && (
                    <span className="flex items-center">
                      ⭐ {resource.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(resource.price)}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                    {resource.uploadedBy?.firstName?.[0]}{resource.uploadedBy?.lastName?.[0]}
                  </div>
                  Par {resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName}
                  {isMyResource && <span className="ml-2 text-blue-600">(Vous)</span>}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowDetailModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    👁️ Voir
                  </button>
                  {!isMyResource && (
                    <button
                      onClick={() => downloadResource(resource.id)}
                      disabled={downloading[resource.id]}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {downloading[resource.id] ? '⏳' : '📥'} 
                      {resource.isPremium ? 'Acheter' : 'Télécharger'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ressource trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 
              `Aucune ressource ne correspond à votre recherche "${searchQuery}".` :
              filter === 'ALL' ? 
                "Il n'y a pas encore de ressources partagées." :
                "Aucune ressource ne correspond au filtre sélectionné."
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Être le premier à partager
          </button>
        </div>
      )}

      {/* Create Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Partager une nouvelle ressource</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewResource({
                    title: '', description: '', type: 'DOCUMENT', category: 'BUSINESS', 
                    url: '', fileUrl: null, tags: '', isPremium: false, price: ''
                  });
                  setSelectedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Template Business Plan 2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {resourceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {resourceCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Décrivez votre ressource, son utilité, son contenu..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL ou lien</label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemple.com/ressource"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ou télécharger un fichier</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="text-blue-600">
                          {selectedFile.type.includes('image') ? '🖼️' : 
                           selectedFile.type.includes('video') ? '🎥' : 
                           selectedFile.type.includes('audio') ? '🎵' : '📄'}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl text-gray-400">📁</div>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Télécharger un fichier</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileSelect}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, XLS, PPT, TXT, images, vidéos, audio jusqu'à 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Téléchargement...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newResource.tags}
                  onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="business plan, startup, modèle"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={newResource.isPremium}
                    onChange={(e) => setNewResource({...newResource, isPremium: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                    💎 Ressource premium
                  </label>
                </div>

                {newResource.isPremium && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newResource.price}
                      onChange={(e) => setNewResource({...newResource, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9.99"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={createResource}
                  disabled={creating || !newResource.title || !newResource.description}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Publication...
                    </>
                  ) : (
                    '🚀 Partager la ressource'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewResource({
                      title: '', description: '', type: 'DOCUMENT', category: 'BUSINESS', 
                      url: '', fileUrl: null, tags: '', isPremium: false, price: ''
                    });
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {showDetailModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeInfo(selectedResource.type).color}`}>
                    {getTypeInfo(selectedResource.type).icon} {getTypeInfo(selectedResource.type).label}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {getCategoryInfo(selectedResource.category).icon} {getCategoryInfo(selectedResource.category).label}
                  </span>
                  {selectedResource.isPremium && (
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-medium">
                      💎 Premium - {formatCurrency(selectedResource.price)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedResource.title}</h3>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedResource(null);
                }}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedResource.description}</p>
              </div>

              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.tags.map((tag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedResource.downloadCount || 0}</div>
                  <div className="text-sm text-gray-500">Téléchargements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedResource.rating ? selectedResource.rating.toFixed(1) : 'N/A'}</div>
                  <div className="text-sm text-gray-500">Note moyenne</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Partagé par</h4>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    {selectedResource.uploadedBy?.firstName?.[0]}{selectedResource.uploadedBy?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedResource.uploadedBy?.firstName} {selectedResource.uploadedBy?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{selectedResource.uploadedBy?.email}</div>
                  </div>
                </div>
              </div>

              {selectedResource.url && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Lien</h4>
                  <a 
                    href={selectedResource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {selectedResource.url}
                  </a>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {selectedResource.uploadedById !== user?.id && (
                  <button
                    onClick={() => downloadResource(selectedResource.id)}
                    disabled={downloading[selectedResource.id]}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {downloading[selectedResource.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        📥 {selectedResource.isPremium ? 'Acheter' : 'Télécharger'} {formatCurrency(selectedResource.price)}
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedResource(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Login Page
function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@pme360.com');
  const [password, setPassword] = useState('SuperSecurePass2024!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Connexion PME 360</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

// Main App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;