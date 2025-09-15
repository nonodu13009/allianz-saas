"use client"

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { CommissionTracker } from '@/components/commissions/commission-tracker'
import { AnalysisChart } from '@/components/commissions/analysis-chart'
import { useState, useEffect } from 'react'
import { CommissionService } from '@/lib/commission-service'
import { CommissionYear } from '@/types/commission'

export default function CommissionsPage() {
  const [availableYears, setAvailableYears] = useState<CommissionYear[]>([])

  const loadAvailableYears = async () => {
    try {
      const years = await CommissionService.getAvailableYears()
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
    }
  }

  useEffect(() => {
    loadAvailableYears()
  }, [])

  return (
    <DashboardLayout requiredRole="administrateur">
      <div className="space-y-6 p-6">
        <CommissionTracker />
        <AnalysisChart availableYears={availableYears} />
      </div>
    </DashboardLayout>
  )
}
