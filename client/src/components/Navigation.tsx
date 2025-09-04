import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useLocation } from 'wouter';
import { Moon, Sun, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationSystem } from '@/components/NotificationSystem';

export function Navigation() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', testId: 'nav-dashboard' },
    { to: '/my-pods', label: 'My Pods', testId: 'nav-my-pods' },
    { to: '/discover', label: 'Discover', testId: 'nav-discover' },
    { to: '/progress', label: 'Progress', testId: 'nav-progress' },
    { to: '/games', label: 'Mini Games', testId: 'nav-games' },
  ];

  return (
    <nav className="sticky top-0 z-40 glassmorphism border-b border-border bg-background/80 dark:bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" data-testid="logo-link">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-xl" />
                </div>
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  StudyPod
                </span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <span
                  data-testid={item.testId}
                  className={`text-muted-foreground hover:text-primary transition-colors cursor-pointer ${
                    location === item.to ? 'text-primary font-medium' : ''
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className="relative"
            >
              {theme === 'dark' ? (
                <Sun className="text-muted-foreground" />
              ) : (
                <Moon className="text-muted-foreground" />
              )}
            </Button>
            
            <NotificationSystem />
            
            {user && (
              <Link to="/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary p-0.5 cursor-pointer" data-testid="profile-avatar">
                  <Avatar className="w-full h-full">
                    <AvatarImage 
                      src={user.profileImageUrl || ''} 
                      alt={`${user.firstName || 'User'} profile`} 
                    />
                    <AvatarFallback className="bg-background text-foreground">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
