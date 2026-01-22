import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

type UserRole = 'tutor' | 'lecturer';

interface WithRoleProtectionProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

// Higher-order component for role-based route protection
function withRoleProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithRoleProtectionProps
) {
  const ProtectedComponent: React.FC<P> = (props) => {
    const { user, isLoading, isAuthenticated } = useUser();
    const router = useRouter();
    const { allowedRoles, redirectTo = '/', fallbackComponent: FallbackComponent } = options;

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // Not authenticated - redirect to home or show fallback
    if (!isAuthenticated || !user) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      // Auto redirect after a short delay
      React.useEffect(() => {
        const timer = setTimeout(() => {
          router.push(redirectTo);
        }, 3000);
        return () => clearTimeout(timer);
      }, []);

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home Page
              </button>
              <p className="text-sm text-gray-500">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      );
    }

    // User is authenticated but doesn't have the required role
    if (!allowedRoles.includes(user.role)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }

      // Auto redirect after a short delay
      React.useEffect(() => {
        const timer = setTimeout(() => {
          router.push(redirectTo);
        }, 5000);
        return () => clearTimeout(timer);
      }, []);

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-2">
              This page is only accessible to users with the following role(s):
            </p>
            <div className="mb-6">
              {allowedRoles.map((role) => (
                <span
                  key={role}
                  className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mx-1"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Your current role: <span className="font-medium capitalize">{user.role}</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home Page
              </button>
              <p className="text-sm text-gray-500">
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          </div>
        </div>
      );
    }

    // User has the required role - render the protected component
    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
}

export default withRoleProtection;