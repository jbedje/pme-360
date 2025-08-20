import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  BellIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface DashboardStats {
  total: number;
  recent: number;
  change: number;
}

interface ProfileStats {
  connections: DashboardStats;
  messages: DashboardStats;
  opportunities: DashboardStats;
  events: DashboardStats;
  applications?: DashboardStats;
  projects?: DashboardStats;
}

interface Activity {
  id: string;
  type: 'message' | 'opportunity' | 'event' | 'connection' | 'application' | 'resource';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'new' | 'pending' | 'completed';
}

interface Notification {
  id: string;
  type: 'connection_request' | 'application_accepted' | 'event_reminder' | 'message' | 'opportunity_match' | 'system';
  title: string;
  message: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  actionUrl?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    connections: { total: 0, recent: 0, change: 0 },
    messages: { total: 0, recent: 0, change: 0 },
    opportunities: { total: 0, recent: 0, change: 0 },
    events: { total: 0, recent: 0, change: 0 }
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile-specific configurations
  const getProfileConfig = (profileType: string) => {
    const configs = {
      'STARTUP': {
        title: 'Tableau de bord Startup',
        subtitle: 'Développez votre entreprise avec PME 360',
        primaryColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        quickActions: [
          { label: 'Chercher investisseurs', icon: UsersIcon, href: '/users?type=INVESTOR', color: 'btn-primary' },
          { label: 'Publier opportunité', icon: BriefcaseIcon, href: '/opportunities/create', color: 'btn-outline' },
          { label: 'Rejoindre événement', icon: CalendarDaysIcon, href: '/events', color: 'btn-outline' },
          { label: 'Demander mentorat', icon: ChatBubbleLeftRightIcon, href: '/users?type=MENTOR', color: 'btn-ghost' }
        ],
        focusMetrics: ['opportunities', 'applications', 'connections', 'events']
      },
      'EXPERT': {
        title: 'Tableau de bord Expert',
        subtitle: 'Partagez votre expertise et développez votre réseau',
        primaryColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        quickActions: [
          { label: 'Consulter opportunités', icon: BriefcaseIcon, href: '/opportunities', color: 'btn-primary' },
          { label: 'Publier ressource', icon: BookOpenIcon, href: '/resources/create', color: 'btn-outline' },
          { label: 'Organiser événement', icon: CalendarDaysIcon, href: '/events/create', color: 'btn-outline' },
          { label: 'Voir messages', icon: ChatBubbleLeftRightIcon, href: '/messages', color: 'btn-ghost' }
        ],
        focusMetrics: ['opportunities', 'messages', 'events', 'connections']
      },
      'MENTOR': {
        title: 'Tableau de bord Mentor',
        subtitle: 'Accompagnez les entrepreneurs vers le succès',
        primaryColor: 'text-green-600',
        bgColor: 'bg-green-50',
        quickActions: [
          { label: 'Voir mes mentorés', icon: UsersIcon, href: '/users?mentored=true', color: 'btn-primary' },
          { label: 'Planifier session', icon: CalendarDaysIcon, href: '/events/create', color: 'btn-outline' },
          { label: 'Créer ressource', icon: BookOpenIcon, href: '/resources/create', color: 'btn-outline' },
          { label: 'Messages mentorés', icon: ChatBubbleLeftRightIcon, href: '/messages', color: 'btn-ghost' }
        ],
        focusMetrics: ['connections', 'messages', 'events', 'opportunities']
      },
      'INCUBATOR': {
        title: 'Tableau de bord Incubateur',
        subtitle: 'Accompagnez les startups innovantes',
        primaryColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        quickActions: [
          { label: 'Évaluer candidatures', icon: BriefcaseIcon, href: '/applications', color: 'btn-primary' },
          { label: 'Organiser pitch', icon: CalendarDaysIcon, href: '/events/create', color: 'btn-outline' },
          { label: 'Publier programme', icon: BookOpenIcon, href: '/resources/create', color: 'btn-outline' },
          { label: 'Contacter startups', icon: ChatBubbleLeftRightIcon, href: '/users?type=STARTUP', color: 'btn-ghost' }
        ],
        focusMetrics: ['applications', 'events', 'opportunities', 'connections']
      },
      'INVESTOR': {
        title: 'Tableau de bord Investisseur',
        subtitle: 'Découvrez les meilleures opportunités d\'investissement',
        primaryColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        quickActions: [
          { label: 'Explorer startups', icon: UsersIcon, href: '/users?type=STARTUP', color: 'btn-primary' },
          { label: 'Voir opportunités', icon: BriefcaseIcon, href: '/opportunities?type=FUNDING', color: 'btn-outline' },
          { label: 'Événements pitch', icon: CalendarDaysIcon, href: '/events?type=PITCH', color: 'btn-outline' },
          { label: 'Portfolio suivi', icon: ChartBarIcon, href: '/dashboard/portfolio', color: 'btn-ghost' }
        ],
        focusMetrics: ['opportunities', 'connections', 'events', 'messages']
      },
      'FINANCIAL_INSTITUTION': {
        title: 'Tableau de bord Institution Financière',
        subtitle: 'Accompagnez les entreprises dans leur financement',
        primaryColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        quickActions: [
          { label: 'Demandes financement', icon: BriefcaseIcon, href: '/opportunities?type=FUNDING', color: 'btn-primary' },
          { label: 'Clients PME', icon: UsersIcon, href: '/users?type=PME', color: 'btn-outline' },
          { label: 'Webinaires', icon: CalendarDaysIcon, href: '/events/create', color: 'btn-outline' },
          { label: 'Guides financiers', icon: BookOpenIcon, href: '/resources?category=finance', color: 'btn-ghost' }
        ],
        focusMetrics: ['opportunities', 'connections', 'events', 'messages']
      },
      'PUBLIC_ORGANIZATION': {
        title: 'Tableau de bord Organisme Public',
        subtitle: 'Soutenez l\'écosystème entrepreneurial',
        primaryColor: 'text-red-600',
        bgColor: 'bg-red-50',
        quickActions: [
          { label: 'Publier aide publique', icon: BriefcaseIcon, href: '/opportunities/create', color: 'btn-primary' },
          { label: 'Organiser forum', icon: CalendarDaysIcon, href: '/events/create', color: 'btn-outline' },
          { label: 'Guides réglementaires', icon: BookOpenIcon, href: '/resources/create', color: 'btn-outline' },
          { label: 'Statistiques secteur', icon: ChartBarIcon, href: '/dashboard/stats', color: 'btn-ghost' }
        ],
        focusMetrics: ['opportunities', 'events', 'connections', 'messages']
      },
      'TECH_PARTNER': {
        title: 'Tableau de bord Partenaire Tech',
        subtitle: 'Connectez-vous avec l\'écosystème technologique',
        primaryColor: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        quickActions: [
          { label: 'Partenariats tech', icon: UsersIcon, href: '/users?partnership=true', color: 'btn-primary' },
          { label: 'Solutions proposées', icon: BriefcaseIcon, href: '/opportunities?type=SERVICE', color: 'btn-outline' },
          { label: 'Tech talks', icon: CalendarDaysIcon, href: '/events?type=TECH', color: 'btn-outline' },
          { label: 'Documentation API', icon: BookOpenIcon, href: '/resources?type=TECH', color: 'btn-ghost' }
        ],
        focusMetrics: ['connections', 'opportunities', 'events', 'messages']
      },
      'PME': {
        title: 'Tableau de bord PME',
        subtitle: 'Développez votre entreprise avec nos outils',
        primaryColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        quickActions: [
          { label: 'Chercher experts', icon: UsersIcon, href: '/users?type=EXPERT', color: 'btn-primary' },
          { label: 'Besoins financement', icon: BriefcaseIcon, href: '/opportunities/create?type=FUNDING', color: 'btn-outline' },
          { label: 'Formations', icon: CalendarDaysIcon, href: '/events?type=FORMATION', color: 'btn-outline' },
          { label: 'Outils PME', icon: BookOpenIcon, href: '/resources?category=pme', color: 'btn-ghost' }
        ],
        focusMetrics: ['connections', 'opportunities', 'events', 'messages']
      }
    };

    return configs[profileType as keyof typeof configs] || configs['PME'];
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls for now - will be replaced with real API calls
        setTimeout(() => {
          // Mock statistics based on profile type
          const mockStats: ProfileStats = {
            connections: { total: 45, recent: 5, change: 12 },
            messages: { total: 23, recent: 3, change: 8 },
            opportunities: { total: 12, recent: 2, change: -5 },
            events: { total: 8, recent: 1, change: 15 }
          };

          if (user?.profileType === 'STARTUP' || user?.profileType === 'EXPERT') {
            mockStats.applications = { total: 6, recent: 1, change: 20 };
          }

          // Mock recent activities
          const mockActivities: Activity[] = [
            {
              id: '1',
              type: 'message',
              title: 'Nouveau message de Marie Dupont',
              description: 'Concernant le projet de partenariat fintech...',
              time: 'Il y a 2h',
              priority: 'high',
              status: 'new'
            },
            {
              id: '2',
              type: 'opportunity',
              title: 'Opportunité correspondante trouvée',
              description: 'Développeur React - Startup fintech Paris',
              time: 'Il y a 4h',
              priority: 'medium'
            },
            {
              id: '3',
              type: 'event',
              title: 'Rappel : Conférence Innovation demain',
              description: 'Inscription confirmée - Palais des Congrès',
              time: 'Il y a 6h',
              priority: 'high'
            },
            {
              id: '4',
              type: 'connection',
              title: 'Nouvelle connexion acceptée',
              description: 'Jean Martin (Investisseur) a accepté votre demande',
              time: 'Il y a 1j',
              priority: 'low',
              status: 'completed'
            }
          ];

          // Mock notifications
          const mockNotifications: Notification[] = [
            {
              id: '1',
              type: 'connection_request',
              title: 'Demande de connexion',
              message: 'Sophie Moreau souhaite se connecter avec vous',
              time: 'Il y a 1h',
              priority: 'medium',
              actionRequired: true,
              actionUrl: '/connections/pending'
            },
            {
              id: '2',
              type: 'application_accepted',
              title: 'Candidature acceptée !',
              message: 'Votre candidature pour "Consultant FinTech" a été acceptée',
              time: 'Il y a 3h',
              priority: 'high',
              actionRequired: false
            },
            {
              id: '3',
              type: 'event_reminder',
              title: 'Événement dans 2h',
              message: '"Networking Entrepreneurs" commence bientôt',
              time: 'Il y a 30min',
              priority: 'high',
              actionRequired: true,
              actionUrl: '/events/networking-entrepreneurs'
            }
          ];

          setStats(mockStats);
          setActivities(mockActivities);
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.profileType]);

  const config = getProfileConfig(user?.profileType || 'PME');

  const getStatIcon = (metric: string) => {
    const icons = {
      connections: UsersIcon,
      messages: ChatBubbleLeftRightIcon,
      opportunities: BriefcaseIcon,
      events: CalendarDaysIcon,
      applications: BriefcaseIcon,
      projects: ChartBarIcon
    };
    return icons[metric as keyof typeof icons] || ChartBarIcon;
  };

  const getStatColor = (metric: string) => {
    const colors = {
      connections: { text: 'text-blue-600', bg: 'bg-blue-100' },
      messages: { text: 'text-green-600', bg: 'bg-green-100' },
      opportunities: { text: 'text-purple-600', bg: 'bg-purple-100' },
      events: { text: 'text-orange-600', bg: 'bg-orange-100' },
      applications: { text: 'text-red-600', bg: 'bg-red-100' },
      projects: { text: 'text-indigo-600', bg: 'bg-indigo-100' }
    };
    return colors[metric as keyof typeof colors] || colors.connections;
  };

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      message: ChatBubbleLeftRightIcon,
      opportunity: BriefcaseIcon,
      event: CalendarDaysIcon,
      connection: UsersIcon,
      application: BriefcaseIcon,
      resource: BookOpenIcon
    };
    return icons[type];
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      connection_request: UsersIcon,
      application_accepted: CheckCircleIcon,
      event_reminder: ClockIcon,
      message: ChatBubbleLeftRightIcon,
      opportunity_match: BriefcaseIcon,
      system: InformationCircleIcon
    };
    return icons[type];
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-green-500 bg-green-50'
    };
    return colors[priority];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Personalized by Profile */}
      <div className={`rounded-lg shadow-sm p-6 ${config.bgColor} border`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {config.title} 👋
            </h1>
            <p className="mt-1 text-gray-700">
              {config.subtitle}
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {user?.company || 'Non renseigné'}
              </div>
              {user?.location && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`badge-primary ${config.primaryColor}`}>
              {user?.profileType}
            </span>
            {user?.verified && (
              <span className="badge-success flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Vérifié
              </span>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
              Complétude: {user?.completionScore || 30}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Focus on profile-relevant stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {config.focusMetrics.map((metric) => {
          const statData = stats[metric as keyof ProfileStats] as DashboardStats;
          if (!statData) return null;
          
          const IconComponent = getStatIcon(metric);
          const colors = getStatColor(metric);
          const changePositive = statData.change >= 0;
          
          return (
            <div key={metric} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {metric === 'connections' ? 'Connexions' :
                       metric === 'messages' ? 'Messages' :
                       metric === 'opportunities' ? 'Opportunités' :
                       metric === 'events' ? 'Événements' :
                       metric === 'applications' ? 'Candidatures' : metric}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statData.total.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <IconComponent className={`h-6 w-6 ${colors.text}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className={`flex items-center ${changePositive ? 'text-green-600' : 'text-red-600'}`}>
                    {changePositive ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(statData.change)}%
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                  {statData.recent > 0 && (
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full ml-auto">
                      +{statData.recent} nouveau{statData.recent > 1 ? 'x' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Profile-specific actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`${action.color} btn-md w-full flex items-center justify-center hover:scale-105 transition-transform`}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
              <Link to="/activities" className="text-sm text-primary-600 hover:text-primary-500">
                Voir tout
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div 
                    key={activity.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${getPriorityColor(activity.priority)}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                        {activity.status === 'new' && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Smart Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {notifications.filter(n => n.actionRequired).length} actions requises
                </span>
                <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-500">
                  Voir tout
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const priorityColors = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-yellow-200 bg-yellow-50', 
                  low: 'border-green-200 bg-green-50'
                };
                
                return (
                  <div 
                    key={notification.id} 
                    className={`flex items-center p-3 rounded-lg border ${priorityColors[notification.priority]}`}
                  >
                    <IconComponent className={`h-5 w-5 mr-3 ${
                      notification.priority === 'high' ? 'text-red-600' :
                      notification.priority === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {notification.actionRequired && (
                      <div className="flex space-x-2">
                        <button className="btn-primary btn-sm">Action</button>
                        <button className="btn-ghost btn-sm">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights - Profile specific insights */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Insights personnalisés</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">85%</div>
              <div className="text-sm text-gray-600 mt-1">Profil complété</div>
              <div className="text-xs text-gray-400 mt-1">
                Ajoutez vos compétences pour améliorer votre visibilité
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600 mt-1">Connexions cette semaine</div>
              <div className="text-xs text-gray-400 mt-1">
                +20% par rapport à la semaine dernière
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-gray-600 mt-1">Note moyenne</div>
              <div className="text-xs text-gray-400 mt-1">
                Basée sur 23 évaluations
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;