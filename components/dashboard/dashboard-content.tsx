'use client';

import { useAuth } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar,
  BarChart3,
  Shield,
  Target,
  Clock,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { useUsers } from '@/lib/users-context';
import { useCommissionsExtrapolation } from '@/lib/use-commissions-extrapolation';

const dashboardData = {
  administrateur: {
    title: 'Tableau de bord - Agent Général',
    stats: [
      { icon: Users, label: 'Équipe', value: '12', change: '+2 ce mois', color: 'text-blue-600 dark:text-blue-400' },
      { icon: TrendingUp, label: 'CA Total', value: '1.2M€', change: '+15%', color: 'text-green-600 dark:text-green-400' },
      { icon: DollarSign, label: 'Ratio Commissions/ETP', value: 'Calculé dynamiquement', change: 'Proj. année en cours', color: 'text-purple-600 dark:text-purple-400' },
      { icon: TrendingUp, label: 'Commissions Extrapolées', value: 'Calculé dynamiquement', change: 'Proj. année en cours', color: 'text-indigo-600 dark:text-indigo-400' },
    ],
    cards: [
      {
        title: 'Performances de l\'équipe',
        description: 'Vue d\'ensemble des performances commerciales',
        icon: BarChart3,
        content: 'Équipe performante avec une progression de 15% ce trimestre'
      },
      {
        title: 'Gestion administrative',
        description: 'Outils de supervision et d\'administration',
        icon: Shield,
        content: 'Accès complet aux paramètres et configurations'
      }
    ]
  },
  cdc_sante_coll: {
    title: 'Tableau de bord - CDC Santé Collective',
    stats: [
      { icon: Users, label: 'Entreprises clientes', value: '24', change: '+2 ce mois', color: 'text-blue-600 dark:text-blue-400' },
      { icon: TrendingUp, label: 'CA Santé Coll.', value: '180K€', change: '+12%', color: 'text-green-600 dark:text-green-400' },
      { icon: Shield, label: 'Taux de service', value: '96%', change: '+1%', color: 'text-indigo-600 dark:text-indigo-400' },
      { icon: FileText, label: 'Contrats actifs', value: '156', change: '+8 ce mois', color: 'text-purple-600 dark:text-purple-400' },
    ],
    cards: [
      {
        title: 'Portefeuille entreprises',
        description: 'Gestion des contrats santé collective',
        icon: Users,
        content: '24 entreprises clientes avec 156 contrats actifs'
      },
      {
        title: 'Renouvellements',
        description: 'Échéances et négociations à venir',
        icon: Calendar,
        content: '8 renouvellements prévus ce trimestre'
      }
    ]
  },
  cdc_sante_ind: {
    title: 'Tableau de bord - CDC Santé Individuel',
    stats: [
      { icon: Users, label: 'Clients individuels', value: '342', change: '+15 ce mois', color: 'text-blue-600 dark:text-blue-400' },
      { icon: TrendingUp, label: 'CA Santé Ind.', value: '95K€', change: '+18%', color: 'text-green-600 dark:text-green-400' },
      { icon: Shield, label: 'Satisfaction', value: '92%', change: '+3%', color: 'text-indigo-600 dark:text-indigo-400' },
      { icon: Calendar, label: 'RDV cette semaine', value: '12', change: '5 à venir', color: 'text-purple-600 dark:text-purple-400' },
    ],
    cards: [
      {
        title: 'Portefeuille individuel',
        description: 'Suivi des contrats santé individuels',
        icon: Users,
        content: '342 clients avec un taux de satisfaction de 92%'
      },
      {
        title: 'Prospection',
        description: 'Nouveaux prospects et opportunités',
        icon: Target,
        content: '25 prospects qualifiés en cours de négociation'
      }
    ]
  },
  cdc_sinistre: {
    title: 'Tableau de bord - CDC Sinistre',
    stats: [
      { icon: FileText, label: 'Dossiers en cours', value: '89', change: '-5 cette semaine', color: 'text-orange-600 dark:text-orange-400' },
      { icon: Clock, label: 'Délai moyen', value: '3.2j', change: '-0.5j', color: 'text-green-600 dark:text-green-400' },
      { icon: Shield, label: 'Taux de résolution', value: '94%', change: '+2%', color: 'text-indigo-600 dark:text-indigo-400' },
      { icon: TrendingUp, label: 'Satisfaction client', value: '91%', change: '+1%', color: 'text-blue-600 dark:text-blue-400' },
    ],
    cards: [
      {
        title: 'Gestion des sinistres',
        description: 'Traitement et suivi des dossiers',
        icon: FileText,
        content: '89 dossiers en cours avec un délai moyen de 3.2 jours'
      },
      {
        title: 'Performance',
        description: 'Indicateurs de qualité de service',
        icon: BarChart3,
        content: 'Taux de résolution de 94% et satisfaction client à 91%'
      }
    ]
  },
  cdc_commercial: {
    title: 'Tableau de bord - CDC Commercial',
    stats: [
      { icon: Target, label: 'Objectif mensuel', value: '85%', change: 'En cours', color: 'text-orange-600 dark:text-orange-400' },
      { icon: TrendingUp, label: 'CA Personnel', value: '45K€', change: '+8%', color: 'text-green-600 dark:text-green-400' },
      { icon: Users, label: 'Clients actifs', value: '127', change: '+5 cette semaine', color: 'text-blue-600 dark:text-blue-400' },
      { icon: Calendar, label: 'RDV cette semaine', value: '8', change: '3 à venir', color: 'text-purple-600 dark:text-purple-400' },
    ],
    cards: [
      {
        title: 'Mes performances',
        description: 'Suivi personnel des objectifs et résultats',
        icon: Target,
        content: 'Vous êtes à 85% de votre objectif mensuel'
      },
      {
        title: 'Planning de la semaine',
        description: 'Rendez-vous et tâches à venir',
        icon: Clock,
        content: '8 rendez-vous programmés cette semaine'
      }
    ]
  }
};

