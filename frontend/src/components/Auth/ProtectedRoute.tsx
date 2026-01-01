import { useUser } from '@clerk/clerk-react';
import type { ComponentChildren } from 'preact';

interface ProtectedRouteProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
}

/**
 * Component that only renders children when user is authenticated
 * Shows fallback or null when not authenticated
 */
export function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useUser();

  // Don't render anything while loading
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show fallback if not signed in
  if (!isSignedIn) {
    return <>{fallback}</>;
  }

  // Render children if signed in
  return <>{children}</>;
}
