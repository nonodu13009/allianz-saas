// Tableau des activités Santé Collective avec tri et actions
// Inspiré de SanteIndTable avec adaptations spécifiques

"use client"

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SanteCollActivity, SanteCollFilter, SanteCollActeType, SanteCollOrigine, CompagnieType } from '@/types/sante-coll'
import { formatDateShort, formatEuroInt, getMonthName, filterActivities, getActeTypeConfig, getOrigineConfig, getCompagnieConfig } from '@/lib/sante-coll'
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
  FileText,
  Building2,
  Target
} from 'lucide-react'

interface SanteCollTableProps {
  activities: SanteCollActivity[]
  yearMonth: string
  filter?: SanteCollFilter
  isLocked: boolean
  onEdit?: (activity: SanteCollActivity) => void
  onDelete?: (activity: SanteCollActivity) => void
  onView?: (activity: SanteCollActivity) => void
  loading?: boolean
}

export function SanteCollTable({ 
  activities, 
  yearMonth, 
  filter,
  isLocked,
  onEdit, 
  onDelete, 
  onView,
  loading = false 
}: SanteCollTableProps) {
  const [sortField, setSortField] = useState<SortField>('dateSaisie')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // États pour les modales (à implémenter plus tard)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<SanteCollActivity | null>(null)

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
        case 'ca':
          aValue = a.ca
          bValue = b.ca
          break
        case 'caPondere':
          aValue = a.caPondere
          bValue = b.caPondere
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
  const handleViewActivity = (activity: SanteCollActivity) => {
    setSelectedActivity(activity)
    setViewModalOpen(true)
  }

  const handleEditActivity = (activity: SanteCollActivity) => {
    setSelectedActivity(activity)
    setEditModalOpen(true)
  }

  const handleDeleteActivity = (activity: SanteCollActivity) => {
    setSelectedActivity(activity)
    setDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setViewModalOpen(false)
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedActivity(null)
  }

  const handleSaveEdit = async (id: string, updates: Partial<SanteCollActivity>) => {
    if (onEdit) {
      await onEdit({ ...selectedActivity!, ...updates })
    }
    handleCloseModals()
  }

  const handleConfirmDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(selectedActivity!)
    }
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
              Activités Santé Collective - {getMonthName(month)} {year}
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
                  Nature de l'acte
                  {getSortIcon('type')}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom du client
                  {getSortIcon('clientName')}
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  N° contrat
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date d'effet
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Origine
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Compagnie
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-right"
                onClick={() => handleSort('ca')}
              >
                <div className="flex items-center justify-end gap-2">
                  <Euro className="h-4 w-4" />
                  CA
                  {getSortIcon('ca')}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-right"
                onClick={() => handleSort('caPondere')}
              >
                <div className="flex items-center justify-end gap-2">
                  <Euro className="h-4 w-4" />
                  CA pondéré
                  {getSortIcon('caPondere')}
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
                <TableCell colSpan={11} className="text-center py-12">
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
                const typeConfig = getActeTypeConfig(activity.type)
                const origineConfig = activity.origine ? getOrigineConfig(activity.origine) : null
                const compagnieConfig = activity.compagnie ? getCompagnieConfig(activity.compagnie) : null
                
                return (
                  <TableRow key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {/* Date de saisie */}
                    <TableCell className="font-medium">
                      {formatDateShort(activity.dateSaisie || activity.createdAt)}
                    </TableCell>
                    
                    {/* Nature de l'acte */}
                    <TableCell>
                      <Badge variant="secondary" className={typeConfig.color}>
                        {typeConfig.icon} {typeConfig.shortLabel}
                      </Badge>
                    </TableCell>
                    
                    {/* Nom client */}
                    <TableCell className="font-medium">
                      {activity.clientName}
                    </TableCell>
                    
                    {/* N° contrat */}
                    <TableCell>
                      {activity.contractNumber || '-'}
                    </TableCell>
                    
                    {/* Date d'effet */}
                    <TableCell>
                      {activity.dateEffet ? formatDateShort(activity.dateEffet) : '-'}
                    </TableCell>
                    
                    {/* Origine */}
                    <TableCell>
                      {origineConfig ? (
                        <Badge variant="outline" className={origineConfig.color}>
                          {origineConfig.icon} {origineConfig.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    
                    {/* Compagnie */}
                    <TableCell>
                      {compagnieConfig ? (
                        <Badge variant="outline" className={compagnieConfig.color}>
                          {compagnieConfig.icon} {compagnieConfig.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    
                    {/* CA */}
                    <TableCell className="text-right font-medium">
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatEuroInt(activity.ca)}
                      </span>
                    </TableCell>
                    
                    {/* CA pondéré */}
                    <TableCell className="text-right font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatEuroInt(activity.caPondere)}
                      </span>
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

      {/* Modales (à implémenter plus tard) */}
      {/* <SanteCollViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        activity={selectedActivity}
      />

      <SanteCollEditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveEdit}
        activity={selectedActivity}
        loading={loading}
        isLocked={isLocked}
      />

      <SanteCollDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        activity={selectedActivity}
        loading={loading}
        isLocked={isLocked}
      /> */}
    </div>
  )
}

type SortField = 'dateSaisie' | 'clientName' | 'type' | 'ca' | 'caPondere'
type SortDirection = 'asc' | 'desc'
