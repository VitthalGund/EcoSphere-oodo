import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { LoginPage } from "./features/auth/LoginPage";
import { Layout } from "./components/Layout";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";

// Phase 2 real page imports
import { DepartmentsPage } from "./features/settings/DepartmentsPage";
import { CategoriesPage } from "./features/settings/CategoriesPage";
import { ESGConfigPage } from "./features/settings/ESGConfigPage";
import { EmissionFactorsPage } from "./features/environmental/EmissionFactorsPage";

// Phase 3 real page imports
import { EnvironmentalDashboard } from "./features/environmental/EnvironmentalDashboard";
import { CarbonTransactionsPage } from "./features/environmental/CarbonTransactionsPage";
import { EnvironmentalGoalsPage } from "./features/environmental/EnvironmentalGoalsPage";

// Phase 4 real page imports
import { ChallengesPage } from "./features/gamification/ChallengesPage";
import { ChallengeDetailPage } from "./features/gamification/ChallengeDetailPage";
import { BadgesPage } from "./features/gamification/BadgesPage";
import { RewardsPage } from "./features/gamification/RewardsPage";
import { LeaderboardPage } from "./features/gamification/LeaderboardPage";

// Phase 7 real page imports
import { CSRActivitiesPage } from "./features/social/CSRActivitiesPage";
import { CSRParticipationsPage } from "./features/social/CSRParticipationsPage";
import { PoliciesPage } from "./features/governance/PoliciesPage";
import { AcknowledgementsPage } from "./features/governance/AcknowledgementsPage";

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
                  <DashboardPage />
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
                  <CSRActivitiesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/participation"
            element={
              <ProtectedRoute>
                <Layout>
                  <CSRParticipationsPage />
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
                  <PoliciesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/governance/acknowledgements"
            element={
              <ProtectedRoute>
                <Layout>
                  <AcknowledgementsPage />
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
                  <ChallengesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/challenges/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChallengeDetailPage />
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
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/rewards"
            element={
              <ProtectedRoute>
                <Layout>
                  <RewardsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification/leaderboards"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeaderboardPage />
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
          className:
            "bg-base border border-border text-text-primary rounded-xl text-xs font-bold font-sans shadow-lg",
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#2f9e44",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#e03131",
              secondary: "#fff",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
