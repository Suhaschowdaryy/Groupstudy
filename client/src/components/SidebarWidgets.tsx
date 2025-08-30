import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Trophy, Bot, BarChart3, Flame, Star, Brain, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function SidebarWidgets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: badges } = useQuery({
    queryKey: ['/api/badges'],
    enabled: !!user,
  });

  const { data: studyTip, mutate: getStudyTip, isPending: isGettingTip } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/ai/study-tip');
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to get study tip",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const weeklyProgress = 75; // This would come from actual data
  const progressStrokeDasharray = `${weeklyProgress}, 100`;

  return (
    <div className="space-y-6">
      {/* Progress Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5" />
              Weekly Progress
            </h3>
            
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path 
                    className="text-muted-foreground stroke-current opacity-30" 
                    strokeWidth="3" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="text-primary stroke-current" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeDasharray={progressStrokeDasharray}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary" data-testid="weekly-progress">
                    {weeklyProgress}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Study Hours</span>
                <span className="font-medium" data-testid="study-hours">18/24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions Attended</span>
                <span className="font-medium" data-testid="sessions-attended">12/15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Achievements</span>
                <span className="font-medium" data-testid="weekly-achievements">3 new</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="text-accent w-5 h-5" />
              Recent Badges
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 glassmorphism rounded-lg hover:scale-105 transition-transform bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30" data-testid="badge-study-streak">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Flame className="text-white w-6 h-6" />
                </div>
                <div className="text-xs font-medium">Study Streak</div>
                <div className="text-xs text-muted-foreground">10 Days</div>
              </div>
              
              <div className="text-center p-3 glassmorphism rounded-lg hover:scale-105 transition-transform bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30" data-testid="badge-top-contributor">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="text-white w-6 h-6" />
                </div>
                <div className="text-xs font-medium">Top Contributor</div>
                <div className="text-xs text-muted-foreground">Physics Pod</div>
              </div>
              
              <div className="text-center p-3 glassmorphism rounded-lg hover:scale-105 transition-transform bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30" data-testid="badge-quick-learner">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="text-white w-6 h-6" />
                </div>
                <div className="text-xs font-medium">Quick Learner</div>
                <div className="text-xs text-muted-foreground">AI Certified</div>
              </div>
              
              <div className="text-center p-3 glassmorphism rounded-lg hover:scale-105 transition-transform bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30" data-testid="badge-team-player">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div className="text-xs font-medium">Team Player</div>
                <div className="text-xs text-muted-foreground">Collaboration</div>
              </div>
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80 text-sm font-medium" data-testid="view-all-badges">
              View All Badges
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Assistant Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glassmorphism border-2 border-accent/20 bg-card/50 dark:bg-card/50 backdrop-blur-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
                <Bot className="text-white w-3 h-3" />
              </div>
              AI Study Assistant
            </h3>
            
            <div className="space-y-3 mb-4">
              {studyTip && (
                <div className="p-3 glassmorphism rounded-lg text-sm bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                  <p className="text-muted-foreground mb-2">💡 Study Tip:</p>
                  <p data-testid="ai-study-tip">{studyTip.tip}</p>
                </div>
              )}
              
              <div className="p-3 glassmorphism rounded-lg text-sm bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                <p className="text-muted-foreground mb-2">📚 Recommended:</p>
                <p data-testid="ai-recommendation">Review wave-particle duality before tonight's session. Your pod members are studying Chapter 7.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => getStudyTip()}
                disabled={isGettingTip}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="get-study-tip"
              >
                {isGettingTip ? 'Getting Tip...' : 'Get Study Tip'}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                data-testid="ask-ai-anything"
              >
                Ask AI Anything
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="text-secondary w-5 h-5" />
              Quick Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Global Rank</span>
                <span className="font-bold text-primary" data-testid="global-rank">#{user.globalRank || 247}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Study Time</span>
                <span className="font-bold text-accent" data-testid="total-study-time">
                  {Math.round((user.totalStudyTime || 0) / 60)}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pods Completed</span>
                <span className="font-bold text-secondary" data-testid="completed-pods">{user.completedPods || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-bold text-green-500" data-testid="success-rate">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
