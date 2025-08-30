import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Users, Calendar, Video, MessageCircle, Settings, TrendingUp, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyPods() {
  const { user } = useAuth();

  const { data: userPods, isLoading } = useQuery({
    queryKey: ['/api/my-pods'],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
              <Users className="text-primary" />
              My Study Pods
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your active study groups and track your progress
            </p>
          </div>
          
          <Link href="/create-pod">
            <Button 
              className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90"
              data-testid="create-pod-button"
            >
              + Create New Pod
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glassmorphism animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userPods?.length === 0 ? (
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">No Study Pods Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first study pod or discover existing ones to start collaborating with other students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-pod">
                  <Button className="bg-primary text-primary-foreground">Create Study Pod</Button>
                </Link>
                <Link href="/discover">
                  <Button variant="outline">Discover Pods</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userPods?.map((membership: any, index: number) => (
              <motion.div
                key={membership.pod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="glassmorphism hover:shadow-xl transition-all duration-300 bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50"
                  data-testid={`pod-card-${membership.pod.id}`}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                          <Users className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-card-foreground" data-testid={`pod-name-${membership.pod.id}`}>
                            {membership.pod.name}
                          </h3>
                          <p className="text-muted-foreground text-sm" data-testid={`pod-description-${membership.pod.id}`}>
                            {membership.pod.description || 'No description available'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" data-testid={`pod-subject-${membership.pod.id}`}>
                              {membership.pod.subject}
                            </Badge>
                            {membership.role === 'creator' && (
                              <Badge variant="outline" className="text-primary border-primary">
                                Creator
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" data-testid={`video-${membership.pod.id}`}>
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`chat-${membership.pod.id}`}>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`settings-${membership.pod.id}`}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                        <div className="text-lg font-bold text-primary" data-testid={`progress-${membership.pod.id}`}>
                          {Math.round(parseFloat(membership.progress || '0'))}%
                        </div>
                        <div className="text-xs text-muted-foreground">Progress</div>
                      </div>
                      <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                        <div className="text-lg font-bold text-accent" data-testid={`streak-${membership.pod.id}`}>
                          {membership.streak || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Streak</div>
                      </div>
                      <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                        <div className="text-lg font-bold text-secondary" data-testid={`rank-${membership.pod.id}`}>
                          #{membership.rank || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">Rank</div>
                      </div>
                    </div>

                    {/* Pod Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        <span data-testid={`member-count-${membership.pod.id}`}>
                          {membership.pod.currentMembers}/{membership.pod.maxMembers} members
                        </span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        <span data-testid={`schedule-${membership.pod.id}`}>
                          {membership.pod.schedule?.days?.join(', ') || 'Flexible schedule'}
                        </span>
                      </div>

                      {membership.pod.goal && (
                        <div className="flex items-center text-muted-foreground">
                          <Target className="w-4 h-4 mr-2" />
                          <span data-testid={`goal-${membership.pod.id}`}>
                            {membership.pod.goal}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Members */}
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
                      
                      <Link href={`/pod/${membership.pod.id}`}>
                        <Button 
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          data-testid={`view-details-${membership.pod.id}`}
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
