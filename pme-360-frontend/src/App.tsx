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
  { name: 'Profils', href: '/profiles', icon: '🏷️' },
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

// Events Management Page
function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Mock events data
  useEffect(() => {
    setTimeout(() => {
      const mockEvents = [
        {
          id: 1,
          title: 'Conférence FinTech Paris 2024',
          type: 'conference',
          description: 'La plus grande conférence européenne dédiée aux innovations financières et aux nouvelles technologies de paiement.',
          startDate: '2024-09-25T09:00:00Z',
          endDate: '2024-09-25T18:00:00Z',
          location: 'Palais des Congrès, Paris',
          isOnline: false,
          organizer: {
            id: 2,
            name: 'Marie Dubois',
            company: 'FinTech Europe',
            profileType: 'entrepreneur'
          },
          capacity: 500,
          registered: 347,
          price: 150,
          currency: 'EUR',
          status: 'upcoming',
          image: '🏦',
          tags: ['FinTech', 'Innovation', 'Paiements', 'Blockchain'],
          agenda: [
            { time: '09:00', title: 'Accueil et petit-déjeuner' },
            { time: '10:00', title: 'Keynote: L\'avenir des paiements numériques' },
            { time: '11:30', title: 'Panel: Blockchain et DeFi' },
            { time: '14:00', title: 'Workshops techniques' },
            { time: '16:00', title: 'Networking et clôture' }
          ],
          speakers: ['Marie Dubois', 'Pierre Martin', 'Sophie Laurent'],
          createdAt: '2024-08-01T10:00:00Z',
          hasRegistered: false
        },
        {
          id: 2,
          title: 'Webinaire Marketing Digital',
          type: 'webinar',
          description: 'Formation intensive sur les dernières stratégies de marketing digital et growth hacking pour startups.',
          startDate: '2024-09-20T14:00:00Z',
          endDate: '2024-09-20T16:00:00Z',
          location: 'En ligne',
          isOnline: true,
          organizer: {
            id: 4,
            name: 'Sophie Laurent',
            company: 'GrowthLab',
            profileType: 'mentor'
          },
          capacity: 100,
          registered: 78,
          price: 0,
          currency: 'EUR',
          status: 'upcoming',
          image: '📱',
          tags: ['Marketing', 'Digital', 'Growth', 'Formation'],
          agenda: [
            { time: '14:00', title: 'Introduction au growth hacking' },
            { time: '14:30', title: 'Stratégies d\'acquisition client' },
            { time: '15:15', title: 'Outils et métriques essentiels' },
            { time: '15:45', title: 'Q&A et cas pratiques' }
          ],
          speakers: ['Sophie Laurent'],
          createdAt: '2024-08-10T15:30:00Z',
          hasRegistered: true
        },
        {
          id: 3,
          title: 'Salon de l\'Entrepreneuriat',
          type: 'salon',
          description: 'Rencontrez entrepreneurs, investisseurs et experts lors du plus grand salon entrepreneurial de la région.',
          startDate: '2024-10-15T10:00:00Z',
          endDate: '2024-10-16T19:00:00Z',
          location: 'Centre d\'Exposition, Lyon',
          isOnline: false,
          organizer: {
            id: 5,
            name: 'Thomas Durand',
            company: 'Entrepreneur Network',
            profileType: 'investor'
          },
          capacity: 2000,
          registered: 1245,
          price: 25,
          currency: 'EUR',
          status: 'upcoming',
          image: '🏢',
          tags: ['Entrepreneuriat', 'Networking', 'Investissement', 'Innovation'],
          agenda: [
            { time: '10:00', title: 'Ouverture du salon' },
            { time: '11:00', title: 'Pitchs startups' },
            { time: '14:00', title: 'Table ronde investisseurs' },
            { time: '16:00', title: 'Ateliers thématiques' },
            { time: '18:00', title: 'Cocktail networking' }
          ],
          speakers: ['Thomas Durand', 'Julie Moreau', 'Pierre Martin'],
          createdAt: '2024-07-20T09:00:00Z',
          hasRegistered: false
        },
        {
          id: 4,
          title: 'Hackathon GreenTech',
          type: 'hackathon',
          description: '48h pour développer des solutions innovantes aux défis environnementaux actuels.',
          startDate: '2024-11-08T18:00:00Z',
          endDate: '2024-11-10T18:00:00Z',
          location: 'Campus Innovation, Toulouse',
          isOnline: false,
          organizer: {
            id: 6,
            name: 'Julie Moreau',
            company: 'EcoInnovation Hub',
            profileType: 'entrepreneur'
          },
          capacity: 150,
          registered: 89,
          price: 50,
          currency: 'EUR',
          status: 'upcoming',
          image: '🌱',
          tags: ['Hackathon', 'GreenTech', 'Innovation', 'Développement'],
          agenda: [
            { time: '18:00', title: 'Accueil et formation des équipes' },
            { time: '19:30', title: 'Présentation des défis' },
            { time: '20:00', title: 'Début du développement' },
            { time: '12:00', title: 'Point d\'étape et mentoring' },
            { time: '16:00', title: 'Présentations finales' }
          ],
          speakers: ['Julie Moreau', 'Experts GreenTech'],
          createdAt: '2024-08-15T11:00:00Z',
          hasRegistered: false
        },
        {
          id: 5,
          title: 'Workshop IA & Business',
          type: 'workshop',
          description: 'Atelier pratique sur l\'intégration de l\'intelligence artificielle dans les processus business.',
          startDate: '2024-08-15T09:00:00Z',
          endDate: '2024-08-15T17:00:00Z',
          location: 'TechHub, Marseille',
          isOnline: false,
          organizer: {
            id: 3,
            name: 'Pierre Martin',
            company: 'AI Solutions',
            profileType: 'entrepreneur'
          },
          capacity: 30,
          registered: 30,
          price: 200,
          currency: 'EUR',
          status: 'completed',
          image: '🤖',
          tags: ['IA', 'Business', 'Workshop', 'Formation'],
          agenda: [
            { time: '09:00', title: 'Introduction à l\'IA business' },
            { time: '10:30', title: 'Cas d\'usage concrets' },
            { time: '14:00', title: 'Atelier pratique' },
            { time: '16:00', title: 'Implémentation et ROI' }
          ],
          speakers: ['Pierre Martin', 'Experts IA'],
          createdAt: '2024-07-01T14:00:00Z',
          hasRegistered: true
        }
      ];
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      event.organizer.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || event.type === filterType;
    const matchesStatus = !filterStatus || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'conference': return 'bg-blue-100 text-blue-800';
      case 'webinar': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'salon': return 'bg-orange-100 text-orange-800';
      case 'hackathon': return 'bg-red-100 text-red-800';
      case 'networking': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegisterToEvent = (eventId) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, registered: event.registered + 1, hasRegistered: true }
        : event
    ));
  };

  const isEventPast = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const isEventSoldOut = (event) => {
    return event.registered >= event.capacity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
            <p className="mt-2 text-gray-600">Découvrez et organisez des événements professionnels</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                📋 Liste
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                📅 Calendrier
              </button>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Nouvel événement
            </button>
          </div>
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
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'upcoming').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{events.reduce((sum, e) => sum + e.registered, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mes inscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.hasRegistered).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Rechercher des événements..."
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
            <option value="conference">Conférence</option>
            <option value="webinar">Webinaire</option>
            <option value="workshop">Workshop</option>
            <option value="salon">Salon</option>
            <option value="hackathon">Hackathon</option>
            <option value="networking">Networking</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous statuts</option>
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      {/* Events Content */}
      {viewMode === 'list' ? (
        /* Events List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{event.image}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ℹ️
                  </button>
                </div>

                {/* Date and Location */}
                <div className="mb-4">
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <span className="mr-2">🕒</span>
                    <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">{event.isOnline ? '💻' : '📍'}</span>
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Organizer */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-gray-600">
                      {event.organizer.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                    <p className="text-xs text-gray-500">{event.organizer.company}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                  {event.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{event.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats and Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👥 {event.registered}/{event.capacity}</span>
                    <span className={`font-medium ${event.price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                      {event.price === 0 ? 'Gratuit' : `${event.price} ${event.currency}`}
                    </span>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegisterToEvent(event.id)}
                    disabled={event.hasRegistered || isEventPast(event.endDate) || isEventSoldOut(event)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      event.hasRegistered
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : isEventPast(event.endDate)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isEventSoldOut(event)
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {event.hasRegistered ? '✓ Inscrit' : 
                     isEventPast(event.endDate) ? 'Terminé' :
                     isEventSoldOut(event) ? 'Complet' : 'S\'inscrire'}
                  </button>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Vue calendrier</h3>
            <p className="text-gray-500">Fonctionnalité à développer prochainement</p>
            <button
              onClick={() => setViewMode('list')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && viewMode === 'list' && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || filterType || filterStatus
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Commencez par créer votre premier événement.'
            }
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={() => {
            handleRegisterToEvent(selectedEvent.id);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Create Event Modal */}
      {showCreateForm && (
        <CreateEventModal
          onClose={() => setShowCreateForm(false)}
          onSave={(eventData) => {
            const newEvent = {
              id: events.length + 1,
              ...eventData,
              organizer: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                company: user.company,
                profileType: user.profileType
              },
              registered: 0,
              status: 'upcoming',
              createdAt: new Date().toISOString(),
              hasRegistered: false
            };
            setEvents([newEvent, ...events]);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

// Event Detail Modal
function EventDetailModal({ event, onClose, onRegister }) {
  const isEventPast = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const isEventSoldOut = (event) => {
    return event.registered >= event.capacity;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'conference': return 'bg-blue-100 text-blue-800';
      case 'webinar': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'salon': return 'bg-orange-100 text-orange-800';
      case 'hackathon': return 'bg-red-100 text-red-800';
      case 'networking': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{event.image}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Date and Location */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations pratiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="mr-2">📅</span>
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="mr-2">🕒</span>
                  <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">{event.isOnline ? '💻' : '📍'}</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="mr-2">👥</span>
                  <span>{event.registered}/{event.capacity} participants</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="mr-2">💰</span>
                  <span className={`font-medium ${event.price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {event.price === 0 ? 'Gratuit' : `${event.price} ${event.currency}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Agenda */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Programme</h3>
            <div className="space-y-3">
              {event.agenda.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-sm font-medium text-blue-600">{item.time}</div>
                  <div className="flex-1 text-gray-700">{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Speakers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Intervenants</h3>
            <div className="flex flex-wrap gap-2">
              {event.speakers.map((speaker) => (
                <span key={speaker} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  {speaker}
                </span>
              ))}
            </div>
          </div>

          {/* Organizer */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organisé par</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <span className="text-sm font-medium text-gray-600">
                  {event.organizer.name[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{event.organizer.name}</p>
                <p className="text-gray-600">{event.organizer.company}</p>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {event.organizer.profileType}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onRegister}
              disabled={event.hasRegistered || isEventPast(event.endDate) || isEventSoldOut(event)}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                event.hasRegistered
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : isEventPast(event.endDate)
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : isEventSoldOut(event)
                  ? 'bg-red-100 text-red-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {event.hasRegistered ? '✓ Inscrit à l\'événement' : 
               isEventPast(event.endDate) ? 'Événement terminé' :
               isEventSoldOut(event) ? 'Événement complet' : 'S\'inscrire à l\'événement'}
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
}

// Create Event Modal
function CreateEventModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'conference',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isOnline: false,
    capacity: '',
    price: '',
    currency: 'EUR',
    tags: [''],
    agenda: [{ time: '', title: '' }],
    speakers: [''],
    image: '📅'
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Titre requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.startDate) newErrors.startDate = 'Date de début requise';
    if (!formData.endDate) newErrors.endDate = 'Date de fin requise';
    if (!formData.location.trim()) newErrors.location = 'Lieu requis';
    if (!formData.capacity) newErrors.capacity = 'Capacité requise';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const processedData = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
      agenda: formData.agenda.filter(item => item.time && item.title),
      speakers: formData.speakers.filter(speaker => speaker.trim()),
      capacity: parseInt(formData.capacity),
      price: parseFloat(formData.price) || 0
    };

    onSave(processedData);
  };

  const addAgendaItem = () => {
    setFormData({ ...formData, agenda: [...formData.agenda, { time: '', title: '' }] });
  };

  const removeAgendaItem = (index) => {
    setFormData({ 
      ...formData, 
      agenda: formData.agenda.filter((_, i) => i !== index) 
    });
  };

  const updateAgendaItem = (index, field, value) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index][field] = value;
    setFormData({ ...formData, agenda: newAgenda });
  };

  const addSpeaker = () => {
    setFormData({ ...formData, speakers: [...formData.speakers, ''] });
  };

  const removeSpeaker = (index) => {
    setFormData({ 
      ...formData, 
      speakers: formData.speakers.filter((_, i) => i !== index) 
    });
  };

  const updateSpeaker = (index, value) => {
    const newSpeakers = [...formData.speakers];
    newSpeakers[index] = value;
    setFormData({ ...formData, speakers: newSpeakers });
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
          <h2 className="text-xl font-semibold mb-4">Créer un événement</h2>
          
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
                  <option value="conference">Conférence</option>
                  <option value="webinar">Webinaire</option>
                  <option value="workshop">Workshop</option>
                  <option value="salon">Salon</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="networking">Networking</option>
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
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu *
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOnline"
                checked={formData.isOnline}
                onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-900">
                Événement en ligne
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.capacity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            </div>

            {/* Agenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programme
              </label>
              {formData.agenda.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                    placeholder="Activité..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAgendaItem}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                + Ajouter une activité
              </button>
            </div>

            {/* Speakers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervenants
              </label>
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => updateSpeaker(index, e.target.value)}
                    placeholder="Nom de l'intervenant..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpeaker(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpeaker}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                + Ajouter un intervenant
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
                Créer l'événement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Resource Detail Modal
function ResourceDetailModal({ resource, onClose, onDownload, onRate }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRateSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      onRate(resource.id, rating, comment);
      setRating(0);
      setComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{resource.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Resource Info */}
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{resource.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  resource.category === 'guide' ? 'bg-blue-100 text-blue-800' :
                  resource.category === 'template' ? 'bg-green-100 text-green-800' :
                  resource.category === 'formation' ? 'bg-purple-100 text-purple-800' :
                  resource.category === 'legal' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {resource.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  resource.type === 'pdf' ? 'bg-red-100 text-red-800' :
                  resource.type === 'video' ? 'bg-blue-100 text-blue-800' :
                  resource.type === 'doc' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {resource.type.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">{resource.size}</span>
              </div>
              <p className="text-sm text-gray-600">Par {resource.author} • {resource.downloads} téléchargements</p>
            </div>
          </div>

          <p className="text-gray-700">{resource.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* Rating Display */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[1,2,3,4,5].map((star) => (
                <span key={star} className={`text-lg ${star <= resource.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600">({resource.reviews} avis)</span>
          </div>

          {/* Download Button */}
          <button
            onClick={() => onDownload(resource)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            📥 Télécharger {resource.type.toUpperCase()}
          </button>

          {/* Rating Form */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Évaluer cette ressource</h4>
            <form onSubmit={handleRateSubmit} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Note:</span>
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire (optionnel)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <button
                type="submit"
                disabled={rating === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Soumettre l'évaluation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Resource Modal
function CreateResourceModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'guide',
    type: 'pdf',
    file: null,
    tags: [],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      const resource = {
        id: Date.now(),
        ...formData,
        author: 'Utilisateur actuel',
        uploadDate: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        reviews: 0,
        size: '2.5 MB', // Simulated
        icon: formData.category === 'guide' ? '📖' : 
              formData.category === 'template' ? '📄' :
              formData.category === 'formation' ? '🎓' :
              formData.category === 'legal' ? '⚖️' : '📋'
      };
      onSave(resource);
      onClose();
    }
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({...formData, tags: [...formData.tags, newTag]});
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({...formData, tags: formData.tags.filter(tag => tag !== tagToRemove)});
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Ajouter une ressource</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="guide">Guide</option>
                <option value="template">Modèle</option>
                <option value="formation">Formation</option>
                <option value="legal">Juridique</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de fichier</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="video">Vidéo</option>
                <option value="presentation">Présentation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
            <input
              type="file"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Rendre cette ressource publique
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              💾 Sauvegarder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Profile Detail Modal
function ProfileDetailModal({ profile, onClose, onConnect, onEdit }) {
  const { user } = useAuth();

  const getProfileIcon = (type) => {
    const icons = {
      'PME': '🏢',
      'STARTUP': '🚀',
      'EXPERT': '🧠',
      'CONSULTANT': '💼',
      'MENTOR': '🎯',
      'INCUBATOR': '🌱',
      'INVESTOR': '💰',
      'FINANCIAL_INSTITUTION': '🏦',
      'PUBLIC_ORGANIZATION': '🏛️',
      'TECH_PARTNER': '⚡'
    };
    return icons[type] || '👤';
  };

  const getProfileLabel = (type) => {
    const labels = {
      'PME': 'PME',
      'STARTUP': 'Startup',
      'EXPERT': 'Expert',
      'CONSULTANT': 'Consultant',
      'MENTOR': 'Mentor',
      'INCUBATOR': 'Incubateur',
      'INVESTOR': 'Investisseur',
      'FINANCIAL_INSTITUTION': 'Institution Financière',
      'PUBLIC_ORGANIZATION': 'Organisme Public',
      'TECH_PARTNER': 'Partenaire Tech'
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{getProfileIcon(profile.profileType)}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  profile.profileType === 'PME' ? 'bg-blue-100 text-blue-800' :
                  profile.profileType === 'STARTUP' ? 'bg-green-100 text-green-800' :
                  profile.profileType === 'EXPERT' ? 'bg-purple-100 text-purple-800' :
                  profile.profileType === 'MENTOR' ? 'bg-yellow-100 text-yellow-800' :
                  profile.profileType === 'INVESTOR' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getProfileLabel(profile.profileType)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  profile.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {profile.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">{profile.company} • {profile.location || 'Localisation non précisée'}</p>
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{profile.description}</p>
            </div>
          )}

          {/* Expertises */}
          {profile.expertises && profile.expertises.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Expertises</h4>
              <div className="flex flex-wrap gap-2">
                {profile.expertises.map((expertise, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {expertise.name} 
                    {expertise.level && (
                      <span className="ml-1 text-xs">
                        {'⭐'.repeat(expertise.level)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.website && (
              <div>
                <span className="text-sm font-medium text-gray-700">Site web:</span>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:text-blue-800 ml-2">
                  {profile.website}
                </a>
              </div>
            )}
            {profile.linkedin && (
              <div>
                <span className="text-sm font-medium text-gray-700">LinkedIn:</span>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:text-blue-800 ml-2">
                  Profil LinkedIn
                </a>
              </div>
            )}
            {profile.phone && (
              <div>
                <span className="text-sm font-medium text-gray-700">Téléphone:</span>
                <span className="ml-2">{profile.phone}</span>
              </div>
            )}
          </div>

          {/* Profile Specific Info */}
          {profile.profileType === 'INVESTOR' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">💰 Informations Investisseur</h4>
              <p className="text-sm text-green-700">
                Ticket d'investissement: 50k€ - 2M€ • Secteurs: FinTech, HealthTech, GreenTech
              </p>
            </div>
          )}

          {profile.profileType === 'INCUBATOR' && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-800">🌱 Programmes d'Incubation</h4>
              <p className="text-sm text-purple-700">
                Programme 6 mois • 20 startups par promotion • Financement jusqu'à 100k€
              </p>
            </div>
          )}

          {profile.profileType === 'FINANCIAL_INSTITUTION' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800">🏦 Solutions Financières</h4>
              <p className="text-sm text-blue-700">
                Prêts PME • Crédit-bail • Affacturage • Garanties bancaires
              </p>
            </div>
          )}

          {/* Rating & Stats */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-1">Note:</span>
                {[1,2,3,4,5].map((star) => (
                  <span key={star} className={`text-sm ${star <= (profile.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ⭐
                  </span>
                ))}
                <span className="text-sm text-gray-500 ml-1">({profile.reviewCount || 0})</span>
              </div>
              <div className="text-sm text-gray-600">
                Complétude: {profile.completionScore || 0}%
              </div>
            </div>
            <div className="flex space-x-2">
              {user?.id !== profile.id && (
                <button
                  onClick={() => onConnect(profile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🤝 Se connecter
                </button>
              )}
              {user?.id === profile.id && (
                <button
                  onClick={() => onEdit(profile)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  ✏️ Modifier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Creation/Edit Modal
function ProfileEditModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    profileType: profile?.profileType || 'PME',
    company: profile?.company || '',
    location: profile?.location || '',
    description: profile?.description || '',
    website: profile?.website || '',
    linkedin: profile?.linkedin || '',
    phone: profile?.phone || '',
    expertises: profile?.expertises || []
  });

  const [newExpertise, setNewExpertise] = useState({ name: '', level: 3 });

  const profileTypes = [
    { value: 'PME', label: 'PME', icon: '🏢', description: 'Petites et Moyennes Entreprises' },
    { value: 'STARTUP', label: 'Startup', icon: '🚀', description: 'Jeunes entreprises innovantes' },
    { value: 'EXPERT', label: 'Expert', icon: '🧠', description: 'Experts sectoriels' },
    { value: 'CONSULTANT', label: 'Consultant', icon: '💼', description: 'Consultants indépendants' },
    { value: 'MENTOR', label: 'Mentor', icon: '🎯', description: 'Accompagnement entrepreneurial' },
    { value: 'INCUBATOR', label: 'Incubateur', icon: '🌱', description: 'Structures d\'accompagnement' },
    { value: 'INVESTOR', label: 'Investisseur', icon: '💰', description: 'Investisseurs privés' },
    { value: 'FINANCIAL_INSTITUTION', label: 'Institution Financière', icon: '🏦', description: 'Banques et organismes financiers' },
    { value: 'PUBLIC_ORGANIZATION', label: 'Organisme Public', icon: '🏛️', description: 'Institutions publiques' },
    { value: 'TECH_PARTNER', label: 'Partenaire Tech', icon: '⚡', description: 'Fournisseurs technologiques' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.profileType) {
      const profileData = {
        ...formData,
        id: profile?.id || Date.now(),
        status: profile?.status || 'ACTIVE',
        verified: profile?.verified || false,
        completionScore: calculateCompletionScore(formData),
        rating: profile?.rating || 0,
        reviewCount: profile?.reviewCount || 0,
        createdAt: profile?.createdAt || new Date().toISOString()
      };
      onSave(profileData);
      onClose();
    }
  };

  const calculateCompletionScore = (data) => {
    let score = 0;
    if (data.name) score += 15;
    if (data.email) score += 15;
    if (data.company) score += 10;
    if (data.description) score += 20;
    if (data.location) score += 10;
    if (data.website) score += 10;
    if (data.linkedin) score += 10;
    if (data.expertises.length > 0) score += 10;
    return score;
  };

  const addExpertise = () => {
    if (newExpertise.name && !formData.expertises.find(e => e.name === newExpertise.name)) {
      setFormData({
        ...formData,
        expertises: [...formData.expertises, { ...newExpertise }]
      });
      setNewExpertise({ name: '', level: 3 });
    }
  };

  const removeExpertise = (expertiseToRemove) => {
    setFormData({
      ...formData,
      expertises: formData.expertises.filter(e => e.name !== expertiseToRemove.name)
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {profile ? 'Modifier le profil' : 'Créer un profil'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Profile Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de profil *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {profileTypes.map((type) => (
                <label key={type.value} className={`cursor-pointer border rounded-lg p-3 ${
                  formData.profileType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="profileType"
                    value={type.value}
                    checked={formData.profileType === type.value}
                    onChange={(e) => setFormData({...formData, profileType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Company & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise/Organisation</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Ville, Région, Pays"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez votre activité, vos objectifs, vos besoins..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Expertises */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expertises & Compétences</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newExpertise.name}
                onChange={(e) => setNewExpertise({...newExpertise, name: e.target.value})}
                placeholder="Nom de l'expertise..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newExpertise.level}
                onChange={(e) => setNewExpertise({...newExpertise, level: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>⭐ Débutant</option>
                <option value={2}>⭐⭐ Intermédiaire</option>
                <option value={3}>⭐⭐⭐ Confirmé</option>
                <option value={4}>⭐⭐⭐⭐ Expert</option>
                <option value={5}>⭐⭐⭐⭐⭐ Référence</option>
              </select>
              <button
                type="button"
                onClick={addExpertise}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.expertises.map((expertise, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                  {expertise.name} {'⭐'.repeat(expertise.level)}
                  <button
                    type="button"
                    onClick={() => removeExpertise(expertise)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              💾 {profile ? 'Mettre à jour' : 'Créer le profil'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfilesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock profiles data
  useEffect(() => {
    setTimeout(() => {
      const mockProfiles = [
        {
          id: 1,
          name: 'Tech Solutions SARL',
          email: 'contact@techsolutions.fr',
          profileType: 'PME',
          company: 'Tech Solutions SARL',
          location: 'Paris, France',
          description: 'PME spécialisée dans le développement de solutions logicielles sur mesure pour les entreprises. Nous accompagnons nos clients dans leur transformation digitale.',
          website: 'https://techsolutions.fr',
          linkedin: 'https://linkedin.com/company/techsolutions',
          phone: '+33 1 23 45 67 89',
          status: 'ACTIVE',
          verified: true,
          completionScore: 95,
          rating: 4.8,
          reviewCount: 12,
          expertises: [
            { name: 'Développement Web', level: 5 },
            { name: 'Cloud Computing', level: 4 },
            { name: 'Cybersécurité', level: 3 }
          ],
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'GreenTech Innovations',
          email: 'founders@greentech-innov.com',
          profileType: 'STARTUP',
          company: 'GreenTech Innovations',
          location: 'Lyon, France',
          description: 'Startup innovante développant des solutions IoT pour l\'optimisation énergétique des bâtiments intelligents.',
          website: 'https://greentech-innov.com',
          linkedin: 'https://linkedin.com/company/greentech-innovations',
          status: 'ACTIVE',
          verified: false,
          completionScore: 85,
          rating: 4.2,
          reviewCount: 8,
          expertises: [
            { name: 'IoT', level: 5 },
            { name: 'Énergie', level: 4 },
            { name: 'Intelligence Artificielle', level: 3 }
          ],
          createdAt: '2024-02-10T14:30:00Z'
        },
        {
          id: 3,
          name: 'Marie Dubois',
          email: 'marie.dubois@expert-finance.fr',
          profileType: 'EXPERT',
          company: 'Expert Finance Conseil',
          location: 'Bordeaux, France',
          description: 'Expert-comptable et conseil en gestion financière avec 15 ans d\'expérience. Spécialisée dans l\'accompagnement des startups et PME.',
          website: 'https://expert-finance-conseil.fr',
          linkedin: 'https://linkedin.com/in/marie-dubois-expert',
          phone: '+33 5 56 78 90 12',
          status: 'ACTIVE',
          verified: true,
          completionScore: 100,
          rating: 4.9,
          reviewCount: 25,
          expertises: [
            { name: 'Comptabilité', level: 5 },
            { name: 'Finance d\'entreprise', level: 5 },
            { name: 'Fiscalité', level: 4 },
            { name: 'Levée de fonds', level: 4 }
          ],
          createdAt: '2024-01-20T09:15:00Z'
        },
        {
          id: 4,
          name: 'Pierre Martin',
          email: 'p.martin@mentortech.fr',
          profileType: 'MENTOR',
          company: 'MentorTech',
          location: 'Toulouse, France',
          description: 'Serial entrepreneur et mentor expérimenté. J\'accompagne les entrepreneurs tech dans le développement de leur stratégie et leur croissance.',
          linkedin: 'https://linkedin.com/in/pierre-martin-mentor',
          phone: '+33 6 12 34 56 78',
          status: 'ACTIVE',
          verified: true,
          completionScore: 90,
          rating: 4.7,
          reviewCount: 18,
          expertises: [
            { name: 'Stratégie d\'entreprise', level: 5 },
            { name: 'Marketing', level: 4 },
            { name: 'Levée de fonds', level: 5 },
            { name: 'Management', level: 4 }
          ],
          createdAt: '2024-01-25T16:45:00Z'
        },
        {
          id: 5,
          name: 'Capital Innovation Fund',
          email: 'contact@capital-innovation.fr',
          profileType: 'INVESTOR',
          company: 'Capital Innovation Fund',
          location: 'Paris, France',
          description: 'Fonds d\'investissement spécialisé dans les startups tech en phase d\'amorçage et de développement. Ticket de 100k€ à 2M€.',
          website: 'https://capital-innovation.fr',
          linkedin: 'https://linkedin.com/company/capital-innovation',
          status: 'ACTIVE',
          verified: true,
          completionScore: 85,
          rating: 4.5,
          reviewCount: 15,
          expertises: [
            { name: 'Investissement', level: 5 },
            { name: 'Due Diligence', level: 5 },
            { name: 'FinTech', level: 4 },
            { name: 'SaaS', level: 4 }
          ],
          createdAt: '2024-02-01T11:30:00Z'
        },
        {
          id: 6,
          name: 'TechStart Incubator',
          email: 'hello@techstart-incubator.fr',
          profileType: 'INCUBATOR',
          company: 'TechStart Incubator',
          location: 'Nantes, France',
          description: 'Incubateur technologique accompagnant les startups de l\'idée au marché. Programme de 6 mois avec financement et mentorat.',
          website: 'https://techstart-incubator.fr',
          linkedin: 'https://linkedin.com/company/techstart-incubator',
          status: 'ACTIVE',
          verified: true,
          completionScore: 80,
          rating: 4.3,
          reviewCount: 22,
          expertises: [
            { name: 'Incubation', level: 5 },
            { name: 'Coaching', level: 4 },
            { name: 'Réseau', level: 5 },
            { name: 'Innovation', level: 4 }
          ],
          createdAt: '2024-01-30T13:20:00Z'
        }
      ];
      setProfiles(mockProfiles);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort profiles
  const filteredAndSortedProfiles = profiles
    .filter(profile => {
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.expertises.some(exp => exp.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = !filterType || profile.profileType === filterType;
      const matchesLocation = !filterLocation || profile.location.toLowerCase().includes(filterLocation.toLowerCase());
      return matchesSearch && matchesType && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'completion':
          return b.completionScore - a.completionScore;
        case 'company':
          return a.company.localeCompare(b.company);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleCreateProfile = (newProfile) => {
    setProfiles([newProfile, ...profiles]);
  };

  const handleEditProfile = (updatedProfile) => {
    setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setEditingProfile(null);
  };

  const handleConnect = (profile) => {
    alert(`Demande de connexion envoyée à ${profile.name} !`);
  };

  const getProfileIcon = (type) => {
    const icons = {
      'PME': '🏢',
      'STARTUP': '🚀',
      'EXPERT': '🧠',
      'CONSULTANT': '💼',
      'MENTOR': '🎯',
      'INCUBATOR': '🌱',
      'INVESTOR': '💰',
      'FINANCIAL_INSTITUTION': '🏦',
      'PUBLIC_ORGANIZATION': '🏛️',
      'TECH_PARTNER': '⚡'
    };
    return icons[type] || '👤';
  };

  const getProfileTypeColor = (type) => {
    const colors = {
      'PME': 'bg-blue-100 text-blue-800',
      'STARTUP': 'bg-green-100 text-green-800',
      'EXPERT': 'bg-purple-100 text-purple-800',
      'CONSULTANT': 'bg-indigo-100 text-indigo-800',
      'MENTOR': 'bg-yellow-100 text-yellow-800',
      'INCUBATOR': 'bg-pink-100 text-pink-800',
      'INVESTOR': 'bg-red-100 text-red-800',
      'FINANCIAL_INSTITUTION': 'bg-blue-100 text-blue-800',
      'PUBLIC_ORGANIZATION': 'bg-gray-100 text-gray-800',
      'TECH_PARTNER': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement des profils...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏷️ Gestion des Profils</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            {viewMode === 'grid' ? '📋 Liste' : '📊 Grille'}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ➕ Nouveau profil
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total profils</p>
              <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vérifiés</p>
              <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => p.verified).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {profiles.length > 0 ? (profiles.reduce((sum, p) => sum + p.rating, 0) / profiles.length).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Complétude moy.</p>
              <p className="text-2xl font-bold text-gray-900">
                {profiles.length > 0 ? Math.round(profiles.reduce((sum, p) => sum + p.completionScore, 0) / profiles.length) : '0'}%
              </p>
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
              placeholder="Rechercher par nom, entreprise, expertise..."
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
            <option value="">Tous les profils</option>
            <option value="PME">🏢 PME</option>
            <option value="STARTUP">🚀 Startups</option>
            <option value="EXPERT">🧠 Experts</option>
            <option value="CONSULTANT">💼 Consultants</option>
            <option value="MENTOR">🎯 Mentors</option>
            <option value="INCUBATOR">🌱 Incubateurs</option>
            <option value="INVESTOR">💰 Investisseurs</option>
            <option value="FINANCIAL_INSTITUTION">🏦 Institutions Financières</option>
            <option value="PUBLIC_ORGANIZATION">🏛️ Organismes Publics</option>
            <option value="TECH_PARTNER">⚡ Partenaires Tech</option>
          </select>
          <input
            type="text"
            placeholder="Localisation..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Nom A-Z</option>
            <option value="company">Entreprise</option>
            <option value="rating">Mieux notés</option>
            <option value="completion">Plus complets</option>
          </select>
        </div>
      </div>

      {/* Profiles Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredAndSortedProfiles.map((profile) => (
          <div key={profile.id} className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
            viewMode === 'list' ? 'p-4' : 'p-6'
          }`}>
            <div className={viewMode === 'list' ? 'flex items-center space-x-4' : ''}>
              <div className={viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{getProfileIcon(profile.profileType)}</span>
                  {profile.verified && (
                    <span className="text-green-500" title="Profil vérifié">✅</span>
                  )}
                </div>
              </div>
              
              <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getProfileTypeColor(profile.profileType)}`}>
                    {profile.profileType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {profile.completionScore}% complété
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{profile.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{profile.company}</p>
                <p className="text-xs text-gray-500 mb-2">{profile.location}</p>
                
                {viewMode === 'grid' && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{profile.description}</p>
                )}
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((star) => (
                      <span key={star} className={`text-sm ${star <= profile.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({profile.reviewCount})</span>
                </div>

                {viewMode === 'grid' && profile.expertises && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {profile.expertises.slice(0, 3).map((expertise, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {expertise.name}
                      </span>
                    ))}
                    {profile.expertises.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{profile.expertises.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={`flex ${viewMode === 'list' ? 'ml-auto space-x-2' : 'space-x-2'}`}>
              <button
                onClick={() => setSelectedProfile(profile)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                👁️ Voir
              </button>
              {user?.id !== profile.id ? (
                <button
                  onClick={() => handleConnect(profile)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  🤝 Contacter
                </button>
              ) : (
                <button
                  onClick={() => setEditingProfile(profile)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  ✏️ Modifier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedProfiles.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">🔍</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun profil trouvé</h3>
          <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <ProfileEditModal
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreateProfile}
        />
      )}

      {editingProfile && (
        <ProfileEditModal
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSave={handleEditProfile}
        />
      )}

      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onConnect={handleConnect}
          onEdit={setEditingProfile}
        />
      )}
    </div>
  );
}

function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Mock resources data
  useEffect(() => {
    setTimeout(() => {
      const mockResources = [
        {
          id: 1,
          title: 'Guide complet de création d\'entreprise',
          description: 'Guide détaillé pour créer son entreprise en France : démarches administratives, choix du statut juridique, business plan, financements.',
          category: 'guide',
          type: 'pdf',
          author: 'Marie Dubois',
          uploadDate: '2024-08-15T10:00:00Z',
          downloads: 1247,
          rating: 4.8,
          reviews: 156,
          size: '3.2 MB',
          icon: '📖',
          tags: ['Création', 'Administratif', 'Business Plan', 'Statut juridique'],
          isPublic: true
        },
        {
          id: 2,
          title: 'Modèle de Business Plan',
          description: 'Template complet de business plan avec exemples et conseils pour présenter votre projet aux investisseurs.',
          category: 'template',
          type: 'doc',
          author: 'Pierre Martin',
          uploadDate: '2024-08-10T14:30:00Z',
          downloads: 892,
          rating: 4.6,
          reviews: 98,
          size: '1.8 MB',
          icon: '📄',
          tags: ['Business Plan', 'Template', 'Investissement', 'Présentation'],
          isPublic: true
        },
        {
          id: 3,
          title: 'Formation Marketing Digital',
          description: 'Série de vidéos pour maîtriser le marketing digital : SEO, réseaux sociaux, publicité en ligne, email marketing.',
          category: 'formation',
          type: 'video',
          author: 'Sophie Laurent',
          uploadDate: '2024-08-05T16:00:00Z',
          downloads: 567,
          rating: 4.9,
          reviews: 203,
          size: '1.2 GB',
          icon: '🎓',
          tags: ['Marketing', 'Digital', 'SEO', 'Réseaux sociaux'],
          isPublic: true
        },
        {
          id: 4,
          title: 'Contrats types pour startups',
          description: 'Collection de modèles de contrats essentiels : NDA, contrats employés, partenariats, prestations de service.',
          category: 'legal',
          type: 'pdf',
          author: 'Thomas Durand',
          uploadDate: '2024-07-28T09:15:00Z',
          downloads: 445,
          rating: 4.4,
          reviews: 67,
          size: '2.1 MB',
          icon: '⚖️',
          tags: ['Contrats', 'Juridique', 'NDA', 'Employés'],
          isPublic: true
        },
        {
          id: 5,
          title: 'Tableaux de bord financiers Excel',
          description: 'Modèles Excel pour le suivi financier : trésorerie, prévisionnel, suivi des ventes, calcul de rentabilité.',
          category: 'finance',
          type: 'doc',
          author: 'Julie Moreau',
          uploadDate: '2024-07-20T11:45:00Z',
          downloads: 789,
          rating: 4.7,
          reviews: 124,
          size: '4.5 MB',
          icon: '💰',
          tags: ['Finance', 'Excel', 'Trésorerie', 'Suivi'],
          isPublic: true
        },
        {
          id: 6,
          title: 'Pitch Deck Template',
          description: 'Modèle de présentation PowerPoint pour pitcher votre startup devant des investisseurs avec exemples et conseils.',
          category: 'template',
          type: 'presentation',
          author: 'Lucas Bernard',
          uploadDate: '2024-07-15T13:20:00Z',
          downloads: 634,
          rating: 4.5,
          reviews: 89,
          size: '15.3 MB',
          icon: '📊',
          tags: ['Pitch', 'Présentation', 'Investisseurs', 'Startup'],
          isPublic: true
        }
      ];
      setResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort resources
  const filteredAndSortedResources = resources
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !filterCategory || resource.category === filterCategory;
      const matchesType = !filterType || resource.type === filterType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });

  const handleCreateResource = (newResource) => {
    setResources([newResource, ...resources]);
  };

  const handleDownload = (resource) => {
    // Simulate download
    alert(`Téléchargement de "${resource.title}" commencé !`);
    // In real app, this would trigger actual download
    const updatedResources = resources.map(r =>
      r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r
    );
    setResources(updatedResources);
  };

  const handleRate = (resourceId, rating, comment) => {
    const updatedResources = resources.map(r => {
      if (r.id === resourceId) {
        const newReviews = r.reviews + 1;
        const newRating = ((r.rating * r.reviews) + rating) / newReviews;
        return { ...r, rating: Math.round(newRating * 10) / 10, reviews: newReviews };
      }
      return r;
    });
    setResources(updatedResources);
    alert('Merci pour votre évaluation !');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement des ressources...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📚 Bibliothèque de ressources</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ➕ Ajouter une ressource
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total ressources</p>
              <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">📥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Téléchargements</p>
              <p className="text-2xl font-bold text-gray-900">{resources.reduce((sum, r) => sum + r.downloads, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {resources.length > 0 ? (resources.reduce((sum, r) => sum + r.rating, 0) / resources.length).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avis</p>
              <p className="text-2xl font-bold text-gray-900">{resources.reduce((sum, r) => sum + r.reviews, 0)}</p>
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
              placeholder="Rechercher des ressources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les catégories</option>
            <option value="guide">Guides</option>
            <option value="template">Modèles</option>
            <option value="formation">Formations</option>
            <option value="legal">Juridique</option>
            <option value="finance">Finance</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="video">Vidéo</option>
            <option value="presentation">Présentation</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Plus récent</option>
            <option value="downloads">Plus téléchargé</option>
            <option value="rating">Mieux noté</option>
            <option value="title">Alphabétique</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{resource.icon}</span>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    resource.category === 'guide' ? 'bg-blue-100 text-blue-800' :
                    resource.category === 'template' ? 'bg-green-100 text-green-800' :
                    resource.category === 'formation' ? 'bg-purple-100 text-purple-800' :
                    resource.category === 'legal' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {resource.category}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    resource.type === 'pdf' ? 'bg-red-100 text-red-800' :
                    resource.type === 'video' ? 'bg-blue-100 text-blue-800' :
                    resource.type === 'doc' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {resource.type.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{resource.description}</p>
              
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className={`text-sm ${star <= resource.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({resource.reviews})</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Par {resource.author} • {resource.downloads} téléchargements • {resource.size}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedResource(resource)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  👁️ Détails
                </button>
                <button
                  onClick={() => handleDownload(resource)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  📥 Télécharger
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedResources.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">📚</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ressource trouvée</h3>
          <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <CreateResourceModal
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreateResource}
        />
      )}

      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onDownload={handleDownload}
          onRate={handleRate}
        />
      )}
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
          <Route path="profiles" element={<ProfilesPage />} />
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