import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { UserRole } from "../../lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-secondary text-sm font-medium">
            Verifying authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location so they can return
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Authenticated but does not have the required role
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md text-center bg-base p-8 rounded-xl border border-border shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Your account role <strong>({profile.role})</strong> does not have
            permission to view this page.
          </p>
          <div className="mt-6">
            <Navigate to="/" replace />
            <button
              onClick={() => window.history.back()}
              className="inline-flex justify-center rounded-lg border border-border bg-base px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
