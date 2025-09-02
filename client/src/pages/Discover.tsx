import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Search, Users, Clock, Target, Signal, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [paceFilter, setPaceFilter] = useState('all');

  const { data: allPods, isLoading } = useQuery({
    queryKey: ['/api/pods', { 
      subject: subjectFilter === 'all' ? '' : subjectFilter, 
      learningPace: paceFilter === 'all' ? '' : paceFilter 
    }],
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
      queryClient.invalidateQueries({ queryKey: ['/api/pods'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to join the study pod.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const filteredPods = allPods?.filter((pod: any) =>
    pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pod.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pod.description && pod.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Psychology', 'History', 'Literature', 'Economics'];
  const paces = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Search className="text-primary" />
            Discover Study Pods
          </h1>
          <p className="text-muted-foreground text-lg">
            Find the perfect study group that matches your interests and learning style
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="glassmorphism mb-8 bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search pods, subjects, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>
              </div>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger data-testid="subject-filter">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paceFilter} onValueChange={setPaceFilter}>
                <SelectTrigger data-testid="pace-filter">
                  <SelectValue placeholder="All Paces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Paces</SelectItem>
                  {paces.map(pace => (
                    <SelectItem key={pace} value={pace}>
                      {pace.charAt(0).toUpperCase() + pace.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glassmorphism animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPods.length === 0 ? (
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Study Pods Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new study pod.
              </p>
              <Button onClick={() => navigate('/create-pod')} data-testid="create-pod-button">Create New Pod</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPods.map((pod: any, index: number) => (
              <motion.div
                key={pod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="glassmorphism hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 border-accent/20 hover:border-accent/40 hover:scale-105 bg-card/50 dark:bg-card/50 backdrop-blur-lg"
                  data-testid={`pod-card-${pod.id}`}
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
                    </div>

                    {pod.description && (
                      <p className="text-sm text-muted-foreground mb-4" data-testid={`pod-description-${pod.id}`}>
                        {pod.description}
                      </p>
                    )}
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        <span data-testid={`pod-schedule-${pod.id}`}>
                          {pod.schedule?.days?.join(', ') || 'Flexible Schedule'}
                        </span>
                      </div>
                      
                      {pod.goal && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Target className="w-4 h-4 mr-2" />
                          <span data-testid={`pod-goal-${pod.id}`}>{pod.goal}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Signal className="w-4 h-4 mr-2" />
                        <span data-testid={`pod-pace-${pod.id}`}>
                          {pod.learningPace || 'Intermediate'} Pace
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" data-testid={`pod-subject-${pod.id}`}>
                        {pod.subject}
                      </Badge>
                      
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, pod.currentMembers || 0))].map((_, i) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-background">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(pod.currentMembers || 0) > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                            +{pod.currentMembers - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        onClick={() => joinPodMutation.mutate(pod.id)}
                        disabled={joinPodMutation.isPending || pod.currentMembers >= pod.maxMembers}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 group-hover:animate-pulse"
                        data-testid={`join-pod-${pod.id}`}
                      >
                        {joinPodMutation.isPending ? 'Joining...' : 
                         pod.currentMembers >= pod.maxMembers ? 'Pod Full' : 'Join Pod'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/pod/${pod.id}`)}
                        data-testid={`view-pod-${pod.id}`}
                      >
                        View Details
                      </Button>
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
