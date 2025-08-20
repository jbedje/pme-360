import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface ProfileTypeOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProfileType, setSelectedProfileType] = useState<string>('');
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: '',
    profileType: 'PME',
    company: '',
    location: '',
    description: '',
    website: '',
    phone: ''
  });

  const profileTypes: ProfileTypeOption[] = [
    {
      value: 'PME',
      label: 'PME',
      description: 'Petites et Moyennes Entreprises cherchant à se développer',
      icon: '🏢',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      value: 'STARTUP',
      label: 'Startup',
      description: 'Jeunes entreprises innovantes en phase de croissance',
      icon: '🚀',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200'
    },
    {
      value: 'EXPERT',
      label: 'Expert / Consultant',
      description: 'Experts sectoriels et consultants indépendants',
      icon: '🧠',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      value: 'MENTOR',
      label: 'Mentor',
      description: 'Accompagnateurs et mentors d\'entrepreneurs',
      icon: '👨‍🏫',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200'
    },
    {
      value: 'INCUBATOR',
      label: 'Incubateur',
      description: 'Structures d\'accompagnement et d\'accélération',
      icon: '🏛️',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    {
      value: 'INVESTOR',
      label: 'Investisseur',
      description: 'Investisseurs privés et fonds d\'investissement',
      icon: '💰',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200'
    },
    {
      value: 'FINANCIAL_INSTITUTION',
      label: 'Institution Financière',
      description: 'Banques et organismes de financement',
      icon: '🏦',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200'
    },
    {
      value: 'PUBLIC_ORGANIZATION',
      label: 'Organisme Public',
      description: 'Institutions publiques et organismes gouvernementaux',
      icon: '🏛️',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    {
      value: 'TECH_PARTNER',
      label: 'Partenaire Technologique',
      description: 'Fournisseurs de solutions technologiques',
      icon: '⚡',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 border-cyan-200'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleProfileTypeSelect = (profileType: string) => {
    setSelectedProfileType(profileType);
    setFormData(prev => ({
      ...prev,
      profileType
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedProfileType;
      case 2:
        return !!(formData.name && formData.email && formData.password);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the context
    }
  };

  const getSelectedProfileType = () => {
    return profileTypes.find(type => type.value === selectedProfileType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Rejoignez PME 360
          </h1>
          <p className="mt-3 text-gray-600 max-w-lg mx-auto">
            Créez votre compte et rejoignez l'écosystème d'entraide des entreprises françaises
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  step <= currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step < currentStep ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all duration-200 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-500">
            <span>Type de profil</span>
            <span>Informations</span>
            <span>Finalisation</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Step 1: Profile Type Selection */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Quel est votre profil ?
                </h2>
                <p className="mt-2 text-gray-600">
                  Sélectionnez le type qui correspond le mieux à votre activité
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleProfileTypeSelect(type.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      selectedProfileType === type.value
                        ? `${type.bgColor} border-current shadow-md`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <h3 className={`font-semibold ${selectedProfileType === type.value ? type.color : 'text-gray-900'}`}>
                        {type.label}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!validateStep(1)}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vos informations personnelles
                </h2>
                <p className="mt-2 text-gray-600">
                  Renseignez vos informations de base pour créer votre compte
                </p>
                {selectedProfileType && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className="mr-2">{getSelectedProfileType()?.icon}</span>
                    {getSelectedProfileType()?.label}
                  </div>
                )}
              </div>

              <form className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse e-mail *
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Créez un mot de passe sécurisé"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Minimum 8 caractères avec au moins une lettre et un chiffre
                  </p>
                </div>
              </form>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={prevStep}
                  className="btn-ghost flex items-center"
                >
                  ← Retour
                </button>
                <button
                  onClick={nextStep}
                  disabled={!validateStep(2)}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Information & Finalization */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complétez votre profil
                </h2>
                <p className="mt-2 text-gray-600">
                  Ces informations nous aideront à personnaliser votre expérience
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de votre entreprise"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    Localisation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ville, Région, Pays"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://votre-site.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description de votre activité
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Décrivez brièvement votre activité, vos compétences ou ce que vous recherchez..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-700">
                        J'accepte les{' '}
                        <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                          conditions d'utilisation
                        </Link>{' '}
                        et la{' '}
                        <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                          politique de confidentialité
                        </Link>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-ghost flex items-center"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Création du compte...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Connectez-vous
            </Link>
          </p>
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

export default RegisterPage;