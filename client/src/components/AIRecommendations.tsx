import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Users, Clock, Target, Signal } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: !!user,
  });

  const joinPodMutation = useMutation({
    mutationFn: async (podId: string) => {
      return apiRequest('POST', `/api/pods/${podId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully joined the study pod.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-pods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join the study pod.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-pulse">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            AI Pod Recommendations
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  const handleJoinPod = (podId: string) => {
    joinPodMutation.mutate(podId);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-pulse">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          AI Pod Recommendations
        </h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="view-all-recommendations">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations?.map((pod: any, index: number) => (
          <motion.div
            key={pod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="glassmorphism hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 border-accent/20 hover:border-accent/40 hover:scale-105 bg-card/50 dark:bg-card/50 backdrop-blur-lg"
              data-testid={`recommendation-card-${pod.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <Users className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground" data-testid={`pod-name-${pod.id}`}>
                        {pod.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`pod-members-${pod.id}`}>
                        {pod.currentMembers}/{pod.maxMembers} members
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary" data-testid={`match-score-${pod.id}`}>
                      {pod.matchScore || 85}% match
                    </div>
                    <div className="text-xs text-muted-foreground">AI Score</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span data-testid={`pod-schedule-${pod.id}`}>
                      {pod.schedule?.days?.join(', ') || 'Flexible'} {pod.schedule?.time || ''}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="w-4 h-4 mr-2" />
                    <span data-testid={`pod-goal-${pod.id}`}>
                      {pod.goal || 'Study together and achieve academic goals'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Signal className="w-4 h-4 mr-2" />
                    <span data-testid={`pod-pace-${pod.id}`}>
                      {pod.learningPace || 'Intermediate'} Pace
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, pod.currentMembers || 0))].map((_, i) => (
                      <Avatar key={i} className="w-8 h-8 border-2 border-background">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(pod.currentMembers || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                        +{pod.currentMembers - 3}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleJoinPod(pod.id)}
                    disabled={joinPodMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 group-hover:animate-pulse"
                    data-testid={`join-pod-${pod.id}`}
                  >
                    {joinPodMutation.isPending ? 'Joining...' : 'Join Pod'}
                  </Button>
                </div>

                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs">
                    {pod.subject}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
