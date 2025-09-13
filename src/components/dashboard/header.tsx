import { Header } from '@/components/layout/header'

export function DashboardHeader() {
  return (
    <Header 
      variant="dashboard"
      showWeather={true}
      showUserActions={true}
      showThemeToggle={true}
      logoSize="large"
    />
  )
}