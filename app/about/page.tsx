'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, Building, Shield, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" className="hover:scale-105 transition-transform">
                Se connecter
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                À propos de{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  notre plateforme
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Découvrez notre intranet agence dédié à l'équipe Boetti-Nogaro
              </p>
            </div>
          </div>

          {/* Cartes d'information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Intranet Agence */}
            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Intranet Agence
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Cette plateforme est un <strong>intranet d'agence</strong> spécialement conçu 
                  pour l'équipe <strong>Boetti-Nogaro</strong>. Elle centralise tous les outils 
                  nécessaires à la gestion administrative et commerciale de l'agence.
                </p>
              </CardContent>
            </Card>

            {/* Accès Restreint */}
            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Accès Restreint
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  L'accès à cette plateforme est <strong>strictement réservé</strong> aux membres 
                  autorisés de l'agence. Toute utilisation non autorisée est interdite et 
                  peut faire l'objet de poursuites.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact */}
          <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  Support Technique
                </CardTitle>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                En cas de problème technique ou de question sur la plateforme
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Principal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contact Principal
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <a 
                          href="mailto:jm.nogaro@allianz.fr"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          jm.nogaro@allianz.fr
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                        <a 
                          href="tel:+33608183338"
                          className="text-green-600 dark:text-green-400 hover:underline font-medium"
                        >
                          +33 6 08 18 33 38
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <strong>Responsable :</strong> Jean-Michel Nogaro
                    </p>
                    <p>
                      <strong>Agence :</strong> Boetti-Nogaro
                    </p>
                    <p>
                      <strong>Disponibilité :</strong> Du lundi au vendredi, 9h-18h
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton retour */}
          <div className="text-center mt-12">
            <Link href="/">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>
      </main>
    </div>
  );
}
