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
    if (year >= 2022 && year <= new Date().getFullYear()) {
      setCurrentYear(year)
      loadCommissionData(year)
    }
  }

  const handlePreviousYear = () => {
    const prevYear = currentYear - 1
    if (prevYear >= 2022) {
      handleYearChange(prevYear)
    }
  }

  const handleNextYear = () => {
    const nextYear = currentYear + 1
    if (nextYear <= new Date().getFullYear()) {
      handleYearChange(nextYear)
    }
  }

  const handleReset = () => {
    const currentYear = new Date().getFullYear()
    setCurrentYear(currentYear)
    loadCommissionData(currentYear)
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
    let baseStyle = 'transition-all duration-200 hover:shadow-md'
    
    if (row.isCommission) {
      return `${baseStyle} bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 border-l-4 border-blue-400`
    }
    if (row.isTotal) {
      return `${baseStyle} bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40 font-bold border-l-4 border-blue-600 shadow-sm`
    }
    if (row.isCharges) {
      return `${baseStyle} bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border-l-4 border-red-400`
    }
    if (row.isResult) {
      return `${baseStyle} bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/40 font-bold border-l-4 border-green-600 shadow-sm`
    }
    if (row.isWithdrawal) {
      return `${baseStyle} bg-gray-50 dark:bg-gray-800/20 hover:bg-gray-100 dark:hover:bg-gray-800/30 border-l-4 border-gray-400 opacity-75`
    }
    
    return baseStyle
  }

  const getCellStyle = (row: any, value: number) => {
    let baseStyle = 'transition-colors duration-200'
    
    if (row.isCommission) {
      return `${baseStyle} text-blue-700 dark:text-blue-300 font-medium`
    }
    if (row.isTotal) {
      return `${baseStyle} text-blue-800 dark:text-blue-200 font-bold`
    }
    if (row.isCharges) {
      return `${baseStyle} text-red-700 dark:text-red-300 font-medium`
    }
    if (row.isResult) {
      const isPositive = value >= 0
      return `${baseStyle} ${isPositive ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'} font-bold`
    }
    if (row.isWithdrawal) {
      return `${baseStyle} text-gray-600 dark:text-gray-400 font-medium italic`
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
              disabled={currentYear <= 2022}
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
                  className="min-w-[60px]"
                >
                  {year.year}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextYear}
              disabled={currentYear >= new Date().getFullYear()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Tableau des commissions */}
        {commissionData && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] font-bold">Catégorie</TableHead>
                  {MONTHS.map((month) => (
                    <TableHead key={month} className="text-center min-w-[100px]">
                      {month}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold min-w-[120px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.rows.map((row, index) => (
                  <TableRow key={index} className={getRowStyle(row)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {row.label}
                        {row.isWithdrawal && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600">
                            Indicatif
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {row.values.map((value, monthIndex) => (
                      <TableCell key={monthIndex} className={`text-center ${getCellStyle(row, value)}`}>
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
