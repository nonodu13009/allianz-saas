"use client"

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { CommissionTracker } from '@/components/commissions/commission-tracker'

export default function CommissionsPage() {
  return (
    <DashboardLayout requiredRole="administrateur">
      <div className="space-y-6 p-6">
        <CommissionTracker />
      </div>
    </DashboardLayout>
  )
}
