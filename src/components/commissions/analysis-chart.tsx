"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CommissionService } from '@/lib/commission-service'
import { CommissionData, CommissionYear, CommissionRow } from '@/types/commission'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, BarChart3, LineChart as LineChartIcon, Calendar, Filter } from 'lucide-react'

interface AnalysisChartProps {
  availableYears: CommissionYear[]
}

interface ChartDataPoint {
  month: string
  [key: string]: string | number
}

interface SelectedItem {
  id: string
  label: string
  type: 'commission' | 'charges' | 'result' | 'withdrawal'
  color: string
}

export function AnalysisChart({ availableYears }: AnalysisChartProps) {
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Items disponibles pour la sélection
  const availableItems: SelectedItem[] = [
    { id: 'total-commissions', label: 'Total Commissions', type: 'commission', color: '#3b82f6' },
    { id: 'iard-commissions', label: 'Commissions IARD', type: 'commission', color: '#1d4ed8' },
    { id: 'vie-commissions', label: 'Commissions Vie', type: 'commission', color: '#2563eb' },
    { id: 'courtage-commissions', label: 'Commissions Courtage', type: 'commission', color: '#1e40af' },
    { id: 'exceptionnels', label: 'Produits exceptionnels', type: 'commission', color: '#1e3a8a' },
    { id: 'charges', label: 'Charges agence', type: 'charges', color: '#dc2626' },
    { id: 'result', label: 'Résultat', type: 'result', color: '#16a34a' },
    { id: 'withdrawals', label: 'Prélèvements', type: 'withdrawal', color: '#ea580c' }
  ]

  // Couleurs distinctes pour chaque année
  const yearColors = [
    '#3b82f6', // Bleu
    '#ef4444', // Rouge
    '#10b981', // Vert
    '#f59e0b', // Orange
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316'  // Orange vif
  ]

  // Générer des couleurs uniques pour chaque combinaison année + item
  const getColorForSeries = (year: number, item: SelectedItem) => {
    const yearIndex = selectedYears.indexOf(year)
    const itemIndex = availableItems.findIndex(i => i.id === item.id)
    
    // Utiliser une couleur basée sur l'année et l'item pour plus de variété
    const hue = (yearIndex * 60 + itemIndex * 30) % 360
    const saturation = 70
    const lightness = 50
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Charger les données pour les années sélectionnées
  const loadChartData = async (years: number[], items: SelectedItem[]) => {
    if (years.length === 0 || items.length === 0) {
      setChartData([])
      return
    }

    setLoading(true)
    try {
      const allData: CommissionData[] = []
      
      // Charger les données pour chaque année
      for (const year of years) {
        let data = await CommissionService.getCommissionData(year)
        
        // Si pas de données Firestore, utiliser les données locales
        if (!data) {
          data = CommissionService.getLocalCommissionDataSync(year)
        }
        
        if (data) {
          allData.push(data)
        }
      }

      // Créer les points de données pour le graphique
      const chartDataPoints: ChartDataPoint[] = []
      
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthData: ChartDataPoint = {
          month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][monthIndex]
        }

        // Pour chaque année, ajouter les données des items sélectionnés
        years.forEach(year => {
          const yearData = allData.find(d => d.year === year)
          if (yearData) {
            items.forEach(item => {
              const row = yearData.rows.find(r => {
                switch (item.id) {
                  case 'total-commissions':
                    return r.isTotal
                  case 'iard-commissions':
                    return r.label === 'Commissions IARD'
                  case 'vie-commissions':
                    return r.label === 'Commissions Vie'
                  case 'courtage-commissions':
                    return r.label === 'Commissions Courtage'
                  case 'exceptionnels':
                    return r.label === 'Produits exceptionnels'
                  case 'charges':
                    return r.isCharges
                  case 'result':
                    return r.isResult
                  case 'withdrawals':
                    return r.isWithdrawal
                  default:
                    return false
                }
              })

              if (row) {
                const key = `${item.label} ${year}`
                monthData[key] = row.values[monthIndex] || 0
              }
            })
          }
        })

        chartDataPoints.push(monthData)
      }

      setChartData(chartDataPoints)
    } catch (error) {
      console.error('Erreur lors du chargement des données du graphique:', error)
    } finally {
      setLoading(false)
    }
  }

  // Effet pour charger les données quand les sélections changent
  useEffect(() => {
    loadChartData(selectedYears, selectedItems)
  }, [selectedYears, selectedItems])

  // Initialiser avec les 2 dernières années et le total des commissions
  useEffect(() => {
    if (availableYears.length > 0 && selectedYears.length === 0) {
      const sortedYears = [...availableYears].sort((a, b) => b.year - a.year)
      const defaultYears = sortedYears.slice(0, 2).map(y => y.year)
      setSelectedYears(defaultYears)
      
      const defaultItem = availableItems.find(item => item.id === 'total-commissions')
      if (defaultItem) {
        setSelectedItems([defaultItem])
      }
    }
  }, [availableYears])

  const handleYearToggle = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year].sort((a, b) => b - a)
    )
  }

  const handleItemToggle = (item: SelectedItem) => {
    setSelectedItems(prev => 
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-base">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm font-medium" style={{ color: entry.color }}>
                  {entry.dataKey}: <span className="font-bold">{formatCurrency(entry.value)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analyse et Evolution
        </CardTitle>
        <CardDescription>
          Analyse comparative des données de commission sur plusieurs années
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sélection des années */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Sélection des années</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((yearObj) => (
              <Button
                key={yearObj.year}
                variant={selectedYears.includes(yearObj.year) ? "default" : "outline"}
                size="sm"
                onClick={() => handleYearToggle(yearObj.year)}
                className={`transition-all duration-200 ${
                  selectedYears.includes(yearObj.year)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {yearObj.year}
              </Button>
            ))}
          </div>
        </div>

        {/* Sélection des items */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Sélection des données</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableItems.map((item) => (
              <Button
                key={item.id}
                variant={selectedItems.some(i => i.id === item.id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleItemToggle(item)}
                className={`transition-all duration-200 text-xs ${
                  selectedItems.some(i => i.id === item.id)
                    ? 'text-white'
                    : ''
                }`}
                style={{
                  backgroundColor: selectedItems.some(i => i.id === item.id) ? item.color : undefined,
                  borderColor: selectedItems.some(i => i.id === item.id) ? item.color : undefined
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Type de graphique */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Type de graphique:</span>
          <div className="flex gap-1">
            <Button
              variant={chartType === 'bar' ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType('bar')}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Barres
            </Button>
            <Button
              variant={chartType === 'line' ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType('line')}
              className="flex items-center gap-1"
            >
              <LineChartIcon className="h-4 w-4" />
              Lignes
            </Button>
          </div>
        </div>

        {/* Graphique */}
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontWeight: '500' }}>
                          {value}
                        </span>
                      )}
                    />
                    {selectedYears.flatMap(year => 
                      selectedItems.map(item => (
                        <Bar
                          key={`${item.label} ${year}`}
                          dataKey={`${item.label} ${year}`}
                          name={`${item.label} ${year}`}
                          fill={getColorForSeries(year, item)}
                          opacity={0.8}
                        />
                      ))
                    )}
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontWeight: '500' }}>
                          {value}
                        </span>
                      )}
                    />
                    {selectedYears.flatMap(year => 
                      selectedItems.map(item => (
                        <Line
                          key={`${item.label} ${year}`}
                          type="monotone"
                          dataKey={`${item.label} ${year}`}
                          name={`${item.label} ${year}`}
                          stroke={getColorForSeries(year, item)}
                          strokeWidth={3}
                          dot={{ fill: getColorForSeries(year, item), strokeWidth: 2, r: 5 }}
                        />
                      ))
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Résumé des sélections */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Données sélectionnées:</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Années:</strong> {selectedYears.join(', ')}</p>
                <p><strong>Données:</strong> {selectedItems.map(item => item.label).join(', ')}</p>
                <p><strong>Type:</strong> Graphique en {chartType === 'bar' ? 'barres' : 'lignes'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez des années et des données pour voir le graphique</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
