import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import LoginPage from "@/pages/LoginPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ProjectNewPage from "@/pages/ProjectNewPage";
import AssessmentNewPage from "@/pages/AssessmentNewPage";
import AssessmentDetailPage from "@/pages/AssessmentDetailPage";
import FrameworksPage from "@/pages/FrameworksPage";
import FrameworkVersionDetailPage from "@/pages/FrameworkVersionDetailPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route
            path="/projects"
            element={<AuthGuard><ProjectsPage /></AuthGuard>}
          />
          <Route
            path="/projects/new"
            element={<AuthGuard><ProjectNewPage /></AuthGuard>}
          />
          <Route
            path="/projects/:id"
            element={<AuthGuard><ProjectDetailPage /></AuthGuard>}
          />
          <Route
            path="/assessments/new"
            element={<AuthGuard><AssessmentNewPage /></AuthGuard>}
          />
          <Route
            path="/assessments/:id"
            element={<AuthGuard><AssessmentDetailPage /></AuthGuard>}
          />
          <Route
            path="/frameworks"
            element={<AuthGuard><FrameworksPage /></AuthGuard>}
          />
          <Route
            path="/frameworks/:frameworkId/versions/:versionId"
            element={<AuthGuard><FrameworkVersionDetailPage /></AuthGuard>}
          />
          <Route
            path="/analytics"
            element={<AuthGuard><AnalyticsPage /></AuthGuard>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
