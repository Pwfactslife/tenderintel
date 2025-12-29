import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, visible on lg+ */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AppSidebar />
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header with menu button */}
        <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block">
          <AppHeader title={title} />
        </div>
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
