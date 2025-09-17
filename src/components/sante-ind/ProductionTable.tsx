"use client"

import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import { 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  Filter,
  Lock,
  Unlock
} from 'lucide-react'

import {
  SanteIndActivity,
  SanteIndFilter,
  SanteIndSort,
  SanteIndSortField,
  SortDirection,
  LockStatus,
  ACTE_TYPE_LABELS,
  COMPAGNIE_LABELS
} from '../../types/sante-ind'

import {
  santeIndService,
  filterActivities,
  sortActivities,
  formatDateShort,
  formatEuroInt
} from '../../lib/sante-ind-service'

// ============================================================================
// PROPS ET TYPES
// ============================================================================

interface ProductionTableProps {
  activities: SanteIndActivity[]
  lockStatus: LockStatus
  isLoading?: boolean
  onView: (activity: SanteIndActivity) => void
  onEdit: (activity: SanteIndActivity) => void
  onDelete: (activity: SanteIndActivity) => void
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ProductionTable({
  activities,
  lockStatus,
  isLoading = false,
  onView,
  onEdit,
  onDelete
}: ProductionTableProps) {
  // ============================================================================
  // ÉTAT LOCAL
  // ============================================================================
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<SanteIndFilter>({})
  const [sort, setSort] = useState<SanteIndSort>({
    field: 'dateSaisie',
    direction: 'desc'
  })

  // ============================================================================
  // CALCULS DÉRIVÉS
  // ============================================================================
  
  const filteredAndSortedActivities = useMemo(() => {
    let result = activities

    // Appliquer le filtre de recherche
    if (searchTerm) {
      const searchFilter: SanteIndFilter = {
        ...filter,
        nomClient: searchTerm
      }
      result = filterActivities(result, searchFilter)
    } else {
      result = filterActivities(result, filter)
    }

    // Appliquer le tri
    result = sortActivities(result, sort)

    return result
  }, [activities, filter, searchTerm, sort])

  // ============================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================
  
  const handleSort = (field: SanteIndSortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (field: SanteIndSortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sort.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />
  }

  const isLocked = lockStatus === 'locked'
  const canPerformActions = !isLocked

  // ============================================================================
  // RENDU
  // ============================================================================
  
  return (
    <div className="space-y-4">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            Tableau de production ({filteredAndSortedActivities.length} activité{filteredAndSortedActivities.length > 1 ? 's' : ''})
          </h3>
          
          {/* Indicateur de verrouillage */}
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Mois verrouillé
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center gap-1">
                <Unlock className="h-3 w-3" />
                Mois ouvert
              </Badge>
            )}
          </div>
        </div>

        {/* Contrôles de recherche et filtrage */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('dateSaisie')}>
                <div className="flex items-center gap-2">
                  Jour
                  {getSortIcon('dateSaisie')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('nomClient')}>
                <div className="flex items-center gap-2">
                  Client
                  {getSortIcon('nomClient')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('natureActe')}>
                <div className="flex items-center gap-2">
                  Nature
                  {getSortIcon('natureActe')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('numeroContrat')}>
                <div className="flex items-center gap-2">
                  Contrat
                  {getSortIcon('numeroContrat')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('dateEffet')}>
                <div className="flex items-center gap-2">
                  Date d'effet
                  {getSortIcon('dateEffet')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('ca')}>
                <div className="flex items-center gap-2">
                  CA
                  {getSortIcon('ca')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('caPondere')}>
                <div className="flex items-center gap-2">
                  CA pondéré
                  {getSortIcon('caPondere')}
                </div>
              </TableHead>
              
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('compagnie')}>
                <div className="flex items-center gap-2">
                  Compagnie
                  {getSortIcon('compagnie')}
                </div>
              </TableHead>
              
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              // État de chargement
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Chargement des activités...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAndSortedActivities.length === 0 ? (
              // État vide
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  {searchTerm || Object.keys(filter).length > 0 
                    ? 'Aucune activité ne correspond à vos critères'
                    : 'Aucune activité enregistrée pour ce mois'
                  }
                </TableCell>
              </TableRow>
            ) : (
              // Données
              filteredAndSortedActivities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {formatDateShort(activity.dateSaisie)}
                  </TableCell>
                  
                  <TableCell className="font-medium">
                    {activity.nomClient}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary">
                      {ACTE_TYPE_LABELS[activity.natureActe]}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="font-mono text-sm">
                    {activity.numeroContrat}
                  </TableCell>
                  
                  <TableCell>
                    {formatDateShort(activity.dateEffet)}
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {formatEuroInt(activity.ca)}
                  </TableCell>
                  
                  <TableCell className="text-right font-semibold text-blue-600">
                    {formatEuroInt(activity.caPondere)}
                  </TableCell>
                  
                  <TableCell>
                    {activity.compagnie ? (
                      <Badge variant="outline">
                        {COMPAGNIE_LABELS[activity.compagnie]}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(activity)}
                        className="h-8 w-8 p-0"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(activity)}
                        disabled={!canPerformActions}
                        className="h-8 w-8 p-0"
                        title={canPerformActions ? "Modifier" : "Mois verrouillé"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(activity)}
                        disabled={!canPerformActions}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={canPerformActions ? "Supprimer" : "Mois verrouillé"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message d'information si verrouillé */}
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="text-yellow-800 font-medium">Mois verrouillé</h4>
              <p className="text-yellow-700 text-sm">
                Ce mois a été verrouillé par l'administrateur. Les modifications ne sont plus possibles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
