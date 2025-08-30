import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useParams } from 'wouter';
import { Users, MessageCircle, Calendar, Clock, Target, Send, Video, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PodDetail() {
  const { id: podId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState('');

  const { data: pod, isLoading: podLoading } = useQuery({
    queryKey: ['/api/pods', podId],
    enabled: !!podId && !!user,
  });

  const { data: members } = useQuery({
    queryKey: ['/api/pods', podId, 'members'],
    enabled: !!podId && !!user,
  });

  const { data: messages } = useQuery({
    queryKey: ['/api/pods', podId, 'messages'],
    enabled: !!podId && !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/pods/${podId}/messages`, { content });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/pods', podId, 'messages'] });
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
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  if (!user) return null;

  if (podLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded-xl"></div>
              <div className="h-96 bg-muted rounded-xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Study Pod Not Found</h2>
              <p className="text-muted-foreground">The study pod you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pod Header */}
        <Card className="glassmorphism mb-8 bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <Users className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2" data-testid="pod-name">
                    {pod.name}
                  </h1>
                  <p className="text-muted-foreground mb-4" data-testid="pod-description">
                    {pod.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span data-testid="member-count">
                      <Users className="w-4 h-4 inline mr-1" />
                      {pod.currentMembers}/{pod.maxMembers} members
                    </span>
                    <Badge variant="secondary" data-testid="pod-subject">{pod.subject}</Badge>
                    <Badge variant="outline" data-testid="learning-pace">{pod.learningPace}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="icon" variant="outline" data-testid="video-call-button">
                  <Video className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" data-testid="pod-settings-button">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {pod.goal && (
              <div className="mt-6 p-4 glassmorphism rounded-lg bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-primary w-4 h-4" />
                  <span className="font-medium">Study Goal</span>
                </div>
                <p className="text-muted-foreground" data-testid="pod-goal">{pod.goal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="glassmorphism h-[600px] flex flex-col bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="text-primary w-5 h-5" />
                  Group Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
                  {messages?.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages?.map((message: any, index: number) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-3"
                        data-testid={`message-${message.id}`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                            {message.user?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm" data-testid={`message-author-${message.id}`}>
                              {message.user?.firstName || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm" data-testid={`message-content-${message.id}`}>
                            {message.content}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                <Separator />
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      data-testid="message-input"
                    />
                    <Button 
                      type="submit" 
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      data-testid="send-message-button"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-primary w-5 h-5" />
                  Members ({members?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map((member: any, index: number) => (
                    <div 
                      key={member.userId}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`member-${member.userId}`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {member.user?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm" data-testid={`member-name-${member.userId}`}>
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </p>
                      </div>
                      {member.role === 'creator' && (
                        <Badge variant="outline" className="text-primary border-primary text-xs">
                          Creator
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-primary w-5 h-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span data-testid="pod-schedule">
                      {pod.schedule?.days?.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ') || 'Flexible'}
                    </span>
                  </div>
                  
                  {pod.schedule?.time && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span data-testid="pod-time">
                        {pod.schedule.time} ({pod.schedule.duration || 120} min)
                      </span>
                    </div>
                  )}
                </div>
                
                <Button className="w-full mt-4 bg-primary text-primary-foreground" data-testid="join-session-button">
                  Join Next Session
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" data-testid="schedule-session">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="share-resources">
                    <Target className="w-4 h-4 mr-2" />
                    Share Resources
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="view-analytics">
                    <Users className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
