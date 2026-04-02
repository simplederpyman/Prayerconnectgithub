import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, LayoutDashboard, List, Plus, Users,
  BarChart2, Settings, Menu, X, LogOut, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useChurch } from '@/hooks/useChurch'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overzicht', icon: LayoutDashboard },
  { href: '/dashboard/verzoeken', label: 'Gebedsmuur', icon: List },
  { href: '/dashboard/nieuw', label: 'Nieuw verzoek', icon: Plus },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/rapporten', label: 'Rapporten', icon: BarChart2 },
  { href: '/dashboard/instellingen', label: 'Instellingen', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const { church } = useChurch()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn('flex flex-col h-full', mobile && 'pt-4')}>
      <div className="px-4 pb-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Heart className="h-6 w-6 fill-primary" />
          <span>SamenBidden</span>
        </Link>
        {church && (
          <p className="text-xs text-gray-500 mt-1 ml-8">{church.name}</p>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-primary'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="h-3 w-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {church && (
        <div className="px-2 pb-4">
          <Link
            to={`/kerk/${church.slug}/gebedsmuur`}
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-primary transition-all"
          >
            <Heart className="h-4 w-4" />
            Publieke gebedsmuur
          </Link>
        </div>
      )}

      <div className="p-4 border-t border-gray-100">
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-gray-600">
          <LogOut className="h-4 w-4" />
          Uitloggen
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 shrink-0">
        <div className="flex flex-col h-full py-4">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-gray-100 lg:hidden"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-purple-50">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-primary">
            <Heart className="h-5 w-5 fill-primary" />
            <span>SamenBidden</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
