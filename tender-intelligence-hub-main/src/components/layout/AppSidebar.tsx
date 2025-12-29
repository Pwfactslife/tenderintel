import { Home, User, FileText, CreditCard, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Company Profile", url: "/company-profile", icon: User },
  { title: "My Tenders", url: "/my-tenders", icon: FileText },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  disabled?: boolean;
}

export function AppSidebar({ disabled = false }: AppSidebarProps) {
  const location = useLocation();
  const { isProfileComplete } = useAuth();
  
  // If profile is not complete and user is not on company-profile page, disable navigation
  const shouldDisable = disabled || (!isProfileComplete && location.pathname !== "/company-profile");

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <FileText className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-primary">
              TenderIntel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            const isDisabled = shouldDisable && item.url !== "/company-profile";
            
            return (
              <NavLink
                key={item.title}
                to={isDisabled ? "#" : item.url}
                onClick={(e) => isDisabled && e.preventDefault()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60">
            © 2025 TenderIntel
          </p>
        </div>
      </div>
    </aside>
  );
}
