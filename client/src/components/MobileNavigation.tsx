import { Link, useLocation } from "wouter";

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-40">
      <div className="grid grid-cols-5 py-2">
        <Link href="/" data-testid="mobile-nav-home">
          <a className={`flex flex-col items-center py-2 ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/learning" data-testid="mobile-nav-learning">
          <a className={`flex flex-col items-center py-2 ${location === "/learning" ? "text-primary" : "text-muted-foreground"}`}>
            <i className="fas fa-book text-lg"></i>
            <span className="text-xs mt-1">Learn</span>
          </a>
        </Link>
        <Link href="/missions" data-testid="mobile-nav-missions">
          <a className={`flex flex-col items-center py-2 ${location === "/missions" ? "text-primary" : "text-muted-foreground"}`}>
            <i className="fas fa-flag text-lg"></i>
            <span className="text-xs mt-1">Missions</span>
          </a>
        </Link>
        <Link href="/guilds" data-testid="mobile-nav-guilds">
          <a className={`flex flex-col items-center py-2 ${location === "/guilds" ? "text-primary" : "text-muted-foreground"}`}>
            <i className="fas fa-users text-lg"></i>
            <span className="text-xs mt-1">Guilds</span>
          </a>
        </Link>
        <Link href="/profile" data-testid="mobile-nav-profile">
          <a className={`flex flex-col items-center py-2 ${location === "/profile" ? "text-primary" : "text-muted-foreground"}`}>
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
