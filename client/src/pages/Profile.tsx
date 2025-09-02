import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { User, Settings, Target, Clock, BookOpen, Github, Linkedin, Upload, ExternalLink } from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profileImageUrl: '',
    linkedInId: '',
    githubId: '',
    studyGoals: [] as string[],
    preferredSubjects: [] as string[],
    learningPace: '',
    availability: {} as Record<string, string[]>,
  });

  const [goalInput, setGoalInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImageUrl: user.profileImageUrl || '',
        linkedInId: user.linkedInId || '',
        githubId: user.githubId || '',
        studyGoals: user.studyGoals || [],
        preferredSubjects: user.preferredSubjects || [],
        learningPace: user.learningPace || '',
        availability: user.availability as Record<string, string[]> || {},
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const addGoal = () => {
    if (goalInput.trim() && !formData.studyGoals.includes(goalInput.trim())) {
      setFormData(prev => ({
        ...prev,
        studyGoals: [...prev.studyGoals, goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  const removeGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      studyGoals: prev.studyGoals.filter(g => g !== goal)
    }));
  };

  const addSubject = () => {
    if (subjectInput.trim() && !formData.preferredSubjects.includes(subjectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredSubjects: [...prev.preferredSubjects, subjectInput.trim()]
      }));
      setSubjectInput('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.filter(s => s !== subject)
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <User className="text-primary" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Customize your learning preferences for better AI matching
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-primary w-5 h-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user.profileImageUrl || ''} alt="Profile" />
                    <AvatarFallback className="bg-background text-foreground text-xl">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-xl font-semibold" data-testid="user-name">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-muted-foreground" data-testid="user-email">
                  {user.email}
                </p>
                
                {/* Social Links */}
                {(user.linkedInId || user.githubId) && (
                  <div className="flex justify-center gap-3 mt-3">
                    {user.linkedInId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (user.linkedInId) {
                            const url = user.linkedInId.startsWith('http') 
                              ? user.linkedInId 
                              : `https://linkedin.com/in/${user.linkedInId}`;
                            window.open(url, '_blank');
                          }
                        }}
                        data-testid="linkedin-link"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                    {user.githubId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(`https://github.com/${user.githubId}`, '_blank')}
                        data-testid="github-link"
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                  <div className="text-2xl font-bold text-primary" data-testid="study-streak">
                    {user.studyStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                
                <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                  <div className="text-2xl font-bold text-accent" data-testid="total-points">
                    {user.totalPoints || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>

                <div className="glassmorphism rounded-lg p-3 text-center bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                  <div className="text-2xl font-bold text-secondary" data-testid="global-rank">
                    #{user.globalRank || '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">Global Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="text-primary w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        data-testid="first-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        data-testid="last-name-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="profileImageUrl">Profile Picture URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="profileImageUrl"
                        value={formData.profileImageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                        placeholder="https://example.com/your-photo.jpg"
                        data-testid="profile-image-input"
                      />
                      <Button type="button" variant="outline" size="icon" title="Upload photo">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Paste a URL to your profile picture or upload one
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Profiles */}
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="text-primary w-5 h-5" />
                    Social Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="linkedInId" className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedInId"
                      value={formData.linkedInId}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedInId: e.target.value }))}
                      placeholder="https://linkedin.com/in/your-profile or your-username"
                      data-testid="linkedin-input"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Share your LinkedIn profile to connect with other students
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="githubId" className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Username
                    </Label>
                    <Input
                      id="githubId"
                      value={formData.githubId}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubId: e.target.value }))}
                      placeholder="your-github-username"
                      data-testid="github-input"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Show your coding projects and collaborate on assignments
                    </p>
                  </div>
                </CardContent>
              </Card>
              {/* Study Goals */}
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="text-primary w-5 h-5" />
                    Study Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="Add a study goal..."
                        data-testid="goal-input"
                      />
                      <Button type="button" onClick={addGoal} data-testid="add-goal">
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.studyGoals.map((goal, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          data-testid={`goal-tag-${index}`}
                        >
                          {goal}
                          <button
                            type="button"
                            onClick={() => removeGoal(goal)}
                            className="text-primary/60 hover:text-primary"
                            data-testid={`remove-goal-${index}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferred Subjects */}
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-primary w-5 h-5" />
                    Preferred Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        placeholder="Add a subject..."
                        data-testid="subject-input"
                      />
                      <Button type="button" onClick={addSubject} data-testid="add-subject">
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.preferredSubjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
                          data-testid={`subject-tag-${index}`}
                        >
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="text-secondary/60 hover:text-secondary"
                            data-testid={`remove-subject-${index}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Pace */}
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="text-primary w-5 h-5" />
                    Learning Pace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.learningPace}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, learningPace: value }))}
                  >
                    <SelectTrigger data-testid="learning-pace-select">
                      <SelectValue placeholder="Select your learning pace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Take it slow and steady</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Balanced approach</SelectItem>
                      <SelectItem value="advanced">Advanced - Fast-paced learning</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="save-profile"
              >
                {updateProfileMutation.isPending ? 'Updating Profile...' : 'Update Profile'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
