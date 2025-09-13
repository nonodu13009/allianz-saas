import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Shield, ArrowLeft, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/allianz.svg"
              alt="Allianz"
              width={128}
              height={128}
            />
            <h1 className="text-h2 font-poppins font-semibold text-gray-900">Allianz SaaS</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icône d'erreur */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-danger-500/10 rounded-full flex items-center justify-center">
              <Shield className="h-12 w-12 text-danger-500" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-gray-900 mb-6">
            Accès Refusé
          </h1>

          {/* Message d'erreur */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-poppins font-medium text-gray-700 mb-4">
              Email non autorisé
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Cette plateforme est réservée aux employés d&apos;Allianz Nogaro.
            </p>
            <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-danger-500">
                <Mail className="h-5 w-5" />
                <span className="font-medium">
                  Seuls les emails @allianz-nogaro.fr sont autorisés
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pour accéder à la plateforme :
            </h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Utilisez votre email professionnel @allianz-nogaro.fr
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Contactez votre administrateur si vous n&apos;avez pas encore de compte
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Vérifiez que votre adresse email est correcte
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Réessayer la connexion
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>

          {/* Contact */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Besoin d&apos;aide ? Contactez l&apos;équipe technique Allianz
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Email : support@allianz-nogaro.fr
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
