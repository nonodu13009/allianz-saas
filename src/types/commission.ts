export interface CommissionRow {
  label: string
  values: number[]
  total: number
  isCommission?: boolean
  isTotal?: boolean
  isCharges?: boolean
  isResult?: boolean
  isWithdrawal?: boolean
}

export interface CommissionData {
  year: number
  rows: CommissionRow[]
  updatedAt: string
}

export interface CommissionYear {
  year: number
  available: boolean
}

export const COMMISSION_CATEGORIES = {
  IARD: 'Commissions IARD',
  VIE: 'Commissions Vie',
  COURTAGE: 'Commissions Courtage',
  TOTAL: 'Total commissions',
  CHARGES: 'Charges agence',
  RESULT: 'Résultat',
  WITHDRAWAL_JULIEN: 'Prélèvements Julien',
  WITHDRAWAL_JEAN_MICHEL: 'Prélèvements Jean-Michel'
} as const

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
] as const
