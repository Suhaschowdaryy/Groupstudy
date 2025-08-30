import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { Layers, Video, MessageCircle, Settings, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function MyActivePods() {
  const { user } = useAuth();

  const { data: userPods, isLoading } = useQuery({
    queryKey: ['/api/my-pods'],
    enabled: !!user,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-3">
            <Layers className="text-primary" />
            My Active Pods
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="glassmorphism animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <Layers className="text-primary" />
          My Active Pods
        </h2>
        <Link href="/create-pod">
          <Button 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            data-testid="create-new-pod"
          >
            + Create New Pod
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {userPods?.length === 0 ? (
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Pods</h3>
              <p className="text-muted-foreground mb-4">
                Join a study pod to start collaborating with other students!
              </p>
              <Link href="/discover">
                <Button>Discover Pods</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          userPods?.map((membership: any, index: number) => (
            <motion.div
              key={membership.pod.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="glassmorphism hover:shadow-xl transition-all duration-300 bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50"
                data-testid={`active-pod-${membership.pod.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                        <Users className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground" data-testid={`pod-name-${membership.pod.id}`}>
                          {membership.pod.name}
                        </h3>
                        <p className="text-muted-foreground" data-testid={`pod-description-${membership.pod.id}`}>
                          {membership.pod.description || 'No description available'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span data-testid={`pod-member-count-${membership.pod.id}`}>
                            <Users className="w-4 h-4 inline mr-1" />
                            {membership.pod.currentMembers} members
                          </span>
                          <span>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Next: Today 7:00 PM
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" data-testid={`video-button-${membership.pod.id}`}>
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`chat-button-${membership.pod.id}`}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`settings-button-${membership.pod.id}`}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                      <div className="text-lg font-bold text-primary" data-testid={`pod-progress-${membership.pod.id}`}>
                        {Math.round(parseFloat(membership.progress || '0'))}%
                      </div>
                      <div className="text-xs text-muted-foreground">Course Progress</div>
                    </div>
                    <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                      <div className="text-lg font-bold text-accent" data-testid={`pod-streak-${membership.pod.id}`}>
                        {membership.streak || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </div>
                    <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                      <div className="text-lg font-bold text-secondary" data-testid={`pod-rank-${membership.pod.id}`}>
                        #{membership.rank || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Pod Rank</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(4, membership.pod.currentMembers || 0))].map((_, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(membership.pod.currentMembers || 0) > 4 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                          +{membership.pod.currentMembers - 4}
                        </div>
                      )}
                    </div>
                    <Button 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid={`join-session-${membership.pod.id}`}
                    >
                      Join Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
