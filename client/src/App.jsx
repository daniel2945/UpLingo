import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/authStore";
import { MainLayout, AuthLayout, ProtectedRoute } from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lesson from "./pages/Lesson";
import AdminDashboard from "./pages/AdminDashboard";
import PracticePage from "./pages/PracticePage";
import PracticeSession from "./pages/PracticeSession";

const App = () => {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <Routes>
        {/* Public Routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes with MainLayout and ProtectedRoute check */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lesson/:missionId" element={<Lesson />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice-session" element={<PracticeSession />} />
          </Route>
        </Route>

        {/* Catch-all/Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
