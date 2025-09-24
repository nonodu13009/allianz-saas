import winston from 'winston';

// Configuration des niveaux de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Configuration des couleurs pour les logs
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format pour les fichiers (sans couleurs)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: logLevels,
  format: fileFormat,
  transports: [
    // Console transport pour le développement
    new winston.transports.Console({
      format: logFormat,
    }),
    
    // Fichier pour les erreurs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
});

// Logger spécialisé pour les opérations Firebase
export const firebaseLogger = {
  info: (message: string, meta?: any) => {
    logger.info(`[FIREBASE] ${message}`, meta);
  },
  
  error: (message: string, error?: any, meta?: any) => {
    logger.error(`[FIREBASE] ${message}`, { error: error?.message, stack: error?.stack, ...meta });
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(`[FIREBASE] ${message}`, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(`[FIREBASE] ${message}`, meta);
  }
};

// Logger spécialisé pour les APIs
export const apiLogger = {
  info: (message: string, meta?: any) => {
    logger.info(`[API] ${message}`, meta);
  },
  
  error: (message: string, error?: any, meta?: any) => {
    logger.error(`[API] ${message}`, { error: error?.message, stack: error?.stack, ...meta });
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(`[API] ${message}`, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(`[API] ${message}`, meta);
  }
};

// Logger spécialisé pour l'authentification
export const authLogger = {
  info: (message: string, meta?: any) => {
    logger.info(`[AUTH] ${message}`, meta);
  },
  
  error: (message: string, error?: any, meta?: any) => {
    logger.error(`[AUTH] ${message}`, { error: error?.message, stack: error?.stack, ...meta });
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(`[AUTH] ${message}`, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(`[AUTH] ${message}`, meta);
  }
};

// Logger spécialisé pour les performances
export const perfLogger = {
  info: (operation: string, duration: number, meta?: any) => {
    logger.info(`[PERF] ${operation} completed in ${duration}ms`, meta);
  },
  
  warn: (operation: string, duration: number, meta?: any) => {
    logger.warn(`[PERF] ${operation} took ${duration}ms (slow)`, meta);
  }
};

// Fonction utilitaire pour mesurer les performances
export function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName: string,
  meta?: any
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then(result => {
      const duration = Date.now() - startTime;
      perfLogger.info(operationName, duration, meta);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      perfLogger.warn(`${operationName} (failed)`, duration, { ...meta, error: error.message });
      throw error;
    });
}

// Fonction pour logger les requêtes HTTP
export function logHttpRequest(req: any, res: any, next?: any) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    if (res.statusCode >= 400) {
      apiLogger.error('HTTP Request Error', null, logData);
    } else {
      apiLogger.info('HTTP Request', logData);
    }
  });
  
  if (next) next();
}

export default logger;
