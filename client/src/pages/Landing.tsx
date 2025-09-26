import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 floating-animation">
            <i className="fas fa-leaf text-4xl text-primary-foreground"></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to <span className="text-primary">7even</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gamified environmental education platform where you learn, act, and get rewarded for making a positive impact on our planet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-seedling text-primary text-xl"></i>
            </div>
            <h3 className="font-semibold mb-2">Learn & Explore</h3>
            <p className="text-sm text-muted-foreground">
              Master environmental topics through interactive lessons and real-world challenges.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-secondary text-xl"></i>
            </div>
            <h3 className="font-semibold mb-2">Join Guilds</h3>
            <p className="text-sm text-muted-foreground">
              Collaborate with like-minded individuals on environmental missions and challenges.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-coins text-accent text-xl"></i>
            </div>
            <h3 className="font-semibold mb-2">Earn EcoCredits</h3>
            <p className="text-sm text-muted-foreground">
              Get rewarded with EcoCredits for completing lessons and taking real-world eco actions.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-globe text-primary text-xl"></i>
            </div>
            <h3 className="font-semibold mb-2">Make Impact</h3>
            <p className="text-sm text-muted-foreground">
              Use AR scanning and simulations to understand environmental impact in real-time.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-8 py-4 text-lg"
            data-testid="button-login"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Start Your Eco Journey
          </Button>
          <p className="text-sm text-muted-foreground">
            Join thousands of environmental champions making a difference every day.
          </p>
        </div>
      </div>
    </div>
  );
}
