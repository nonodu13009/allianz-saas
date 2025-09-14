"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CommissionService } from '@/lib/commission-service'
import { CommissionData, CommissionYear, MONTHS } from '@/types/commission'
import { User } from '@/types/user'
import { TrendingUp, Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { YearManagementModal } from './year-management-modal'

export function CommissionTracker() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<CommissionYear[]>([])
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null)
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadAvailableYears = useCallback(async () => {
    console.log('loadAvailableYears appelé')
    try {
      const years = await CommissionService.getAvailableYears()
      console.log('Années récupérées (Firebase + locales):', years)
      setAvailableYears(years)
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error)
      // Fallback sur les années locales en cas d'erreur
      const fallbackYears = [
        { year: 2025, available: true },
        { year: 2024, available: true },
        { year: 2023, available: true },
        { year: 2022, available: true }
      ]
      setAvailableYears(fallbackYears)
      console.log('Années fallback définies après erreur:', fallbackYears)
    }
  }, [])

  const loadAdminUsers = useCallback(async () => {
    try {
      const users = await CommissionService.getAdminUsers()
      setAdminUsers(users)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs administrateurs:', error)
    }
  }, [])

  const loadCommissionData = useCallback(async (year: number) => {
    setLoading(true)
    try {
      // Essayer d'abord Firestore
      let data = await CommissionService.getCommissionData(year)
      
      // Si pas de données Firestore, utiliser les données locales
      if (!data) {
        data = CommissionService.getLocalCommissionData(year)
      }

      if (data) {
        setCommissionData(data)
      } else {
        toast.error(`Aucune donnée disponible pour l'année ${year}`)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.error('Erreur lors du chargement des données de commission')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAvailableYears()
    loadAdminUsers()
    loadCommissionData(currentYear)
  }, [loadAvailableYears, loadAdminUsers, loadCommissionData, currentYear])

  const handleYearChange = useCallback((year: number) => {
    if (availableYears.some(yearObj => yearObj.year === year)) {
      setCurrentYear(year)
      loadCommissionData(year)
    }
  }, [availableYears, loadCommissionData])

  const handlePreviousYear = useCallback(() => {
    const currentIndex = availableYears.findIndex(yearObj => yearObj.year === currentYear)
    if (currentIndex > 0) {
      const prevYear = availableYears[currentIndex - 1].year
      handleYearChange(prevYear)
    }
  }, [availableYears, currentYear, handleYearChange])

  const handleNextYear = useCallback(() => {
    const currentIndex = availableYears.findIndex(yearObj => yearObj.year === currentYear)
    if (currentIndex < availableYears.length - 1) {
      const nextYear = availableYears[currentIndex + 1].year
      handleYearChange(nextYear)
    }
  }, [availableYears, currentYear, handleYearChange])

  const handleReset = useCallback(() => {
    const systemYear = new Date().getFullYear()
    // Vérifier si l'année système est disponible, sinon utiliser la dernière année disponible
    const yearToUse = availableYears.some(yearObj => yearObj.year === systemYear) 
      ? systemYear 
      : availableYears[availableYears.length - 1]?.year
    
    if (yearToUse) {
      setCurrentYear(yearToUse)
      loadCommissionData(yearToUse)
    }
  }, [availableYears, loadCommissionData])

  const handleYearsUpdated = useCallback(() => {
    console.log('handleYearsUpdated appelé - rechargement des années et utilisateurs')
    loadAvailableYears()
    loadAdminUsers()
  }, [loadAvailableYears, loadAdminUsers])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }, [])

  const getRowStyle = useCallback((row: any) => {
    let baseStyle = 'transition-all duration-200 border border-gray-200 dark:border-gray-700'
    
    if (row.isCommission) {
      return `${baseStyle} bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-100/20`
    }
    if (row.isTotal) {
      return `${baseStyle} bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 font-bold border-l-4 border-l-blue-600`
    }
    if (row.isCharges) {
      return `${baseStyle} bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border-l-4 border-l-red-400`
    }
    if (row.isResult) {
      return `${baseStyle} bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 font-bold border-l-4 border-l-green-400`
    }
    if (row.isWithdrawal) {
      return `${baseStyle} bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 opacity-75`
    }
    
    return baseStyle
  }, [])

  const getCellStyle = useCallback((row: any, value: number) => {
    let baseStyle = 'transition-colors duration-200'
    
    if (row.isCommission) {
      return `${baseStyle} text-blue-700 dark:text-blue-300`
    }
    if (row.isTotal) {
      return `${baseStyle} text-blue-800 dark:text-blue-200 font-bold`
    }
    if (row.isCharges) {
      return `${baseStyle} text-red-700 dark:text-red-300`
    }
    if (row.isResult) {
      const isPositive = value >= 0
      return `${baseStyle} ${isPositive ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'} font-bold`
    }
    if (row.isWithdrawal) {
      return `${baseStyle} text-orange-700 dark:text-orange-300 italic`
    }
    
    return baseStyle
  }, [])

  // Mémos pour les calculs coûteux
  const currentYearData = useMemo(() => {
    return availableYears.find(yearObj => yearObj.year === currentYear)
  }, [availableYears, currentYear])

  const canNavigatePrevious = useMemo(() => {
    const currentIndex = availableYears.findIndex(yearObj => yearObj.year === currentYear)
    return currentIndex > 0
  }, [availableYears, currentYear])

  const canNavigateNext = useMemo(() => {
    const currentIndex = availableYears.findIndex(yearObj => yearObj.year === currentYear)
    return currentIndex < availableYears.length - 1
  }, [availableYears, currentYear])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Suivi des Commissions
          </CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Suivi des Commissions
            </CardTitle>
            <CardDescription>Commissions de l'agence Allianz Marseille</CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {currentYear}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Navigation des années */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousYear}
              disabled={availableYears.findIndex(yearObj => yearObj.year === currentYear) <= 0}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 transition-all duration-200 h-8 w-8 p-0"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <div className="flex gap-1 overflow-x-auto">
              {availableYears.map((year) => (
                <Button
                  key={year.year}
                  variant={currentYear === year.year ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearChange(year.year)}
                  className={`min-w-[50px] sm:min-w-[60px] transition-all duration-200 text-xs sm:text-sm ${
                    currentYear === year.year 
                      ? 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm border-blue-300 dark:border-blue-600 font-bold' 
                      : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {year.year}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextYear}
              disabled={availableYears.findIndex(yearObj => yearObj.year === currentYear) >= availableYears.length - 1}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 transition-all duration-200 h-8 w-8 p-0"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <YearManagementModal 
              availableYears={availableYears}
              onYearsUpdated={handleYearsUpdated}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1 sm:gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 transition-all duration-200 text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* Tableau des commissions */}
        {commissionData && (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="w-[120px] sm:w-[150px] md:w-[200px] font-bold border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                    Catégorie
                  </TableHead>
                  {MONTHS.map((month) => (
                    <TableHead key={month} className="text-center min-w-[60px] sm:min-w-[80px] md:min-w-[100px] border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                      <span className="hidden sm:inline">{month}</span>
                      <span className="sm:hidden">{month.substring(0, 3)}</span>
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold min-w-[80px] sm:min-w-[100px] md:min-w-[120px] text-xs sm:text-sm">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.rows.map((row, index) => (
                  <TableRow key={index} className={getRowStyle(row)}>
                    <TableCell className="font-medium border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                        <span className="truncate">{row.label}</span>
                        {row.isWithdrawal && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-orange-300 dark:border-orange-600 whitespace-nowrap">
                            Indicatif
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {row.values.map((value, monthIndex) => (
                      <TableCell key={monthIndex} className={`text-center border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm ${getCellStyle(row, value)}`}>
                        {value > 0 ? formatCurrency(value) : '-'}
                      </TableCell>
                    ))}
                    <TableCell className={`text-center font-bold text-xs sm:text-sm ${getCellStyle(row, row.total)}`}>
                      {formatCurrency(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {/* Skeleton pour le tableau */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="w-[120px] sm:w-[150px] md:w-[200px] font-bold border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableHead>
                    {MONTHS.map((month) => (
                      <TableHead key={month} className="text-center min-w-[60px] sm:min-w-[80px] md:min-w-[100px] border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-8"></div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold min-w-[80px] sm:min-w-[100px] md:min-w-[120px] text-xs sm:text-sm">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-12"></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <TableRow key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                      {MONTHS.map((_, monthIndex) => (
                        <TableCell key={monthIndex} className="text-center border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-16"></div>
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-xs sm:text-sm">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-20"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {!commissionData && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium">Aucune donnée disponible</p>
                <p className="text-sm">pour l'année {currentYear}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
