import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Utilisateurs',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Messages',
      value: '23',
      change: '+5',
      changeType: 'positive' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Opportunités',
      value: '45',
      change: '+8',
      changeType: 'positive' as const,
      icon: BriefcaseIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Événements',
      value: '12',
      change: '+2',
      changeType: 'positive' as const,
      icon: CalendarDaysIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'message',
      title: 'Nouveau message de Marie Dupont',
      description: 'Concernant le projet de partenariat...',
      time: 'Il y a 2h',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Nouvelle opportunité publiée',
      description: 'Recherche de développeur React...',
      time: 'Il y a 4h',
      icon: BriefcaseIcon,
    },
    {
      id: 3,
      type: 'event',
      title: 'Rappel : Conférence Innovation',
      description: 'Demain à 14h00 - Palais des Congrès',
      time: 'Il y a 6h',
      icon: CalendarDaysIcon,
    },
    {
      id: 4,
      type: 'resource',
      title: 'Nouveau guide disponible',
      description: 'Guide de financement pour startups',
      time: 'Il y a 1j',
      icon: BookOpenIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {user?.firstName} ! 👋
            </h1>
            <p className="mt-1 text-gray-600">
              Bienvenue sur votre tableau de bord PME 360
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="badge-primary">
              {user?.profileType}
            </span>
            {user?.companyName && (
              <span className="badge-secondary">
                {user.companyName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-success-600 font-medium">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-outline btn-md w-full">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Nouveau message
              </button>
              <button className="btn-outline btn-md w-full">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Publier opportunité
              </button>
              <button className="btn-outline btn-md w-full">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Créer événement
              </button>
              <button className="btn-outline btn-md w-full">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Ajouter ressource
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Notifications récentes</h3>
            <button className="text-sm text-primary-600 hover:text-primary-500">
              Voir toutes
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <BellIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nouvelle demande de connexion
                </p>
                <p className="text-sm text-gray-600">
                  Jean Martin souhaite se connecter avec vous
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="btn-primary btn-sm">Accepter</button>
                <button className="btn-ghost btn-sm">Refuser</button>
              </div>
            </div>

            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <BellIcon className="h-5 w-5 text-green-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Candidature acceptée
                </p>
                <p className="text-sm text-gray-600">
                  Votre candidature pour le projet "App mobile" a été acceptée
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Voir détails
              </button>
            </div>

            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <BellIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Événement à venir
                </p>
                <p className="text-sm text-gray-600">
                  "Networking PME" commence dans 2 heures
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;