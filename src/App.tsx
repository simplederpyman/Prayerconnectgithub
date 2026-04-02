import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthContext, useAuthState } from '@/hooks/useAuth'
import { ChurchContext, useChurchState } from '@/hooks/useChurch'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'

import { LandingPage } from '@/pages/Landing'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'
import { GebedsMuurPage } from '@/pages/GebedsMuur'
import { DelenPage } from '@/pages/Delen'
import { DashboardPage } from '@/pages/dashboard/Dashboard'
import { VerzoekenPage } from '@/pages/dashboard/Verzoeken'
import { VerzoekDetailPage } from '@/pages/dashboard/VerzoekDetail'
import { NieuwPage } from '@/pages/dashboard/Nieuw'
import { KalenderPage } from '@/pages/dashboard/Kalender'
import { TeamPage } from '@/pages/dashboard/Team'
import { RapportenPage } from '@/pages/dashboard/Rapporten'
import { InstellingenPage } from '@/pages/dashboard/Instellingen'

function ChurchProvider({ children }: { children: React.ReactNode }) {
  const churchState = useChurchState()
  return (
    <ChurchContext.Provider value={churchState}>
      {children}
    </ChurchContext.Provider>
  )
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const authState = useAuthState()

  return (
    <AuthContext.Provider value={authState}>
      <ChurchProvider>
        {children}
      </ChurchProvider>
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/kerk/:slug/gebedsmuur" element={<GebedsMuurPage />} />
          <Route path="/kerk/:slug/delen" element={<DelenPage />} />

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/verzoeken"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VerzoekenPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/verzoek/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VerzoekDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/nieuw"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NieuwPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/kalender"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <KalenderPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/team"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TeamPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/rapporten"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RapportenPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/instellingen"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <InstellingenPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
