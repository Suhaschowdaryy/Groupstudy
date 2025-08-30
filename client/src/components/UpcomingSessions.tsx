import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function UpcomingSessions() {
  const { user } = useAuth();

  const { data: upcomingSessions, isLoading } = useQuery({
    queryKey: ['/api/upcoming-sessions'],
    enabled: !!user,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-3">
            <Calendar className="text-primary" />
            Upcoming Sessions
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

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <Calendar className="text-primary" />
          Upcoming Sessions
        </h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="view-calendar">
          View Calendar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingSessions?.length === 0 ? (
          <div className="col-span-full">
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground">
                  Join a study pod to see scheduled sessions here.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          upcomingSessions?.map((session: any, index: number) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="glassmorphism hover:shadow-xl transition-all duration-300 bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50"
                data-testid={`session-card-${session.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <Calendar className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground" data-testid={`session-title-${session.id}`}>
                          {session.title}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`session-pod-${session.id}`}>
                          {session.pod?.name || 'Study Session'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary" data-testid={`session-time-${session.id}`}>
                        {format(new Date(session.scheduledAt), 'h:mm a')}
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`session-date-${session.id}`}>
                        {format(new Date(session.scheduledAt), 'MMM d')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span data-testid={`session-duration-${session.id}`}>{session.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Bookmark className="w-4 h-4 mr-2" />
                      <span data-testid={`session-topic-${session.id}`}>{session.topic || 'General Study'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, session.attendeeCount || 0))].map((_, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-background">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button 
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid={`join-session-${session.id}`}
                    >
                      {new Date(session.scheduledAt) <= new Date() ? 'Join Now' : 'Set Reminder'}
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
