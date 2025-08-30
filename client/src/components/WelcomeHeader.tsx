import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

export function WelcomeHeader() {
  const { user } = useAuth();

  const { data: recommendations } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: !!user,
  });

  if (!user) return null;

  const firstName = user.firstName || 'Student';
  const recommendationCount = recommendations?.length || 0;

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2" data-testid="welcome-title">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {firstName}
            </span>
            !
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="welcome-subtitle">
            Your AI study assistant has found {recommendationCount} new pod matches for you.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="glassmorphism rounded-lg p-4 text-center bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <div className="text-2xl font-bold text-primary" data-testid="study-streak">
              {user.studyStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          <div className="glassmorphism rounded-lg p-4 text-center bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <div className="text-2xl font-bold text-accent" data-testid="total-points">
              {user.totalPoints || 0}
            </div>
            <div className="text-sm text-muted-foreground">Study Points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
