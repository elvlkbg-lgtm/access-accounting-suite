import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountantProfilePage from "./pages/AccountantProfilePage";
import ClientDashboard from "./pages/ClientDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Calculators from "./pages/Calculators";
import Consultations from "./pages/Consultations";
import AccountingCalendar from "./pages/AccountingCalendar";
import ContactAccountant from "./pages/ContactAccountant";
import SearchAccountants from "./pages/SearchAccountants";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchAccountants />} />
            <Route path="/services" element={<Navigate to="/" replace />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/calendar" element={<AccountingCalendar />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/accountant-profile/:id" element={<AccountantProfilePage />} />
            <Route path="/contact-accountant/:id" element={<ContactAccountant />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/accountant" element={<ProtectedRoute requiredRole="accountant"><AccountantDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
