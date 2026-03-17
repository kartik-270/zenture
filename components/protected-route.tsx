'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'student' | 'counselor' | 'admin';
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('userRole') || 'student';

    if (!token) {
      router.push('/login');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      const dashboardUrl = userRole === 'admin' ? '/admin/dashboard' : 
                           userRole === 'counselor' ? '/counselor' : 
                           '/dashboard';
      router.push(dashboardUrl);
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
