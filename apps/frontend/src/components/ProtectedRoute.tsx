import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("adminToken");
  const location = useLocation();
  return token ? children : <Navigate to="/admin/login" state={{ from: location }} replace />;
}
