import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ ...formData, rememberMe });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Bon retour sur PME 360
          </h1>
          <p className="mt-3 text-gray-600 max-w-sm mx-auto">
            Connectez-vous pour accéder à votre écosystème d'entreprise personnalisé
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-3" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600">
                Nouveau sur PME 360 ?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Créez votre compte gratuitement
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
            Comptes de démonstration
          </h3>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-white rounded border">
              <span className="font-medium">Admin</span>
              <span className="text-gray-600">admin@pme360.com / admin123</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border">
              <span className="font-medium">Utilisateur test</span>
              <span className="text-gray-600">test@example.com / password123</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Une question ? Contactez-nous à{' '}
            <a href="mailto:support@pme360.com" className="text-blue-600 hover:text-blue-500">
              support@pme360.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;