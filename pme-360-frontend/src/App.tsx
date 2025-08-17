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

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
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
              <span className="ml-2 text-xl font-semibold text-gray-800">PME 360</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {user?.firstName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        >
          <span className="text-gray-600">☰</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Login Page
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à PME 360
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-gray-600">Vue d'ensemble de votre plateforme PME 360</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs actifs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    245
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">💬</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Messages échangés
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    1,324
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🏢</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Opportunités actives
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    89
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Événements à venir
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    12
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm">👤</span>
            <span className="text-sm text-gray-600">Nouvel utilisateur inscrit: Marie Dubois</span>
            <span className="text-xs text-gray-400">il y a 2h</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm">💬</span>
            <span className="text-sm text-gray-600">Nouveau message dans le groupe "Développement"</span>
            <span className="text-xs text-gray-400">il y a 4h</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm">🏢</span>
            <span className="text-sm text-gray-600">Opportunité "Partenariat Tech" créée</span>
            <span className="text-xs text-gray-400">il y a 6h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Management Page
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        console.error('Failed to fetch users:', data.error);
        // Add some mock users for demonstration
        setUsers([
          {
            id: 1,
            email: 'admin@pme360.com',
            firstName: 'Admin',
            lastName: 'PME360',
            profileType: 'admin',
            company: 'PME 360',
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 2,
            email: 'marie.dubois@example.com',
            firstName: 'Marie',
            lastName: 'Dubois',
            profileType: 'entrepreneur',
            company: 'Tech Solutions',
            isActive: true,
            createdAt: '2024-02-20T14:30:00Z'
          },
          {
            id: 3,
            email: 'pierre.martin@example.com',
            firstName: 'Pierre',
            lastName: 'Martin',
            profileType: 'investor',
            company: 'Capital Ventures',
            isActive: false,
            createdAt: '2024-03-10T09:15:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getProfileTypeColor = (type) => {
    switch (type) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'entrepreneur': return 'bg-blue-100 text-blue-800';
      case 'investor': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      // In a real app, this would make an API call
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = async (userId) => {
    // In a real app, this would make an API call
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="mt-2 text-gray-600">Gestion de tous les utilisateurs de la plateforme</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les types</option>
              <option value="admin">Administrateur</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="investor">Investisseur</option>
              <option value="mentor">Mentor</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entrepreneurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.profileType === 'entrepreneur').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Investisseurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.profileType === 'investor').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Liste des utilisateurs ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfileTypeColor(user.profileType)}`}>
                      {user.profileType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">👤</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre premier utilisateur.'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingUser) && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setShowCreateForm(false);
            setEditingUser(null);
          }}
          onSave={(userData) => {
            if (editingUser) {
              // Update existing user
              setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
            } else {
              // Add new user
              const newUser = {
                id: Math.max(...users.map(u => u.id)) + 1,
                ...userData,
                createdAt: new Date().toISOString(),
                isActive: true
              };
              setUsers([...users, newUser]);
            }
            setShowCreateForm(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

// User Form Modal Component
function UserFormModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    company: user?.company || '',
    profileType: user?.profileType || 'entrepreneur'
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    if (!formData.company.trim()) newErrors.company = 'Entreprise requise';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.company ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de profil
            </label>
            <select
              value={formData.profileType}
              onChange={(e) => setFormData({ ...formData, profileType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="entrepreneur">Entrepreneur</option>
              <option value="investor">Investisseur</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {user ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Messages Management Page
function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for conversations
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          participants: [
            { id: 1, name: 'Admin PME360', email: 'admin@pme360.com', avatar: 'AP' },
            { id: 2, name: 'Marie Dubois', email: 'marie.dubois@example.com', avatar: 'MD' }
          ],
          lastMessage: {
            text: 'Parfait ! Nous pouvons planifier une réunion la semaine prochaine.',
            timestamp: '2024-08-17T14:30:00Z',
            senderId: 2
          },
          unreadCount: 2,
          isGroup: false
        },
        {
          id: 2,
          participants: [
            { id: 1, name: 'Admin PME360', email: 'admin@pme360.com', avatar: 'AP' },
            { id: 3, name: 'Pierre Martin', email: 'pierre.martin@example.com', avatar: 'PM' }
          ],
          lastMessage: {
            text: 'Merci pour ces informations sur les opportunités d\'investissement.',
            timestamp: '2024-08-17T10:15:00Z',
            senderId: 3
          },
          unreadCount: 0,
          isGroup: false
        },
        {
          id: 3,
          participants: [
            { id: 1, name: 'Admin PME360', email: 'admin@pme360.com', avatar: 'AP' },
            { id: 2, name: 'Marie Dubois', email: 'marie.dubois@example.com', avatar: 'MD' },
            { id: 3, name: 'Pierre Martin', email: 'pierre.martin@example.com', avatar: 'PM' },
            { id: 4, name: 'Sophie Laurent', email: 'sophie.laurent@example.com', avatar: 'SL' }
          ],
          lastMessage: {
            text: 'Qui peut se joindre à nous pour la présentation de demain ?',
            timestamp: '2024-08-17T09:00:00Z',
            senderId: 4
          },
          unreadCount: 1,
          isGroup: true,
          name: 'Équipe Développement'
        }
      ];
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages = {
        1: [
          {
            id: 1,
            text: 'Bonjour Marie ! Comment avance votre projet ?',
            timestamp: '2024-08-17T13:00:00Z',
            senderId: 1,
            senderName: 'Admin PME360'
          },
          {
            id: 2,
            text: 'Salut ! Ça avance très bien, merci. J\'aimerais discuter de quelques points avec vous.',
            timestamp: '2024-08-17T13:15:00Z',
            senderId: 2,
            senderName: 'Marie Dubois'
          },
          {
            id: 3,
            text: 'Bien sûr ! De quoi souhaitez-vous parler ?',
            timestamp: '2024-08-17T13:30:00Z',
            senderId: 1,
            senderName: 'Admin PME360'
          },
          {
            id: 4,
            text: 'Je cherche des conseils sur le financement et les stratégies de croissance.',
            timestamp: '2024-08-17T14:00:00Z',
            senderId: 2,
            senderName: 'Marie Dubois'
          },
          {
            id: 5,
            text: 'Parfait ! Nous pouvons planifier une réunion la semaine prochaine.',
            timestamp: '2024-08-17T14:30:00Z',
            senderId: 2,
            senderName: 'Marie Dubois'
          }
        ],
        2: [
          {
            id: 1,
            text: 'Bonjour Pierre, j\'ai vu votre profil d\'investisseur.',
            timestamp: '2024-08-17T09:00:00Z',
            senderId: 1,
            senderName: 'Admin PME360'
          },
          {
            id: 2,
            text: 'Bonjour ! Oui, je suis toujours à la recherche de nouveaux projets prometteurs.',
            timestamp: '2024-08-17T09:30:00Z',
            senderId: 3,
            senderName: 'Pierre Martin'
          },
          {
            id: 3,
            text: 'Excellent ! Nous avons plusieurs entrepreneurs sur la plateforme qui cherchent des investisseurs.',
            timestamp: '2024-08-17T10:00:00Z',
            senderId: 1,
            senderName: 'Admin PME360'
          },
          {
            id: 4,
            text: 'Merci pour ces informations sur les opportunités d\'investissement.',
            timestamp: '2024-08-17T10:15:00Z',
            senderId: 3,
            senderName: 'Pierre Martin'
          }
        ],
        3: [
          {
            id: 1,
            text: 'Salut tout le monde ! Comment ça va ?',
            timestamp: '2024-08-17T08:00:00Z',
            senderId: 2,
            senderName: 'Marie Dubois'
          },
          {
            id: 2,
            text: 'Très bien ! On prépare la présentation pour demain.',
            timestamp: '2024-08-17T08:30:00Z',
            senderId: 1,
            senderName: 'Admin PME360'
          },
          {
            id: 3,
            text: 'Qui peut se joindre à nous pour la présentation de demain ?',
            timestamp: '2024-08-17T09:00:00Z',
            senderId: 4,
            senderName: 'Sophie Laurent'
          }
        ]
      };
      setMessages(mockMessages[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv => {
    const searchInParticipants = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const searchInLastMessage = conv.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase());
    const searchInGroupName = conv.isGroup && conv.name && conv.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchInParticipants || searchInLastMessage || searchInGroupName;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: messages.length + 1,
      text: newMessage,
      timestamp: new Date().toISOString(),
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: { text: newMessage, timestamp: message.timestamp, senderId: user.id } }
        : conv
    ));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getConversationName = (conversation) => {
    if (conversation.isGroup && conversation.name) {
      return conversation.name;
    }
    const otherParticipant = conversation.participants.find(p => p.id !== user.id);
    return otherParticipant ? otherParticipant.name : 'Conversation';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.isGroup) {
      return '👥';
    }
    const otherParticipant = conversation.participants.find(p => p.id !== user.id);
    return otherParticipant ? otherParticipant.avatar : '👤';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewConversation(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Nouvelle conversation"
            >
              ✏️
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id 
                  ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {conversation.isGroup ? (
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">👥</span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {getConversationAvatar(conversation)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getConversationName(conversation)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conversation.lastMessage.text}
                  </p>
                  {conversation.isGroup && (
                    <p className="text-xs text-gray-400 mt-1">
                      {conversation.participants.length} participants
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">💬</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez de modifier votre recherche.' : 'Commencez une nouvelle conversation.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {getConversationAvatar(selectedConversation)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getConversationName(selectedConversation)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.isGroup 
                        ? `${selectedConversation.participants.length} participants`
                        : 'En ligne'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    📞
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    📹
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    ℹ️
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {selectedConversation.isGroup && message.senderId !== user.id && (
                      <p className="text-xs font-medium mb-1 opacity-75">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  📎
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block">💬</span>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez une conversation dans la liste pour commencer à discuter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onCreateConversation={(conversationData) => {
            const newConversation = {
              id: conversations.length + 1,
              participants: [
                { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, avatar: `${user.firstName[0]}${user.lastName[0]}` },
                ...conversationData.participants
              ],
              lastMessage: {
                text: 'Conversation créée',
                timestamp: new Date().toISOString(),
                senderId: user.id
              },
              unreadCount: 0,
              isGroup: conversationData.isGroup,
              name: conversationData.name
            };
            setConversations([newConversation, ...conversations]);
            setSelectedConversation(newConversation);
            setShowNewConversation(false);
          }}
        />
      )}
    </div>
  );
}

// New Conversation Modal Component
function NewConversationModal({ onClose, onCreateConversation }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data
  const availableUsers = [
    { id: 2, name: 'Marie Dubois', email: 'marie.dubois@example.com', avatar: 'MD', profileType: 'entrepreneur' },
    { id: 3, name: 'Pierre Martin', email: 'pierre.martin@example.com', avatar: 'PM', profileType: 'investor' },
    { id: 4, name: 'Sophie Laurent', email: 'sophie.laurent@example.com', avatar: 'SL', profileType: 'mentor' },
    { id: 5, name: 'Thomas Durand', email: 'thomas.durand@example.com', avatar: 'TD', profileType: 'entrepreneur' },
    { id: 6, name: 'Julie Moreau', email: 'julie.moreau@example.com', avatar: 'JM', profileType: 'investor' }
  ];

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    onCreateConversation({
      participants: selectedUsers,
      isGroup: isGroup && selectedUsers.length > 1,
      name: isGroup && selectedUsers.length > 1 ? groupName : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Nouvelle conversation</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher des utilisateurs
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom ou email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Users List */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleUserToggle(user)}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedUsers.find(u => u.id === user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">{user.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {user.profileType}
                    </span>
                    {selectedUsers.find(u => u.id === user.id) && (
                      <span className="ml-2 text-blue-600">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisateurs sélectionnés ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <span
                    key={user.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {user.name}
                    <button
                      type="button"
                      onClick={() => handleUserToggle(user)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Group Options */}
          {selectedUsers.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isGroup"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isGroup" className="ml-2 block text-sm text-gray-900">
                  Créer un groupe
                </label>
              </div>
              
              {isGroup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Entrez le nom du groupe..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={selectedUsers.length === 0}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Opportunities Management Page
function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Mock opportunities data
  useEffect(() => {
    setTimeout(() => {
      const mockOpportunities = [
        {
          id: 1,
          title: 'Investissement dans la FoodTech',
          type: 'investment',
          category: 'technology',
          description: 'Recherche d\'investisseurs pour une startup révolutionnaire dans le domaine de la livraison de nourriture locale et bio.',
          budget: '500000',
          currency: 'EUR',
          deadline: '2024-12-31',
          status: 'active',
          author: {
            id: 2,
            name: 'Marie Dubois',
            company: 'EcoFood Solutions',
            profileType: 'entrepreneur'
          },
          location: 'Paris, France',
          requirements: [
            'Expérience dans le secteur alimentaire',
            'Réseau de distribution établi',
            'Capital minimum 100k€'
          ],
          tags: ['FoodTech', 'Écologie', 'Innovation', 'B2C'],
          applicants: 12,
          views: 145,
          createdAt: '2024-08-10T10:00:00Z',
          equity: '15%',
          stage: 'Series A'
        },
        {
          id: 2,
          title: 'Partenariat Technologique IA',
          type: 'partnership',
          category: 'technology',
          description: 'Startup FinTech cherche partenaire technologique spécialisé en IA pour développer des solutions de trading automatisé.',
          budget: '200000',
          currency: 'EUR',
          deadline: '2024-11-15',
          status: 'active',
          author: {
            id: 3,
            name: 'Pierre Martin',
            company: 'TradeSmart AI',
            profileType: 'entrepreneur'
          },
          location: 'Lyon, France',
          requirements: [
            'Expertise en machine learning',
            'Expérience FinTech',
            'Équipe de développement disponible'
          ],
          tags: ['IA', 'FinTech', 'Trading', 'Algorithmes'],
          applicants: 8,
          views: 89,
          createdAt: '2024-08-12T14:30:00Z',
          duration: '12 mois',
          collaborationType: 'Joint Venture'
        },
        {
          id: 3,
          title: 'Recherche de Mentor Marketing Digital',
          type: 'mentoring',
          category: 'marketing',
          description: 'Jeune entrepreneur dans l\'e-commerce cherche mentor expérimenté en marketing digital et stratégies de croissance.',
          budget: '5000',
          currency: 'EUR',
          deadline: '2024-10-01',
          status: 'active',
          author: {
            id: 4,
            name: 'Sophie Laurent',
            company: 'StyleHub',
            profileType: 'entrepreneur'
          },
          location: 'Marseille, France',
          requirements: [
            '5+ années d\'expérience marketing',
            'Expertise e-commerce',
            'Disponibilité 4h/semaine'
          ],
          tags: ['Marketing', 'E-commerce', 'Growth Hacking', 'SEO'],
          applicants: 15,
          views: 203,
          createdAt: '2024-08-05T09:15:00Z',
          sessionType: 'Mensuel',
          duration: '6 mois'
        },
        {
          id: 4,
          title: 'Acquisition Startup EdTech',
          type: 'acquisition',
          category: 'education',
          description: 'Groupe éducatif recherche startups EdTech pour acquisition stratégique. Focus sur les solutions d\'apprentissage adaptatif.',
          budget: '2000000',
          currency: 'EUR',
          deadline: '2024-09-30',
          status: 'active',
          author: {
            id: 5,
            name: 'Thomas Durand',
            company: 'EduGroup International',
            profileType: 'investor'
          },
          location: 'Toulouse, France',
          requirements: [
            'Revenus > 500k€/an',
            'Technologie propriétaire',
            'Équipe de 10+ personnes'
          ],
          tags: ['EdTech', 'Acquisition', 'IA', 'Apprentissage'],
          applicants: 6,
          views: 321,
          createdAt: '2024-07-28T16:45:00Z',
          acquisitionType: 'Stratégique',
          multiple: '3-5x revenus'
        },
        {
          id: 5,
          title: 'Collaboration Green Energy',
          type: 'collaboration',
          category: 'environment',
          description: 'Projet collaboratif pour développer des solutions énergétiques durables dans les zones rurales. Recherche partenaires techniques et financiers.',
          budget: '1500000',
          currency: 'EUR',
          deadline: '2024-11-30',
          status: 'pending',
          author: {
            id: 6,
            name: 'Julie Moreau',
            company: 'GreenTech Solutions',
            profileType: 'entrepreneur'
          },
          location: 'Nantes, France',
          requirements: [
            'Expertise énergies renouvelables',
            'Certification ISO 14001',
            'Expérience projets ruraux'
          ],
          tags: ['Énergie', 'Durabilité', 'Rural', 'Innovation'],
          applicants: 4,
          views: 67,
          createdAt: '2024-08-15T11:20:00Z',
          projectDuration: '24 mois',
          impact: 'Environnemental'
        }
      ];
      setOpportunities(mockOpportunities);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      opp.author.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || opp.type === filterType;
    const matchesStatus = !filterStatus || opp.status === filterStatus;
    const matchesCategory = !filterCategory || opp.category === filterCategory;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'investment': return 'bg-green-100 text-green-800';
      case 'partnership': return 'bg-blue-100 text-blue-800';
      case 'mentoring': return 'bg-purple-100 text-purple-800';
      case 'acquisition': return 'bg-orange-100 text-orange-800';
      case 'collaboration': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (amount, currency) => {
    const num = parseInt(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k ${currency}`;
    }
    return `${num} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleApplyToOpportunity = (opportunityId) => {
    // Simulate application
    setOpportunities(opportunities.map(opp => 
      opp.id === opportunityId 
        ? { ...opp, applicants: opp.applicants + 1, hasApplied: true }
        : opp
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des opportunités...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunités</h1>
            <p className="mt-2 text-gray-600">Découvrez et créez des opportunités d'affaires</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Nouvelle opportunité
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-gray-900">{opportunities.filter(o => o.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Investissements</p>
              <p className="text-2xl font-bold text-gray-900">{opportunities.filter(o => o.type === 'investment').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">🤝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Partenariats</p>
              <p className="text-2xl font-bold text-gray-900">{opportunities.filter(o => o.type === 'partnership').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Rechercher des opportunités..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="investment">Investissement</option>
            <option value="partnership">Partenariat</option>
            <option value="mentoring">Mentorat</option>
            <option value="acquisition">Acquisition</option>
            <option value="collaboration">Collaboration</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes catégories</option>
            <option value="technology">Technologie</option>
            <option value="marketing">Marketing</option>
            <option value="education">Éducation</option>
            <option value="environment">Environnement</option>
            <option value="healthcare">Santé</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous statuts</option>
            <option value="active">Active</option>
            <option value="pending">En attente</option>
            <option value="closed">Fermée</option>
            <option value="completed">Terminée</option>
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {opportunity.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(opportunity.type)}`}>
                      {opportunity.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ℹ️
                </button>
              </div>

              {/* Budget */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatBudget(opportunity.budget, opportunity.currency)}
                  </span>
                  {opportunity.equity && (
                    <span className="text-sm text-gray-500">({opportunity.equity} equity)</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {opportunity.description}
              </p>

              {/* Author */}
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium text-gray-600">
                    {opportunity.author.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{opportunity.author.name}</p>
                  <p className="text-xs text-gray-500">{opportunity.author.company}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {opportunity.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
                {opportunity.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{opportunity.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>👥 {opportunity.applicants} candidats</span>
                <span>👁️ {opportunity.views} vues</span>
                <span>📅 {formatDate(opportunity.deadline)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyToOpportunity(opportunity.id)}
                  disabled={opportunity.hasApplied}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    opportunity.hasApplied
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {opportunity.hasApplied ? '✓ Candidature envoyée' : 'Postuler'}
                </button>
                <button
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Détails
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune opportunité trouvée</h3>
          <p className="text-gray-500">
            {searchTerm || filterType || filterCategory || filterStatus
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Commencez par créer votre première opportunité.'
            }
          </p>
        </div>
      )}

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onApply={() => {
            handleApplyToOpportunity(selectedOpportunity.id);
            setSelectedOpportunity(null);
          }}
        />
      )}

      {/* Create Opportunity Modal */}
      {showCreateForm && (
        <CreateOpportunityModal
          onClose={() => setShowCreateForm(false)}
          onSave={(opportunityData) => {
            const newOpportunity = {
              id: opportunities.length + 1,
              ...opportunityData,
              author: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                company: user.company,
                profileType: user.profileType
              },
              applicants: 0,
              views: 0,
              createdAt: new Date().toISOString(),
              status: 'active'
            };
            setOpportunities([newOpportunity, ...opportunities]);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

// Opportunity Detail Modal
function OpportunityDetailModal({ opportunity, onClose, onApply }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{opportunity.title}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(opportunity.type)}`}>
                  {opportunity.type}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
                  {opportunity.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-600">
                {formatBudget(opportunity.budget, opportunity.currency)}
              </span>
              {opportunity.equity && (
                <span className="text-lg text-gray-600">({opportunity.equity} equity)</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{opportunity.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exigences</h3>
            <ul className="space-y-2">
              {opportunity.requirements.map((req, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Author */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Publié par</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <span className="text-sm font-medium text-gray-600">
                  {opportunity.author.name[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{opportunity.author.name}</p>
                <p className="text-gray-600">{opportunity.author.company}</p>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {opportunity.author.profileType}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Détails</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Localisation:</span>
                <p className="font-medium">{opportunity.location}</p>
              </div>
              <div>
                <span className="text-gray-500">Date limite:</span>
                <p className="font-medium">{formatDate(opportunity.deadline)}</p>
              </div>
              <div>
                <span className="text-gray-500">Candidats:</span>
                <p className="font-medium">{opportunity.applicants}</p>
              </div>
              <div>
                <span className="text-gray-500">Vues:</span>
                <p className="font-medium">{opportunity.views}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onApply}
              disabled={opportunity.hasApplied}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                opportunity.hasApplied
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {opportunity.hasApplied ? '✓ Candidature envoyée' : 'Postuler à cette opportunité'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function getTypeColor(type) {
    switch (type) {
      case 'investment': return 'bg-green-100 text-green-800';
      case 'partnership': return 'bg-blue-100 text-blue-800';
      case 'mentoring': return 'bg-purple-100 text-purple-800';
      case 'acquisition': return 'bg-orange-100 text-orange-800';
      case 'collaboration': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function formatBudget(amount, currency) {
    const num = parseInt(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k ${currency}`;
    }
    return `${num} ${currency}`;
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}

// Create Opportunity Modal
function CreateOpportunityModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'investment',
    category: 'technology',
    description: '',
    budget: '',
    currency: 'EUR',
    deadline: '',
    location: '',
    requirements: [''],
    tags: [''],
    equity: '',
    duration: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Titre requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.budget.trim()) newErrors.budget = 'Budget requis';
    if (!formData.deadline) newErrors.deadline = 'Date limite requise';
    if (!formData.location.trim()) newErrors.location = 'Localisation requise';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const processedData = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim()),
      tags: formData.tags.filter(tag => tag.trim())
    };

    onSave(processedData);
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index) => {
    setFormData({ 
      ...formData, 
      requirements: formData.requirements.filter((_, i) => i !== index) 
    });
  };

  const updateRequirement = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] });
  };

  const removeTag = (index) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter((_, i) => i !== index) 
    });
  };

  const updateTag = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Créer une opportunité</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="investment">Investissement</option>
                  <option value="partnership">Partenariat</option>
                  <option value="mentoring">Mentorat</option>
                  <option value="acquisition">Acquisition</option>
                  <option value="collaboration">Collaboration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget *
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date limite *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.deadline ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technology">Technologie</option>
                  <option value="marketing">Marketing</option>
                  <option value="education">Éducation</option>
                  <option value="environment">Environnement</option>
                  <option value="healthcare">Santé</option>
                </select>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exigences
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Exigence..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                + Ajouter une exigence
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="Tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                + Ajouter un tag
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Créer l'opportunité
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Événements</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Gestion des événements à venir...</p>
      </div>
    </div>
  );
}

function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ressources</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Bibliothèque de ressources à venir...</p>
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;