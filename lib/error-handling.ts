// Types d'erreurs Firebase
export enum FirebaseErrorType {
  NETWORK_ERROR = 'network_error',
  PERMISSION_DENIED = 'permission_denied',
  UNAVAILABLE = 'unavailable',
  DEADLINE_EXCEEDED = 'deadline_exceeded',
  UNAUTHENTICATED = 'unauthenticated',
  NOT_FOUND = 'not_found',
  ALREADY_EXISTS = 'already_exists',
  INVALID_ARGUMENT = 'invalid_argument',
  UNKNOWN = 'unknown'
}

// Configuration du retry
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Configuration par défaut
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 seconde
  maxDelay: 10000, // 10 secondes
  backoffMultiplier: 2
};

// Fonction pour déterminer le type d'erreur Firebase
export function getFirebaseErrorType(error: any): FirebaseErrorType {
  if (!error || !error.code) {
    return FirebaseErrorType.UNKNOWN;
  }

  const code = error.code.toLowerCase();
  
  if (code.includes('network') || code.includes('timeout')) {
    return FirebaseErrorType.NETWORK_ERROR;
  }
  if (code.includes('permission')) {
    return FirebaseErrorType.PERMISSION_DENIED;
  }
  if (code.includes('unavailable')) {
    return FirebaseErrorType.UNAVAILABLE;
  }
  if (code.includes('deadline')) {
    return FirebaseErrorType.DEADLINE_EXCEEDED;
  }
  if (code.includes('unauthenticated')) {
    return FirebaseErrorType.UNAUTHENTICATED;
  }
  if (code.includes('not-found')) {
    return FirebaseErrorType.NOT_FOUND;
  }
  if (code.includes('already-exists')) {
    return FirebaseErrorType.ALREADY_EXISTS;
  }
  if (code.includes('invalid-argument')) {
    return FirebaseErrorType.INVALID_ARGUMENT;
  }
  
  return FirebaseErrorType.UNKNOWN;
}

// Fonction pour déterminer si une erreur est retryable
export function isRetryableError(error: any): boolean {
  const errorType = getFirebaseErrorType(error);
  
  const retryableErrors = [
    FirebaseErrorType.NETWORK_ERROR,
    FirebaseErrorType.UNAVAILABLE,
    FirebaseErrorType.DEADLINE_EXCEEDED
  ];
  
  return retryableErrors.includes(errorType);
}

// Fonction pour calculer le délai de retry avec backoff exponentiel
export function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

// Fonction principale de retry avec gestion d'erreurs
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: string = 'operation'
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      console.log(`[${context}] Tentative ${attempt}/${finalConfig.maxRetries}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`[${context}] Succès après ${attempt} tentatives`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const errorType = getFirebaseErrorType(error);
      
      console.error(`[${context}] Tentative ${attempt} échouée:`, {
        error: error instanceof Error ? error.message : String(error),
        type: errorType,
        code: error instanceof Error && 'code' in error ? error.code : undefined
      });
      
      // Si ce n'est pas la dernière tentative et que l'erreur est retryable
      if (attempt < finalConfig.maxRetries && isRetryableError(error)) {
        const delay = calculateRetryDelay(attempt, finalConfig);
        console.log(`[${context}] Retry dans ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Si l'erreur n'est pas retryable ou qu'on a épuisé les tentatives
      break;
    }
  }
  
  // Toutes les tentatives ont échoué
  const errorType = getFirebaseErrorType(lastError);
  console.error(`[${context}] Échec définitif après ${finalConfig.maxRetries} tentatives:`, {
    error: lastError.message,
    type: errorType,
    code: lastError.code
  });
  
  throw new Error(`[${context}] Échec après ${finalConfig.maxRetries} tentatives: ${lastError.message}`);
}

// Fonction pour gérer les erreurs avec fallback
export async function withFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  context: string = 'operation'
): Promise<T> {
  try {
    return await withRetry(primaryOperation, {}, context);
  } catch (error) {
    console.warn(`[${context}] Opération principale échouée, utilisation du fallback:`, error instanceof Error ? error.message : String(error));
    
    try {
      return await withRetry(fallbackOperation, { maxRetries: 1 }, `${context}-fallback`);
    } catch (fallbackError) {
      console.error(`[${context}] Fallback également échoué:`, fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
      throw new Error(`[${context}] Opération principale et fallback ont échoué`);
    }
  }
}

// Fonction pour wrapper les opérations Firebase avec retry
export function createFirebaseOperation<T>(
  operation: () => Promise<T>,
  context: string,
  config?: Partial<RetryConfig>
) {
  return () => withRetry(operation, config, context);
}

// Fonction pour créer des opérations avec fallback
export function createFirebaseOperationWithFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  context: string
) {
  return () => withFallback(primaryOperation, fallbackOperation, context);
}
