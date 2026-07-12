import React from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../../lib/types';

interface RoleGateProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ children, roles, fallback = null }) => {
  const { profile } = useAuth();

  if (!profile || !roles.includes(profile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
