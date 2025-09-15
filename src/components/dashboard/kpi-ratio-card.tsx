"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrendingUp, Calculator, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { CommissionService } from '@/lib/commission-service'
import { UserService } from '@/lib/user-service'

interface RatioData {
  ratio: number
  isExtrapolated: boolean
  year: number
  totalCommissions: number
  extrapolatedCommissions: number
  etp: number
  comment: string
  commentType: 'success' | 'warning' | 'error' | 'info'
}

export function KPIRatioCard() {
  const [ratioData, setRatioData] = useState<RatioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRatioData()
  }, [])

  const loadRatioData = async () => {
    try {
      // Récupérer l'ETP total depuis la collection Users
      const users = await UserService.getAllUsers()
      const activeUsers = users.filter(user => user.isActive)
      const totalETP = activeUsers.reduce((sum, user) => sum + (user.etp || 1), 0)

      // Récupérer le cumul annuel des commissions pour l'année actuelle
      const currentYear = new Date().getFullYear()
      let totalCommissions = await getTotalCommissionsForYear(currentYear)
      
      // Si pas de données pour l'année actuelle, essayer l'année précédente
      if (totalCommissions === null || totalCommissions === 0) {
        const previousYear = currentYear - 1
        totalCommissions = await getTotalCommissionsForYear(previousYear)
        
        if (totalCommissions !== null && totalCommissions > 0) {
          // Utiliser les données de l'année précédente
          const ratio = totalCommissions / totalETP
          const isExtrapolated = true
          const extrapolatedCommissions = totalCommissions
          
          // Déterminer le type de commentaire selon les seuils
          let commentType: 'success' | 'warning' | 'error' | 'info' = 'info'
          let statusComment = ""

          if (ratio < 80000) {
            commentType = 'error'
            statusComment = "Performance insuffisante - < 80k€"
          } else if (ratio >= 80000 && ratio < 100000) {
            commentType = 'success'
            statusComment = "Performance équilibrée - 80k€ à 100k€"
          } else {
            commentType = 'warning'
            statusComment = "Très rentable mais nécessite plus de moyens humains pour maintenir la qualité"
          }
          
          setRatioData({
            ratio,
            isExtrapolated,
            year: previousYear,
            totalCommissions,
            extrapolatedCommissions,
            etp: totalETP,
            comment: `Données de référence de ${previousYear} (année ${currentYear} vide) • ${statusComment}`,
            commentType
          })
          return
        }
      }

      // Calculer le ratio avec les données de l'année actuelle
      if (totalCommissions !== null && totalCommissions > 0) {
        const ratio = totalCommissions / totalETP
        const isExtrapolated = false
        
        // Déterminer le type de commentaire selon les seuils
        let commentType: 'success' | 'warning' | 'error' | 'info' = 'info'
        let statusComment = ""

        if (ratio < 80000) {
          commentType = 'error'
          statusComment = "Performance insuffisante - < 80k€"
        } else if (ratio >= 80000 && ratio < 100000) {
          commentType = 'success'
          statusComment = "Performance équilibrée - 80k€ à 100k€"
        } else {
          commentType = 'warning'
          statusComment = "Très rentable mais nécessite plus de moyens humains pour maintenir la qualité"
        }
        
        setRatioData({
          ratio,
          isExtrapolated,
          year: currentYear,
          totalCommissions,
          extrapolatedCommissions: totalCommissions,
          etp: totalETP,
          comment: `Données complètes pour ${currentYear} • ${statusComment}`,
          commentType
        })
      } else {
        setRatioData({
          ratio: 0,
          isExtrapolated: false,
          year: currentYear,
          totalCommissions: 0,
          extrapolatedCommissions: 0,
          etp: totalETP,
          comment: "Aucune donnée de commission disponible",
          commentType: 'info'
        })
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de ratio:', error)
      setRatioData({
        ratio: 0,
        isExtrapolated: false,
        year: new Date().getFullYear(),
        totalCommissions: 0,
        extrapolatedCommissions: 0,
        etp: 0,
        comment: "Erreur lors du chargement des données",
        commentType: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupère le cumul annuel des commissions pour une année donnée
   * Utilise la nouvelle source de vérité : la colonne "Cumul / an" de la ligne "Total commissions"
   */
  const getTotalCommissionsForYear = async (year: number): Promise<number | null> => {
    try {
      // Récupérer les données de commission pour l'année
      let commissionData = await CommissionService.getCommissionData(year)
      
      if (!commissionData) {
        // Si pas de données Firestore, essayer les données locales
        commissionData = CommissionService.getLocalCommissionDataSync(year)
      }
      
      if (!commissionData || !commissionData.rows) {
        return null
      }

      // Trouver la ligne "Total commissions" qui est la nouvelle source de vérité
      const totalCommissionsRow = commissionData.rows.find((row: any) => row.isTotal)
      
      if (!totalCommissionsRow) {
        return null
      }

      // Utiliser le cumul annuel (colonne "Cumul / an") au lieu du total mensuel
      // Le cumul annuel est calculé comme : (total / mois_avec_données) * 12
      const monthsWithData = totalCommissionsRow.values.filter((value: number) => value > 0).length
      const cumulativeYear = (totalCommissionsRow.total / Math.max(1, monthsWithData)) * 12
      
      if (cumulativeYear === undefined || cumulativeYear === null || isNaN(cumulativeYear)) {
        return null
      }

      return cumulativeYear
    } catch (error) {
      console.error(`Erreur lors de la récupération des commissions pour ${year}:`, error)
      return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getIcon = () => {
    if (!ratioData) return <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
    
    switch (ratioData.commentType) {
      case 'success':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
      default:
        return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getCardStyle = () => {
    if (!ratioData) return "from-gray-500/10 to-gray-600/10 border-gray-300/20 dark:border-gray-700/20"
    
    switch (ratioData.commentType) {
      case 'success':
        return "from-green-500/10 to-emerald-500/10 border-green-300/20 dark:border-green-700/20"
      case 'warning':
        return "from-orange-500/10 to-amber-500/10 border-orange-300/20 dark:border-orange-700/20"
      case 'error':
        return "from-red-500/10 to-rose-500/10 border-red-300/20 dark:border-red-700/20"
      default:
        return "from-blue-500/10 to-purple-500/10 border-blue-300/20 dark:border-purple-700/20"
    }
  }

  const getTextStyle = () => {
    if (!ratioData) return "text-gray-800 dark:text-gray-200"
    
    switch (ratioData.commentType) {
      case 'success':
        return "text-green-800 dark:text-green-200"
      case 'warning':
        return "text-orange-800 dark:text-orange-200"
      case 'error':
        return "text-red-800 dark:text-red-200"
      default:
        return "text-blue-800 dark:text-blue-200"
    }
  }

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br ${getCardStyle()} backdrop-blur-md shadow-xl rounded-xl p-3 sm:p-4`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm sm:text-base lg:text-lg font-bold ${getTextStyle()}`}>
            Comm. / ETP
          </CardTitle>
          <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            <div className="w-full h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Calcul du ratio de performance
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!ratioData) {
    return (
      <Card className={`bg-gradient-to-br ${getCardStyle()} backdrop-blur-md shadow-xl rounded-xl p-3 sm:p-4`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm sm:text-base lg:text-lg font-bold ${getTextStyle()}`}>
            Comm. / ETP
          </CardTitle>
          <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            N/A
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Données indisponibles
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-gradient-to-br ${getCardStyle()} backdrop-blur-md shadow-xl rounded-xl p-3 sm:p-4`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm sm:text-base lg:text-lg font-bold ${getTextStyle()}`}>
          Comm. / ETP
        </CardTitle>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Comm. / ETP</DialogTitle>
                <DialogDescription>
                  Analyse de la performance de l'agence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ratio</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(ratioData.ratio)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Année</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {ratioData.year}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Commissions:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(ratioData.extrapolatedCommissions)}</span>
                      {ratioData.isExtrapolated && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full border border-orange-300 dark:border-orange-600">
                          Extrapolé
                        </span>
                      )}
                    </div>
                  </div>
                  {ratioData.isExtrapolated && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Commissions réelles:</span>
                      <span className="text-sm font-semibold">{formatCurrency(ratioData.totalCommissions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ETP:</span>
                    <span className="text-sm font-semibold">{ratioData.etp.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-sm font-semibold">
                      {ratioData.isExtrapolated ? 'Extrapolée' : 'Complète'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {ratioData.comment}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Seuils de performance:</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• &lt; 80k€ : Performance insuffisante</li>
                    <li>• 80k€ - 100k€ : Performance équilibrée</li>
                    <li>• &gt; 100k€ : Très rentable mais nécessite plus de moyens humains</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="mt-2">
        <div className="flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
            {formatCurrency(ratioData.ratio)}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
            / ETP
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {ratioData.isExtrapolated ? 'Année extrapolée' : `Année ${ratioData.year}`}
        </p>
        
        <div className="mt-2 sm:mt-3">
          <div className="flex items-center space-x-2 bg-white/10 dark:bg-gray-800/20 rounded-lg p-1.5 sm:p-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Commissions</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(ratioData.extrapolatedCommissions)}
              </p>
            </div>
            {ratioData.isExtrapolated && (
              <div className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-300 dark:border-orange-600">
                Extrapolé
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
