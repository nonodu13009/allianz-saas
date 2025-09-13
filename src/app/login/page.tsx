import { LoginForm } from '@/components/auth/login-form'
import { Header } from '@/components/layout/header'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Image de fond avec flou léger - même style que homepage */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login.jpg"
          alt="Allianz Login"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Header 
          variant="login"
          showWeather={false}
          showUserActions={false}
          showThemeToggle={true}
          logoSize="medium"
          className="border-white/20 bg-black/10 backdrop-blur-sm"
        />
      </div>

      {/* Contenu principal centré - même style que homepage */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          {/* Logo Allianz très grand avec animation - même style que homepage */}
          <div className="mb-8">
            <Image
              src="/allianz.svg"
              alt="Allianz"
              width={200}
              height={200}
              className="mx-auto drop-shadow-2xl animate-pulse hover:scale-110 hover:rotate-3 transition-all duration-1000"
            />
          </div>

          {/* Titres avec animation - même style que homepage */}
          <h1 className="text-6xl md:text-7xl font-poppins font-bold mb-6 drop-shadow-2xl">
            <span className="inline-block animate-pulse">Allianz</span>{' '}
            <span className="inline-block animate-bounce">Marseille</span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-poppins font-medium mb-6 drop-shadow-xl">
            Saas de pilotage réservé
          </h2>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <LoginForm />
          </div>

          {/* Particules flottantes - même style que homepage */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
