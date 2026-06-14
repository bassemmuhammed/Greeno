import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import CustomerMenu   from "./pages/CustomerMenu";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminLogin     from "./pages/AdminLogin";
import ProtectedRoute from "./components/shared/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<CustomerMenu />} />
        <Route path="/login"  element={<AdminLogin />} />
        <Route path="/owner"  element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
