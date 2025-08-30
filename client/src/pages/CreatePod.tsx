import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useLocation } from 'wouter';
import { Users, Target, Clock, BookOpen, Settings } from 'lucide-react';

export default function CreatePod() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    goal: '',
    learningPace: '',
    maxMembers: 6,
    schedule: {
      days: [] as string[],
      time: '',
      duration: 120,
    },
  });

  const createPodMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/pods', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Success!",
        description: "Your study pod has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-pods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pods'] });
      setLocation('/my-pods');
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
        description: error.message || "Failed to create study pod",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.learningPace) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPodMutation.mutate(formData);
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: checked 
          ? [...prev.schedule.days, day]
          : prev.schedule.days.filter(d => d !== day)
      }
    }));
  };

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Psychology', 'History', 'Literature', 'Economics'];
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Users className="text-primary" />
            Create Study Pod
          </h1>
          <p className="text-muted-foreground text-lg">
            Set up a new study group and invite others to join your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-primary w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pod Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Advanced Physics Study Group"
                  data-testid="pod-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your study pod will focus on..."
                  data-testid="pod-description-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger data-testid="subject-select">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min="2"
                    max="12"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 6 }))}
                    data-testid="max-members-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-primary w-5 h-5" />
                Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Study Goal</Label>
                <Textarea
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="What do you want to achieve together? (e.g., Prepare for final exams, Master calculus concepts)"
                  data-testid="goal-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningPace">Learning Pace *</Label>
                <Select value={formData.learningPace} onValueChange={(value) => setFormData(prev => ({ ...prev, learningPace: value }))}>
                  <SelectTrigger data-testid="learning-pace-select">
                    <SelectValue placeholder="Select learning pace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - Take it slow and steady</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Balanced approach</SelectItem>
                    <SelectItem value="advanced">Advanced - Fast-paced learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-primary w-5 h-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meeting Days</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {weekdays.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.schedule.days.includes(day.toLowerCase())}
                        onCheckedChange={(checked) => handleDayToggle(day.toLowerCase(), checked as boolean)}
                        data-testid={`day-${day.toLowerCase()}`}
                      />
                      <Label htmlFor={day} className="text-sm">{day.slice(0, 3)}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Meeting Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.schedule.time}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, time: e.target.value }
                    }))}
                    data-testid="meeting-time-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    max="300"
                    step="15"
                    value={formData.schedule.duration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, duration: parseInt(e.target.value) || 120 }
                    }))}
                    data-testid="duration-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setLocation('/my-pods')}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPodMutation.isPending}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90"
              data-testid="create-pod-submit"
            >
              {createPodMutation.isPending ? 'Creating Pod...' : 'Create Study Pod'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
