import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type Role = 'reception' | 'doctor' | 'pharmacy' | 'lab' | 'admin';

const roleKeyMap: Record<Role, string> = {
  reception: 'current-reception-user',
  doctor: 'current-doctor',
  pharmacy: 'current-pharmacy-user',
  lab: 'current-lab-user',
  admin: 'current-admin-user',
};

interface ProtectedRouteProps {
  role: Role;
  children: ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const key = roleKeyMap[role];
  const stored = localStorage.getItem(key);
  if (!stored) return <Navigate to="/" replace />;
  return <>{children}</>;
}
