'use client';

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function WorkspaceLayout({ children }) {
  const { loading } = useProtectedRoute();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  )
}