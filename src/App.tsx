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
import ThemeBackground from "./components/theme/ThemeBackground";
import EffectsOverlay from "./components/effects/EffectsOverlay";
import SoundManager from "./components/effects/SoundManager";
import UiSoundBindings from "./components/effects/UiSoundBindings";
import RouteSound from "./components/effects/RouteSound";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

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
const Builder = lazy(() => import("./pages/Builder"));
const AdvancedThemeCustomizer = lazy(() => import("./components/theme/AdvancedThemeCustomizer"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ContractorPortal = lazy(() => import("./pages/ContractorPortal"));
const OperationsSuite = lazy(() => import("./pages/OperationsSuite"));

const queryClient = new QueryClient();

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
                       <SoundManager />
                         <UiSoundBindings />
            <EffectsOverlay />
            <ThemeBackground />
           <BrowserRouter>
             <RouteSound />
             <ErrorBoundary>
               <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mission-planning" element={<MissionPlanning />} />
                <Route path="/team-management" element={<TeamManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/communications" element={<Communications />} />
                <Route path="/intel-reports" element={<IntelReports />} />
                <Route path="/pavement-scan-pro" element={<PavementScanPro />} />
                                 <Route path="/overwatch" element={<OverWatch />} />
                 <Route path="/settings" element={<Settings />} />
                 <Route path="/pavement-estimator" element={<Estimator />} />
                 <Route path="/client-portal" element={<ClientPortal />} />
                 <Route path="/contractor-portal" element={<ContractorPortal />} />
                                  <Route path="/theme-customizer" element={<AdvancedThemeCustomizer />} />
                   <Route path="/builder" element={<Builder />} />
                 <Route path="/operations-suite" element={<OperationsSuite />} />
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
