import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { GoogleCallbackPage } from '@/pages/auth/GoogleCallbackPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { UserDashboardPage } from '@/pages/dashboard/UserDashboardPage';
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { ThemesPage } from '@/pages/themes/ThemesPage';
import { QuizzesPage } from '@/pages/quizzes/QuizzesPage';
import { QuizDetailPage } from '@/pages/quizzes/QuizDetailPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { LeaderboardPage } from '@/pages/leaderboard/LeaderboardPage';
import { HistoryPage } from '@/pages/history/HistoryPage';
import RevisionQuizPage from '@/pages/quizzes/RevisionQuizPage';
import AdminEmailPage from '@/pages/admin/AdminEmailPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { HelpPage } from '@/pages/legal/HelpPage';
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage';
import { useAuthStore } from '@/store/auth';
import './index.css';

function RoleBasedDashboard() {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? <AdminDashboardPage /> : <UserDashboardPage />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Google OAuth Callback */}
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />

          {/* Public Terms Page (accessible without authentication) */}
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<RoleBasedDashboard />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:id" element={<QuizDetailPage />} />
            <Route path="/revision" element={<RevisionQuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/email" element={<AdminEmailPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App
