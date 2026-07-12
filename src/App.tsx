import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ProtectedRoute } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { Layout } from './components/Layout';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Phase 2 real page imports
import { DepartmentsPage } from './features/settings/DepartmentsPage';
import { CategoriesPage } from './features/settings/CategoriesPage';
import { ESGConfigPage } from './features/settings/ESGConfigPage';
import { EmissionFactorsPage } from './features/environmental/EmissionFactorsPage';

// Phase 3 real page imports
import { EnvironmentalDashboard } from './features/environmental/EnvironmentalDashboard';
import { CarbonTransactionsPage } from './features/environmental/CarbonTransactionsPage';
import { EnvironmentalGoalsPage } from './features/environmental/EnvironmentalGoalsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes (wrapped in Layout) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Dashboard Center" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Environmental Routes */}
          <Route
            path="/environmental/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <EnvironmentalDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/environmental/factors"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmissionFactorsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/environmental/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <CarbonTransactionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/environmental/goals"
            element={
              <ProtectedRoute>
                <Layout>
                  <EnvironmentalGoalsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Social Routes */}
          <Route
            path="/social/activities"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="CSR Activities Catalog" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/participation"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Employee CSR Participation" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Governance Routes */}
          <Route
            path="/governance/policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="ESG Policies Docs" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/governance/acknowledgements"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Policy Acknowledgements" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Gamification Routes */}
          <Route
            path="/gamification/challenges"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Sustainability Challenges" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/participation"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Challenge Participation Feed" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Gamified Achievement Badges" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/rewards"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Eco Rewards Store" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/leaderboards"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Performance Leaderboards" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports/summary"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="ESG Score Summary Reports" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/builder"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Custom ESG Report Builder" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Settings Routes */}
          <Route
            path="/settings/departments"
            element={
              <ProtectedRoute>
                <Layout>
                  <DepartmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/config"
            element={
              <ProtectedRoute>
                <Layout>
                  <ESGConfigPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notification Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-base border border-border text-text-primary rounded-xl text-xs font-bold font-sans shadow-lg',
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#2f9e44',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#e03131',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
