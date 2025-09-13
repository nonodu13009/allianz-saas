import { UserProfile } from '@/components/auth/user-profile'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Shield } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-h2 font-poppins font-semibold">Allianz SaaS</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <UserProfile />
      </main>
    </div>
  )
}
