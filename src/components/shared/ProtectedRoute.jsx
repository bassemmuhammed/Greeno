import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAdmin = sessionStorage.getItem("greeno_admin") === "1";
  return isAdmin ? children : <Navigate to="/login" replace />;
}
