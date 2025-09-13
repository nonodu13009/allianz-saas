"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CommissionService } from '@/lib/commission-service'
import { CommissionData, CommissionYear, MONTHS } from '@/types/commission'
import { TrendingUp, Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function CommissionTracker() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<CommissionYear[]>([])
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAvailableYears()
    loadCommissionData(currentYear)
  }, [])

  const loadAvailableYears = async () => {
    try {
      const years = await CommissionService.getAvailableYears()
      if (years.length === 0) {
        // Fallback sur les années locales
        setAvailableYears([
          { year: 2025, available: true },
          { year: 2024, available: true },
          { year: 2023, available: true },
          { year: 2022, available: true }
        ])
      } else {
        setAvailableYears(years)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error)
      setAvailableYears([
        { year: 2025, available: true },
        { year: 2024, available: true },
        { year: 2023, available: true },
        { year: 2022, available: true }
      ])
    }
  }

  const loadCommissionData = async (year: number) => {
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
  }

  const handleYearChange = (year: number) => {
    if (availableYears.some(yearObj => yearObj.year === year)) {
      setCurrentYear(year)
      loadCommissionData(year)
    }
  }

  const handlePreviousYear = () => {
    const currentIndex = availableYears.findIndex(yearObj => yearObj.year === currentYear)
    if (currentIndex > 0) {
      const prevYear = availableYears[currentIndex - 1].year
      handleYearChange(prevYear)
    }
  }

  const handleNextYear = () => {
    const currentIndex = availableYears.findIndex(yearObj => yearObj.year === currentYear)
    if (currentIndex < availableYears.length - 1) {
      const nextYear = availableYears[currentIndex + 1].year
      handleYearChange(nextYear)
    }
  }

  const handleReset = () => {
    const systemYear = new Date().getFullYear()
    // Vérifier si l'année système est disponible, sinon utiliser la dernière année disponible
    const yearToUse = availableYears.some(yearObj => yearObj.year === systemYear) 
      ? systemYear 
      : availableYears[availableYears.length - 1]?.year
    
    if (yearToUse) {
      setCurrentYear(yearToUse)
      loadCommissionData(yearToUse)
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

  const getRowStyle = (row: any) => {
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
  }

  const getCellStyle = (row: any, value: number) => {
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
  }

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousYear}
              disabled={availableYears.findIndex(yearObj => yearObj.year === currentYear) <= 0}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              {availableYears.map((year) => (
                <Button
                  key={year.year}
                  variant={currentYear === year.year ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearChange(year.year)}
                  className={`min-w-[60px] transition-all duration-200 ${
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
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Tableau des commissions */}
        {commissionData && (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="w-[200px] font-bold border-r border-gray-200 dark:border-gray-700">Catégorie</TableHead>
                  {MONTHS.map((month) => (
                    <TableHead key={month} className="text-center min-w-[100px] border-r border-gray-200 dark:border-gray-700">
                      {month}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold min-w-[120px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.rows.map((row, index) => (
                  <TableRow key={index} className={getRowStyle(row)}>
                    <TableCell className="font-medium border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {row.label}
                        {row.isWithdrawal && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full border border-orange-300 dark:border-orange-600">
                            Indicatif
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {row.values.map((value, monthIndex) => (
                      <TableCell key={monthIndex} className={`text-center border-r border-gray-200 dark:border-gray-700 ${getCellStyle(row, value)}`}>
                        {value > 0 ? formatCurrency(value) : '-'}
                      </TableCell>
                    ))}
                    <TableCell className={`text-center font-bold ${getCellStyle(row, row.total)}`}>
                      {formatCurrency(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!commissionData && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune donnée disponible pour l'année {currentYear}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
