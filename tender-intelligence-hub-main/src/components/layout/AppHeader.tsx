import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      return;
    }
    toast.success("Signed out successfully");
    navigate("/");
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Credits Badge */}
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-success/10 border-success/20">
          <Coins className="h-4 w-4 text-success" />
          <span className="text-muted-foreground">Free Credits:</span>
          <span className="font-bold text-success">3</span>
        </Badge>

        {user ? (
          <>
            {/* User Avatar */}
            <Avatar className="h-9 w-9 border-2 border-border transition-transform hover:scale-105">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
