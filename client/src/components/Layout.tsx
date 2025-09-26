import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./ThemeProvider";
import { Link, useLocation } from "wouter";
import MobileNavigation from "./MobileNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-leaf text-primary-foreground"></i>
                </div>
                <span className="text-xl font-bold">7even</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" data-testid="link-dashboard">
                <a className={`${location === "/" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/learning" data-testid="link-learning">
                <a className={`${location === "/learning" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Learning
                </a>
              </Link>
              <Link href="/ar-scanner" data-testid="link-ar-scanner">
                <a className={`${location === "/ar-scanner" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  AR Scanner
                </a>
              </Link>
              <Link href="/missions" data-testid="link-missions">
                <a className={`${location === "/missions" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Missions
                </a>
              </Link>
              <Link href="/guilds" data-testid="link-guilds">
                <a className={`${location === "/guilds" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Guilds
                </a>
              </Link>
              <Link href="/simulation" data-testid="link-simulation">
                <a className={`${location === "/simulation" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Simulation
                </a>
              </Link>
              <Link href="/blockchain" data-testid="link-blockchain">
                <a className={`${location === "/blockchain" ? "text-foreground" : "text-muted-foreground"} hover:text-primary transition-colors`}>
                  Blockchain
                </a>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-theme-toggle"
              >
                <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"}></i>
              </button>
              
              {/* EcoCredits Display */}
              <div className="flex items-center space-x-2 bg-accent/10 px-3 py-1 rounded-full" data-testid="display-ecocredits">
                <i className="fas fa-coins text-accent"></i>
                <span className="font-semibold">{(user as any)?.ecoCredits || 0}</span>
              </div>

              {/* User Profile */}
              <Link href="/profile" data-testid="link-profile">
                <a className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user text-secondary-foreground"></i>
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">
                    {(user as any)?.firstName || "User"}
                  </span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 md:mb-0">
        {children}
      </main>

      <MobileNavigation />
    </div>
  );
}
