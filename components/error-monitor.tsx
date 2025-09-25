'use client';

import { useEffect, useState } from 'react';
import { logger, LogEntry, LogCategory } from '@/lib/logger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ErrorMonitorProps {
  showInProduction?: boolean;
}

export function ErrorMonitor({ showInProduction = false }: ErrorMonitorProps) {
  const [recentErrors, setRecentErrors] = useState<LogEntry[]>([]);
  const [networkErrors, setNetworkErrors] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Surveiller les erreurs récentes
  useEffect(() => {
    const checkErrors = () => {
      const errors = logger.getRecentErrors();
      const networkErrs = logger.getNetworkErrors();
      
      setRecentErrors(errors);
      setNetworkErrors(networkErrs);
      
      // Afficher le monitor si des erreurs critiques sont détectées
      if (errors.length > 0 || networkErrs.length > 0) {
        setIsVisible(true);
      }
    };

    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkErrors, 5000);
    checkErrors(); // Vérification immédiate

    return () => clearInterval(interval);
  }, []);

  // Surveiller l'état de la connexion réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsVisible(false); // Masquer les erreurs réseau si reconnecté
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true); // Afficher immédiatement si déconnecté
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier l'état initial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ne pas afficher en production sauf si explicitement demandé
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const getErrorSeverity = (error: LogEntry) => {
    if (error.category === LogCategory.NETWORK) return 'critical';
    if (error.category === LogCategory.DATABASE) return 'high';
    if (error.category === LogCategory.AUTH) return 'medium';
    return 'low';
  };

  const getErrorIcon = (category: LogCategory) => {
    switch (category) {
      case LogCategory.NETWORK:
        return <WifiOff className="h-4 w-4" />;
      case LogCategory.DATABASE:
        return <AlertTriangle className="h-4 w-4" />;
      case LogCategory.AUTH:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const clearErrors = () => {
    setRecentErrors([]);
    setNetworkErrors([]);
    setIsVisible(false);
  };

  const refreshData = () => {
    // Déclencher un rechargement des données
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Monitoring des erreurs
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearErrors}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* État de la connexion */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connexion OK</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Hors ligne</span>
              </>
            )}
          </div>

          {/* Erreurs réseau critiques */}
          {networkErrors.length > 0 && (
            <Alert className="border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-red-800 dark:text-red-200">
                Erreurs réseau critiques ({networkErrors.length})
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-300">
                {networkErrors.slice(0, 2).map((error, index) => (
                  <div key={index} className="text-xs mt-1">
                    {error.message}
                  </div>
                ))}
                {networkErrors.length > 2 && (
                  <div className="text-xs mt-1">
                    +{networkErrors.length - 2} autres erreurs...
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Autres erreurs récentes */}
          {recentErrors.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-800 dark:text-red-200">
                Erreurs récentes ({recentErrors.length})
              </div>
              {recentErrors.slice(0, 3).map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {getErrorIcon(error.category)}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      getErrorSeverity(error) === 'critical' 
                        ? 'border-red-500 text-red-700' 
                        : 'border-orange-500 text-orange-700'
                    }`}
                  >
                    {error.category}
                  </Badge>
                  <span className="text-red-700 dark:text-red-300 truncate">
                    {error.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions recommandées */}
          <div className="pt-2 border-t border-red-200 dark:border-red-700">
            <div className="text-xs text-red-600 dark:text-red-400">
              Actions recommandées:
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              • Vérifier la connexion réseau
              • Recharger la page si nécessaire
              • Contacter le support si les erreurs persistent
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
