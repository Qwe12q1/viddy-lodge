import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, LogOut, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Play className="h-6 w-6 fill-primary text-primary" />
          <span className="text-xl font-bold text-gradient">VidHost</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/upload")}
                className="gradient-brand border-0"
              >
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Войти
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
