// Tableau des activités CDC avec tri et actions
// Basé sur les spécifications du CDC commercial

"use client"

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, ActivityType, ProductType, CDCFilter } from '@/types/cdc'
import { formatDateShort, formatEuroInt, getMonthName, filterActivities } from '@/lib/cdc'
import { ActivityViewModal } from './ActivityViewModal'
import { ActivityEditModal } from './ActivityEditModal'
import { ActivityDeleteModal } from './ActivityDeleteModal'
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Eye,
  Lock,
  Unlock,
  Calendar,
  User,
  Euro,
  FileText
} from 'lucide-react'

interface ActivityTableProps {
  activities: Activity[]
  yearMonth: string
  filter?: CDCFilter
  isLocked: boolean
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
  onView?: (activity: Activity) => void
  loading?: boolean
}

type SortField = 'dateSaisie' | 'clientName' | 'type' | 'productType' | 'commissionPotentielle'
type SortDirection = 'asc' | 'desc'

export function ActivityTable({ 
  activities, 
  yearMonth, 
  filter,
  isLocked,
  onEdit, 
  onDelete, 
  onView,
  loading = false 
}: ActivityTableProps) {
  const [sortField, setSortField] = useState<SortField>('dateSaisie')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // États pour les modales
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Parsing de l'année et du mois
  const [year, month] = yearMonth.split('-').map(Number)

  // Filtrage et tri des activités
  const sortedActivities = useMemo(() => {
    // Appliquer les filtres
    const filteredActivities = filter ? filterActivities(activities, filter) : activities
    
    // Appliquer le tri
    return [...filteredActivities].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'dateSaisie':
          aValue = new Date(a.dateSaisie)
          bValue = new Date(b.dateSaisie)
          break
        case 'clientName':
          aValue = a.clientName.toLowerCase()
          bValue = b.clientName.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'productType':
          aValue = a.productType || ''
          bValue = b.productType || ''
          break
        case 'commissionPotentielle':
          aValue = a.commissionPotentielle || 0
          bValue = b.commissionPotentielle || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [activities, filter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Fonctions de gestion des modales
  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setViewModalOpen(true)
  }

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setEditModalOpen(true)
  }

  const handleDeleteActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setViewModalOpen(false)
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedActivity(null)
  }

  const handleSaveEdit = async (id: string, updates: Partial<Activity>) => {
    await onEdit(id, updates)
    handleCloseModals()
  }

  const handleConfirmDelete = async (id: string) => {
    await onDelete(id)
    handleCloseModals()
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const getActivityTypeConfig = (type: ActivityType) => {
    switch (type) {
      case ActivityType.AN:
        return {
          label: 'AN',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: '✨'
        }
      case ActivityType.M3:
        return {
          label: 'M+3',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📈'
        }
      case ActivityType.PRETERME_AUTO:
        return {
          label: 'Préterme Auto',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🚗'
        }
      case ActivityType.PRETERME_IRD:
        return {
          label: 'Préterme IRD',
          color: 'bg-violet-100 text-violet-800 border-violet-200',
          icon: '🛡️'
        }
      default:
        return {
          label: type,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📋'
        }
    }
  }

  const getProductTypeConfig = (productType?: ProductType) => {
    if (!productType) return null
    
    const configs = {
      [ProductType.AUTO_MOTO]: { label: 'AUTO/MOTO', color: 'bg-blue-50 text-blue-700' },
      [ProductType.IARD_PART_DIVERS]: { label: 'IARD PART', color: 'bg-green-50 text-green-700' },
      [ProductType.IARD_PRO_DIVERS]: { label: 'IARD PRO', color: 'bg-purple-50 text-purple-700' },
      [ProductType.PJ]: { label: 'PJ', color: 'bg-yellow-50 text-yellow-700' },
      [ProductType.GAV]: { label: 'GAV', color: 'bg-red-50 text-red-700' },
      [ProductType.SANTE_PREV]: { label: 'SANTE/PREV', color: 'bg-pink-50 text-pink-700' },
      [ProductType.NOP_50EUR]: { label: 'NOP 50€', color: 'bg-gray-50 text-gray-700' },
      [ProductType.EPARGNE_RETRAITE]: { label: 'EPARGNE', color: 'bg-indigo-50 text-indigo-700' },
      [ProductType.PU_VL]: { label: 'PU/VL', color: 'bg-emerald-50 text-emerald-700' }
    }
    
    return configs[productType] || { label: productType, color: 'bg-gray-50 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-600 dark:text-gray-400">Chargement des activités...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* En-tête du tableau */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Activités - {getMonthName(month)} {year}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activities.length} activité{activities.length > 1 ? 's' : ''} enregistrée{activities.length > 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Indicateur de verrouillage */}
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Verrouillé
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
                <Unlock className="h-3 w-3" />
                Éditable
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('dateSaisie')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de saisie
                  {getSortIcon('dateSaisie')}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Type
                  {getSortIcon('type')}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom client
                  {getSortIcon('clientName')}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('productType')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Type produit
                  {getSortIcon('productType')}
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Détails
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-right"
                onClick={() => handleSort('commissionPotentielle')}
              >
                <div className="flex items-center justify-end gap-2">
                  <Euro className="h-4 w-4" />
                  Commission
                  {getSortIcon('commissionPotentielle')}
                </div>
              </TableHead>
              
              <TableHead className="text-center">
                Actions
              </TableHead>
              
              <TableHead className="text-center">
                <Lock className="h-4 w-4 mx-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">📋</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucune activité enregistrée pour ce mois
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedActivities.map((activity) => {
                const typeConfig = getActivityTypeConfig(activity.type)
                const productConfig = getProductTypeConfig(activity.productType)
                
                return (
                  <TableRow key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {/* Date de saisie */}
                    <TableCell className="font-medium">
                      {formatDateShort(activity.dateSaisie || activity.createdAt)}
                    </TableCell>
                    
                    {/* Type */}
                    <TableCell>
                      <Badge variant="secondary" className={typeConfig.color}>
                        {typeConfig.icon} {typeConfig.label}
                      </Badge>
                    </TableCell>
                    
                    {/* Nom client */}
                    <TableCell className="font-medium">
                      {activity.clientName}
                    </TableCell>
                    
                    {/* Type produit */}
                    <TableCell>
                      {productConfig ? (
                        <Badge variant="outline" className={productConfig.color}>
                          {productConfig.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    
                    {/* Détails */}
                    <TableCell>
                      <div className="space-y-1">
                        {activity.contractNumber && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            N°: {activity.contractNumber}
                          </div>
                        )}
                        {activity.dateEffet && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Effet: {formatDateShort(activity.dateEffet)}
                          </div>
                        )}
                        {activity.primeAnnuelle && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Prime: {formatEuroInt(activity.primeAnnuelle)}
                          </div>
                        )}
                        {activity.versementLibre && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Versement: {formatEuroInt(activity.versementLibre)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Commission */}
                    <TableCell className="text-right font-medium">
                      {activity.commissionPotentielle ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {formatEuroInt(activity.commissionPotentielle)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewActivity(activity)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                          title="Visualiser"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditActivity(activity)}
                            className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {!isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity)}
                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Verrou */}
                    <TableCell className="text-center">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-red-500 mx-auto" />
                      ) : (
                        <Unlock className="h-4 w-4 text-green-500 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modales */}
      <ActivityViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        activity={selectedActivity}
      />

      <ActivityEditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveEdit}
        activity={selectedActivity}
        loading={loading}
        isLocked={isLocked}
      />

      <ActivityDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        activity={selectedActivity}
        loading={loading}
        isLocked={isLocked}
      />
    </div>
  )
}
