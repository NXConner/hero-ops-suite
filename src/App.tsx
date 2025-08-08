import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdvancedThemeProvider } from "@/contexts/AdvancedThemeContext";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import ThemeBackground from "./components/theme/ThemeBackground";

// Lazy load heavy components that use 3D libraries, maps, or ML
const MissionPlanning = lazy(() => import("./pages/MissionPlanning"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Communications = lazy(() => import("./pages/Communications"));
const IntelReports = lazy(() => import("./pages/IntelReports"));
const Settings = lazy(() => import("./pages/Settings"));
const PavementScanPro = lazy(() => import("./pages/PavementScanPro"));
const OverWatch = lazy(() => import("./pages/OverWatch"));
const Estimator = lazy(() => import("./pages/Estimator"));
const AdvancedThemeCustomizer = lazy(() => import("./components/theme/AdvancedThemeCustomizer"));
// ThemeBackground is imported eagerly above for consistent rendering

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

const App = () => (
  <AdvancedThemeProvider defaultTheme="military-tactical">
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ThemeBackground />
          <BrowserRouter>
            <ScrollToTop />
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mission-planning" element={<ErrorBoundary><MissionPlanning /></ErrorBoundary>} />
                  <Route path="/team-management" element={<ErrorBoundary><TeamManagement /></ErrorBoundary>} />
                  <Route path="/analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
                  <Route path="/communications" element={<ErrorBoundary><Communications /></ErrorBoundary>} />
                  <Route path="/intel-reports" element={<ErrorBoundary><IntelReports /></ErrorBoundary>} />
                  <Route path="/pavement-scan-pro" element={<ErrorBoundary><PavementScanPro /></ErrorBoundary>} />
                  <Route path="/overwatch" element={<ErrorBoundary><OverWatch /></ErrorBoundary>} />
                  <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
                  <Route path="/pavement-estimator" element={<ErrorBoundary><Estimator /></ErrorBoundary>} />
                  <Route path="/theme-customizer" element={<ErrorBoundary><AdvancedThemeCustomizer /></ErrorBoundary>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </AdvancedThemeProvider>
);

export default App;
