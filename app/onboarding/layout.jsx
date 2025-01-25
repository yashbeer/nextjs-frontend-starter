'use client';

import { useProtectedRoute } from "@/hooks/use-protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OnboardingLayout({ children }) {
  const { loading } = useProtectedRoute();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
} 