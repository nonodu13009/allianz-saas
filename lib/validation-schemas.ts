import { z } from 'zod';

// Schéma pour la création d'utilisateur
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court').max(100, 'Mot de passe trop long'),
  prenom: z.string().min(1, 'Prénom requis').max(50, 'Prénom trop long'),
  nom: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  role: z.enum(['administrateur', 'cdc_commercial', 'cdc_sante_coll', 'cdc_sante_ind', 'cdc_sinistre']),
  role_front: z.string().optional(),
  etp: z.string().optional().transform(val => val ? parseFloat(val) : 1),
  genre: z.enum(['Homme', 'Femme']).optional()
});

// Schéma pour la mise à jour d'utilisateur
export const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  password: z.string().min(6, 'Mot de passe trop court').max(100, 'Mot de passe trop long').optional(),
  prenom: z.string().min(1, 'Prénom requis').max(50, 'Prénom trop long').optional(),
  nom: z.string().min(1, 'Nom requis').max(50, 'Nom trop long').optional(),
  role: z.enum(['administrateur', 'cdc_commercial', 'cdc_sante_coll', 'cdc_sante_ind', 'cdc_sinistre']).optional(),
  role_front: z.string().optional(),
  etp: z.number().min(0).max(2).optional(),
  genre: z.enum(['Homme', 'Femme']).optional()
});

// Schéma pour le changement de mot de passe en masse
export const bulkPasswordUpdateSchema = z.object({
  users: z.array(z.object({
    uid: z.string().min(1, 'UID requis'),
    email: z.string().email('Email invalide'),
    prenom: z.string(),
    nom: z.string()
  })).min(1, 'Au moins un utilisateur requis'),
  newPassword: z.string().min(8, 'Mot de passe trop court').max(100, 'Mot de passe trop long')
});

// Schéma pour les commissions
export const commissionSchema = z.object({
  year: z.number().int().min(2020).max(2030),
  month: z.enum(['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']),
  commissions_iard: z.number().min(0),
  commissions_vie: z.number().min(0),
  commissions_courtage: z.number().min(0),
  profits_exceptionnels: z.number().min(0),
  charges_agence: z.number().min(0),
  prelevements_julien: z.number().min(0),
  prelevements_jean_michel: z.number().min(0)
});

// Schéma pour les activités commerciales
export const commercialActivitySchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  clientName: z.string().min(1, 'Nom du client requis').max(100, 'Nom trop long'),
  contractNumber: z.string().min(1, 'Numéro de contrat requis').max(50, 'Numéro trop long'),
  effectDate: z.date(),
  actType: z.enum(['an', 'm+3', 'preterme_auto', 'preterme_iard']),
  productType: z.string().min(1, 'Type de produit requis'),
  company: z.string().min(1, 'Compagnie requise'),
  annualPremium: z.number().min(0, 'Prime annuelle doit être positive')
});

// Schéma pour la pagination
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(1000).default(50),
  startAfter: z.string().optional(),
  searchTerm: z.string().optional(),
  year: z.number().int().optional()
});

// Fonction utilitaire pour valider les données
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erreur de validation inconnue'] };
  }
}

// Fonction pour valider les paramètres de requête
export function validateQueryParams(schema: z.ZodSchema, searchParams: URLSearchParams): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  const params: any = {};
  
  for (const [key, value] of Array.from(searchParams.entries())) {
    // Convertir les valeurs numériques
    if (key === 'limit' || key === 'year') {
      params[key] = parseInt(value, 10);
    } else {
      params[key] = value;
    }
  }
  
  return validateData(schema, params);
}
