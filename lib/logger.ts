/**
 * Système de logging intelligent pour l'application
 * Remplace les console.log verbeux par un système structuré
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export enum LogCategory {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTH = 'AUTH',
  UI = 'UI',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
}

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: string;
  data?: any;
  timestamp: Date;
  userId?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private isDevelopment: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const category = entry.category;
    const context = entry.context ? `[${entry.context}]` : '';
    const userId = entry.userId ? `[User:${entry.userId}]` : '';
    
    return `${timestamp} ${level} ${category} ${context} ${userId} ${entry.message}`;
  }

  private log(level: LogLevel, category: LogCategory, message: string, context?: string, data?: any, userId?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      category,
      message,
      context,
      data,
      timestamp: new Date(),
      userId,
    };

    // Ajouter au buffer pour monitoring
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Afficher selon le niveau
    const formattedMessage = this.formatMessage(entry);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(formattedMessage, data || '');
        }
        break;
    }
  }

  // Méthodes publiques
  error(category: LogCategory, message: string, context?: string, data?: any, userId?: string): void {
    this.log(LogLevel.ERROR, category, message, context, data, userId);
  }

  warn(category: LogCategory, message: string, context?: string, data?: any, userId?: string): void {
    this.log(LogLevel.WARN, category, message, context, data, userId);
  }

  info(category: LogCategory, message: string, context?: string, data?: any, userId?: string): void {
    this.log(LogLevel.INFO, category, message, context, data, userId);
  }

  debug(category: LogCategory, message: string, context?: string, data?: any, userId?: string): void {
    this.log(LogLevel.DEBUG, category, message, context, data, userId);
  }

  // Méthodes spécialisées pour les cas courants
  networkError(message: string, context?: string, data?: any): void {
    this.error(LogCategory.NETWORK, message, context, data);
  }

  networkInfo(message: string, context?: string, data?: any): void {
    this.info(LogCategory.NETWORK, message, context, data);
  }

  databaseError(message: string, context?: string, data?: any): void {
    this.error(LogCategory.DATABASE, message, context, data);
  }

  databaseInfo(message: string, context?: string, data?: any): void {
    this.info(LogCategory.DATABASE, message, context, data);
  }

  authError(message: string, context?: string, data?: any, userId?: string): void {
    this.error(LogCategory.AUTH, message, context, data, userId);
  }

  authInfo(message: string, context?: string, data?: any, userId?: string): void {
    this.info(LogCategory.AUTH, message, context, data, userId);
  }

  businessError(message: string, context?: string, data?: any, userId?: string): void {
    this.error(LogCategory.BUSINESS, message, context, data, userId);
  }

  businessInfo(message: string, context?: string, data?: any, userId?: string): void {
    this.info(LogCategory.BUSINESS, message, context, data, userId);
  }

  // Monitoring des erreurs critiques
  getRecentErrors(): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === LogLevel.ERROR);
  }

  getNetworkErrors(): LogEntry[] {
    return this.logBuffer.filter(entry => 
      entry.level === LogLevel.ERROR && entry.category === LogCategory.NETWORK
    );
  }

  // Configuration
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  setDevelopmentMode(isDev: boolean): void {
    this.isDevelopment = isDev;
    this.currentLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;
  }
}

// Instance singleton
export const logger = new Logger();

// Fonctions utilitaires pour migration facile
export const logNetworkError = (message: string, context?: string, data?: any) => 
  logger.networkError(message, context, data);

export const logNetworkInfo = (message: string, context?: string, data?: any) => 
  logger.networkInfo(message, context, data);

export const logDatabaseError = (message: string, context?: string, data?: any) => 
  logger.databaseError(message, context, data);

export const logDatabaseInfo = (message: string, context?: string, data?: any) => 
  logger.databaseInfo(message, context, data);

export const logAuthError = (message: string, context?: string, data?: any, userId?: string) => 
  logger.authError(message, context, data, userId);

export const logAuthInfo = (message: string, context?: string, data?: any, userId?: string) => 
  logger.authInfo(message, context, data, userId);

export const logBusinessError = (message: string, context?: string, data?: any, userId?: string) => 
  logger.businessError(message, context, data, userId);

export const logBusinessInfo = (message: string, context?: string, data?: any, userId?: string) => 
  logger.businessInfo(message, context, data, userId);