import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const TaskManagementPage = lazy(() => import("./pages/TaskManagementPage"));
const GanttPage = lazy(() => import("./pages/GanttPage"));
const TimeTrackingPage = lazy(() => import("./pages/TimeTrackingPage"));
const CollaborationPage = lazy(() => import("./pages/CollaborationPage"));
const FileManagementPage = lazy(() => import("./pages/FileManagementPage"));
const BudgetManagementPage = lazy(() => import("./pages/BudgetManagementPage"));
const ReportingPage = lazy(() => import("./pages/ReportingPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const AiPage = lazy(() => import("./pages/AiPage"));
const CodeReviewPage = lazy(() => import("./pages/CodeReviewPage"));
const BurndownPage = lazy(() => import("./pages/BurndownPage"));
const MoodBoardPage = lazy(() => import("./pages/MoodBoardPage"));
const SprintPlannerPage = lazy(() => import("./pages/SprintPlannerPage"));
const TechDebtPage = lazy(() => import("./pages/TechDebtPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function PageFallback() {
  const T = useTheme();
  return <div style={{ padding: 40, color: T.t3, fontFamily: T.mono, fontSize: 12 }}>loading…</div>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DataProvider>
                <AppLayout />
              </DataProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="tasks" element={<TaskManagementPage />} />
          <Route path="gantt" element={<GanttPage />} />
          <Route path="timetrack" element={<TimeTrackingPage />} />
          <Route path="collaboration" element={<CollaborationPage />} />
          <Route path="files" element={<FileManagementPage />} />
          <Route path="budget" element={<BudgetManagementPage />} />
          <Route path="reports" element={<ReportingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-analyst" element={<AiPage />} />
          <Route path="code-review" element={<CodeReviewPage />} />
          <Route path="burndown" element={<BurndownPage />} />
          <Route path="team-mood" element={<MoodBoardPage />} />
          <Route path="sprint-planner" element={<SprintPlannerPage />} />
          <Route path="tech-debt" element={<TechDebtPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
