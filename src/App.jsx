import { Routes, Route } from "react-router-dom";

import Navbar       from "./components/layout/Navbar";
import Footer       from "./components/layout/Footer";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop  from "./components/ui/ScrollToTop";

// Pages
import HomePage    from "./pages/HomePage";
import LoginPage          from "./pages/auth/LoginPage";
import RegisterPage        from "./pages/auth/RegisterPage";
import ForgotPasswordPage  from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage   from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage  from "./pages/auth/ChangePasswordPage";
import ProfilePage         from "./pages/auth/ProfilePage";
import LawnListPage   from "./pages/lawn/LawnListPage";
import LawnDetailPage from "./pages/lawn/LawnDetailPage";
import CreateLawnPage from "./pages/lawn/CreateLawnPage";
import EditLawnPage   from "./pages/lawn/EditLawnPage";
import BookingPage             from "./pages/booking/BookingPage";
import BookingConfirmationPage  from "./pages/booking/BookingConfirmationPage";
import MyBookingsPage           from "./pages/booking/MyBookingsPage";
import OwnerBookingsPage        from "./pages/booking/OwnerBookingsPage";
import ChatPage from "./pages/chat/ChatPage";
import PaymentPage        from "./pages/payment/PaymentPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailurePage from "./pages/payment/PaymentFailurePage";
import PaymentHistoryPage from "./pages/payment/PaymentHistoryPage";
import OwnerDashboardPage from "./pages/dashboard/OwnerDashboardPage";
import AdminPage from "./pages/admin/AdminPage";
import { NotFoundPage } from "./pages/PlaceholderPages";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>          {/* ── Public Routes ─────────────────────────── */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/lawns"           element={<LawnListPage />} />
          <Route path="/lawns/:id"       element={<LawnDetailPage />} />

          {/* ── Owner Protected Routes ────────────────── */}
          <Route
            path="/lawns/create"
            element={
              <PrivateRoute role="owner">
                <CreateLawnPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/lawns/:id/edit"
            element={
              <PrivateRoute role="owner">
                <EditLawnPage />
              </PrivateRoute>
            }
          />

          {/* ── User Protected Routes ─────────────────── */}
          <Route
            path="/profile"
            element={<PrivateRoute><ProfilePage /></PrivateRoute>}
          />
          <Route
            path="/change-password"
            element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>}
          />
          <Route
            path="/bookings/my"
            element={<PrivateRoute><MyBookingsPage /></PrivateRoute>}
          />
          <Route
            path="/lawns/:id/book"
            element={<PrivateRoute role="user"><BookingPage /></PrivateRoute>}
          />
          <Route
            path="/bookings/:id/pay"
            element={<PrivateRoute role="user"><PaymentPage /></PrivateRoute>}
          />
          <Route
            path="/payment/success"
            element={<PrivateRoute><PaymentSuccessPage /></PrivateRoute>}
          />
          <Route
            path="/payment/failure"
            element={<PrivateRoute><PaymentFailurePage /></PrivateRoute>}
          />
          <Route
            path="/payment/history"
            element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>}
          />
          <Route
            path="/bookings/:id/confirmation"
            element={<PrivateRoute><BookingConfirmationPage /></PrivateRoute>}
          />
          <Route
            path="/chat"
            element={<PrivateRoute><ChatPage /></PrivateRoute>}
          />
          <Route
            path="/chat/:lawnId"
            element={<PrivateRoute><ChatPage /></PrivateRoute>}
          />

          {/* ── Owner Protected Routes ────────────────── */}
          <Route
            path="/dashboard/owner"
            element={<PrivateRoute role="owner"><OwnerDashboardPage /></PrivateRoute>}
          />
          <Route
            path="/bookings/owner"
            element={<PrivateRoute role="owner"><OwnerBookingsPage /></PrivateRoute>}
          />

          {/* ── Admin Protected Routes ────────────────── */}
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminPage />
              </PrivateRoute>
            }
          />

          {/* ── 404 ──────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default App;