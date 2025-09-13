"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Building, MapPin, Calendar, Shield, LogOut, Save } from 'lucide-react'

export function UserProfile() {
  const { user, updateUser, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: user?.company || '',
    position: user?.position || '',
    department: user?.department || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || ''
    }
  })

  if (!user) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateUser(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company || '',
      position: user.position || '',
      department: user.department || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || ''
      }
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Mon Profil</h1>
          <p className="text-body text-muted-foreground">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Modifier le profil
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                {isEditing ? (
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  />
                ) : (
                  <p className="text-body mt-1">{user.firstName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                {isEditing ? (
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  />
                ) : (
                  <p className="text-body mt-1">{user.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-body mt-1">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rôle
              </label>
              <p className="text-body mt-1 capitalize">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
              {isEditing ? (
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  placeholder="Nom de l'entreprise"
                />
              ) : (
                <p className="text-body mt-1">{user.company || 'Non renseigné'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Poste</label>
              {isEditing ? (
                <input
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  placeholder="Titre du poste"
                />
              ) : (
                <p className="text-body mt-1">{user.position || 'Non renseigné'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Département</label>
              {isEditing ? (
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  placeholder="Département"
                />
              ) : (
                <p className="text-body mt-1">{user.department || 'Non renseigné'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rue</label>
              {isEditing ? (
                <input
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  placeholder="123 Rue de la Paix"
                />
              ) : (
                <p className="text-body mt-1">{user.address?.street || 'Non renseigné'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ville</label>
                {isEditing ? (
                  <input
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                    placeholder="Paris"
                  />
                ) : (
                  <p className="text-body mt-1">{user.address?.city || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code postal</label>
                {isEditing ? (
                  <input
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                    placeholder="75001"
                  />
                ) : (
                  <p className="text-body mt-1">{user.address?.postalCode || 'Non renseigné'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Pays</label>
              {isEditing ? (
                <input
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg focus-ring"
                  placeholder="France"
                />
              ) : (
                <p className="text-body mt-1">{user.address?.country || 'Non renseigné'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Membre depuis</label>
              <p className="text-body mt-1">
                {user.createdAt.toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dernière connexion</label>
              <p className="text-body mt-1">
                {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString('fr-FR') : 'Jamais'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <p className="text-body mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.isActive 
                    ? 'bg-success-500/10 text-success-500' 
                    : 'bg-danger-500/10 text-danger-500'
                }`}>
                  {user.isActive ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Déconnexion</h3>
              <p className="text-sm text-muted-foreground">
                Déconnectez-vous de votre compte
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