export function DashboardContent() {
  const { user } = useAuth();
  const { users, loading } = useUsers();
  const { 
    extrapolatedCommissions, 
    completeMonths, 
    currentYear, 
    isLoading: commissionsLoading, 
    error: commissionsError 
  } = useCommissionsExtrapolation();

  if (!user) return null;

  const data = dashboardData[user.role as keyof typeof dashboardData];

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Configuration du dashboard en cours pour votre rôle
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Bonjour, {user.prenom} !
          </h1>
          <p className="text-blue-100 text-lg">
            {data.title}
          </p>
          <p className="text-blue-200">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'administrateur' ? (
          <>
            {/* KPI Nombre de personnes */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Nombre de personnes
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : users.length}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {loading ? 'Chargement...' : `${users.filter(u => u.prenom && u.nom).length} complètes`}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI ETP Total */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ETP Total
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : users.reduce((sum, u) => sum + (u.etp || 0), 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {loading ? 'Chargement...' : `Moyenne: ${(users.reduce((sum, u) => sum + (u.etp || 0), 0) / users.length || 0).toFixed(1)}`}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 group-hover:scale-110 transition-transform">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Autres stats pour administrateur */}
            {data.stats.slice(2).map((stat, index) => {
              // Calcul dynamique pour les KPIs spéciaux
              const isRatioKPI = stat.label === 'Ratio Commissions/ETP';
              const isCommissionsKPI = stat.label === 'Commissions Extrapolées';
              
              let displayValue = stat.value;
              let displayChange = stat.change;
              
              if (isRatioKPI) {
                displayValue = loading || commissionsLoading ? '...' : 
                  (() => {
                    const etpTotal = users.reduce((sum, u) => sum + (u.etp || 0), 0);
                    const ratio = etpTotal > 0 ? extrapolatedCommissions / etpTotal : 0;
                    return new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.round(ratio));
                  })();
                
                displayChange = loading || commissionsLoading ? 'Chargement...' : 
                  commissionsError ? 'Erreur' :
                  `Proj. ${currentYear} (${completeMonths} mois)`;
              }
              
              if (isCommissionsKPI) {
                displayValue = loading || commissionsLoading ? '...' : 
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Math.round(extrapolatedCommissions));
                
                displayChange = loading || commissionsLoading ? 'Chargement...' : 
                  commissionsError ? 'Erreur' :
                  `Proj. ${currentYear} (${completeMonths} mois complets)`;
              }

              return (
                <Card key={index + 2} className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {displayValue}
                        </p>
                        <p className={`text-sm ${stat.color} font-medium`}>
                          {displayChange}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${
                        stat.color === 'text-blue-600 dark:text-blue-400' ? 'from-blue-500 to-blue-600' :
                        stat.color === 'text-green-600 dark:text-green-400' ? 'from-green-500 to-green-600' :
                        stat.color === 'text-purple-600 dark:text-purple-400' ? 'from-purple-500 to-purple-600' :
                        stat.color === 'text-indigo-600 dark:text-indigo-400' ? 'from-indigo-500 to-indigo-600' :
                        'from-orange-500 to-orange-600'
                      } group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        ) : (
          data.stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.color} font-medium`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${
                    stat.color === 'text-blue-600 dark:text-blue-400' ? 'from-blue-500 to-blue-600' :
                    stat.color === 'text-green-600 dark:text-green-400' ? 'from-green-500 to-green-600' :
                    stat.color === 'text-purple-600 dark:text-purple-400' ? 'from-purple-500 to-purple-600' :
                    stat.color === 'text-indigo-600 dark:text-indigo-400' ? 'from-indigo-500 to-indigo-600' :
                    'from-orange-500 to-orange-600'
                  } group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="space-y-1 flex-1">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  {card.title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {card.description}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {card.content}
              </p>
              <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" 
                     style={{ width: user.role === 'administrateur' ? '100%' : '85%' }}>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.role === 'administrateur' ? (
              <>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium">Gérer l'équipe</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium">Analytics</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium">Contrats</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Shield className="h-8 w-8 text-indigo-600 mb-2" />
                  <p className="font-medium">Administration</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Target className="h-8 w-8 text-orange-600 mb-2" />
                  <p className="font-medium">Mes objectifs</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium">Mes clients</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <Calendar className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium">Planning</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium">Mes contrats</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}