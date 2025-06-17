
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MedicalProvider } from "@/contexts/MedicalContext";
import Consultation from "./pages/Consultation";
import Diagnostic from "./pages/Diagnostic";
import Traitement from "./pages/Traitement";
import Courrier from "./pages/Courrier";
import ArretTravail from "./pages/ArretTravail";
import ETP from "./pages/ETP";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MedicalProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/consultation" replace />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/diagnostic" element={<Diagnostic />} />
              <Route path="/traitement" element={<Traitement />} />
              <Route path="/courrier" element={<Courrier />} />
              <Route path="/arret-travail" element={<ArretTravail />} />
              <Route path="/etp" element={<ETP />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MedicalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
