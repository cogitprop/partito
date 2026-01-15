import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/contexts/ToastContext";
import { Layout } from "@/components/partito/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import CreateEvent from "./pages/CreateEvent";
import EventView from "./pages/EventView";
import EventEdit from "./pages/EventEdit";
import Templates from "./pages/Templates";

import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Docs from "./pages/Docs";
import Recover from "./pages/Recover";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<CreateEvent />} />
                <Route path="/e/:slug" element={<EventView />} />
                <Route path="/e/:slug/edit" element={<EventEdit />} />
                <Route path="/templates" element={<Templates />} />
                
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/recover" element={<Recover />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
