import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'wouter';
import { Users, Calendar, Clock, Target, Video, Settings, Upload, FileText, Download, Trash2, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import ChatRoom from '@/components/ChatRoom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertStudyPodSchema, type StudyPod, type VideoCallSession, type PodFile } from '../../../shared/schema';
import { z } from 'zod';

export default function PodDetail() {
  const { id: podId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [fileFormData, setFileFormData] = useState({
    fileName: '',
    fileType: '',
    fileUrl: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Settings form schema - exclude fields that shouldn't be editable
  const settingsSchema = insertStudyPodSchema.pick({
    name: true,
    description: true,
    subject: true,
    goal: true,
    learningPace: true,
    maxMembers: true
  });
  const { data: pod, isLoading: podLoading } = useQuery<StudyPod>({
    queryKey: ['/api/pods', podId],
    enabled: !!podId && !!user,
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      subject: '',
      goal: '',
      learningPace: '',
      maxMembers: 8
    },
    values: pod ? {
      name: pod.name ?? '',
      description: pod.description ?? '',
      subject: pod.subject ?? '',
      goal: pod.goal ?? '',
      learningPace: pod.learningPace ?? '',
      maxMembers: pod.maxMembers ?? 8
    } : undefined
  });

  const { data: members } = useQuery<any[]>({
    queryKey: ['/api/pods', podId, 'members'],
    enabled: !!podId && !!user,
  });

  const { data: files, isLoading: filesLoading } = useQuery<PodFile[]>({
    queryKey: ['/api/pods', podId, 'files'],
    enabled: !!podId && !!user,
  });

  const { data: activeCall } = useQuery<VideoCallSession | null>({
    queryKey: ['/api/pods', podId, 'active-call'],
    enabled: !!podId && !!user,
    refetchInterval: 5000, // Check every 5 seconds
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (fileData: any) => {
      return apiRequest('POST', `/api/pods/${podId}/files`, fileData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pods', podId, 'files'] });
      setIsFileDialogOpen(false);
      setFileFormData({ fileName: '', fileType: '', fileUrl: '', description: '' });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // File delete mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pods', podId, 'files'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile) {
      // Handle actual file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', fileFormData.description);
      
      // Upload to a file hosting service or handle differently
      // For now, we'll create a mock URL and use the current system
      const mockUrl = `${window.location.origin}/uploads/${selectedFile.name}`;
      
      const uploadData = {
        fileName: selectedFile.name,
        fileType: getFileCategory(selectedFile.type, selectedFile.name),
        fileUrl: mockUrl,
        description: fileFormData.description,
      };
      
      uploadFileMutation.mutate(uploadData);
    } else {
      // Handle URL-based upload
      uploadFileMutation.mutate(fileFormData);
    }
  };

  const getFileCategory = (mimeType: string, fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Image files
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return 'image';
    }
    
    // PDF files
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    
    // Document files
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension || '') || 
        mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    
    // Presentation files
    if (['ppt', 'pptx', 'odp'].includes(extension || '') || 
        mimeType.includes('presentation')) {
      return 'presentation';
    }
    
    // Spreadsheet files
    if (['xls', 'xlsx', 'csv', 'ods'].includes(extension || '') || 
        mimeType.includes('spreadsheet')) {
      return 'spreadsheet';
    }
    
    // Video files
    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return 'video';
    }
    
    // Audio files
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) {
      return 'audio';
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return 'archive';
    }
    
    return 'other';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileType: getFileCategory(file.type, file.name),
        fileUrl: '' // Clear URL when file is selected
      }));
    }
  };

  const handleFileDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFileMutation.mutate(fileId);
    }
  };

  // Settings update mutation
  const updatePodMutation = useMutation({
    mutationFn: async (settingsData: z.infer<typeof settingsSchema>) => {
      return apiRequest('PUT', `/api/pods/${podId}`, settingsData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pod settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pods', podId] });
      setIsSettingsDialogOpen(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update pod settings",
        variant: "destructive",
      });
    },
  });

  const handleSettingsSubmit = (data: z.infer<typeof settingsSchema>) => {
    updatePodMutation.mutate(data);
  };

  // Video call mutations
  const createVideoCallMutation = useMutation({
    mutationFn: async (callData: any) => {
      return apiRequest('POST', `/api/pods/${podId}/video-calls`, callData);
    },
    onSuccess: (newCall: any) => {
      toast({
        title: "Success",
        description: "Video call started and meeting opened!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pods', podId, 'active-call'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to start video call",
        variant: "destructive",
      });
    },
  });

  const joinVideoCallMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest('POST', `/api/video-calls/${sessionId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Joined video call successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pods', podId, 'active-call'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join video call",
        variant: "destructive",
      });
    },
  });

  const startVideoCall = () => {
    // Generate a Jitsi Meet URL for the pod
    const meetingId = `studypod-${podId}-${Date.now()}`;
    const jitsiUrl = `https://meet.jit.si/${meetingId}`;
    
    // Open the meeting immediately to avoid popup blockers
    const meetingWindow = window.open(jitsiUrl, '_blank', 'noopener,noreferrer');
    
    if (!meetingWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to open video calls",
        variant: "destructive",
      });
      return;
    }
    
    const callData = {
      title: `${pod?.name} Study Session`,
      description: 'Video call for collaborative studying',
      meetingUrl: jitsiUrl,
      scheduledAt: new Date(),
    };
    
    createVideoCallMutation.mutate(callData);
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
                {activeCall ? (
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      if (activeCall.meetingUrl) {
                        window.open(activeCall.meetingUrl, '_blank');
                        // Track that user joined
                        joinVideoCallMutation.mutate(activeCall.id);
                      }
                    }}
                    data-testid="join-active-call-button"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Call
                  </Button>
                ) : (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={startVideoCall}
                    disabled={createVideoCallMutation.isPending}
                    data-testid="video-call-button"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                )}
                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline" data-testid="pod-settings-button">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Pod Settings</DialogTitle>
                    </DialogHeader>
                    <Form {...settingsForm}>
                      <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-4">
                        <FormField
                          control={settingsForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pod Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="settings-pod-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={settingsForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ''} data-testid="settings-pod-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={settingsForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger data-testid="settings-subject">
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mathematics">Mathematics</SelectItem>
                                    <SelectItem value="physics">Physics</SelectItem>
                                    <SelectItem value="chemistry">Chemistry</SelectItem>
                                    <SelectItem value="biology">Biology</SelectItem>
                                    <SelectItem value="computer-science">Computer Science</SelectItem>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="literature">Literature</SelectItem>
                                    <SelectItem value="history">History</SelectItem>
                                    <SelectItem value="psychology">Psychology</SelectItem>
                                    <SelectItem value="economics">Economics</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={settingsForm.control}
                          name="learningPace"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Learning Pace</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger data-testid="settings-learning-pace">
                                    <SelectValue placeholder="Select pace" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={settingsForm.control}
                          name="maxMembers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Members</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="2" 
                                  max="20" 
                                  {...field}
                                  value={field.value || 8}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                  data-testid="settings-max-members"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={settingsForm.control}
                          name="goal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Study Goal</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ''} data-testid="settings-pod-goal" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSettingsDialogOpen(false)}
                            data-testid="settings-cancel-button"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updatePodMutation.isPending}
                            data-testid="settings-save-button"
                          >
                            {updatePodMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
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
          {/* Real-time Chat */}
          <div className="lg:col-span-2 h-[600px]">
            <ChatRoom podId={podId!} podName={pod?.name} />
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
                      {(pod.schedule as any)?.days?.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ') || 'Flexible'}
                    </span>
                  </div>
                  
                  {(pod.schedule as any)?.time && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span data-testid="pod-time">
                        {(pod.schedule as any).time} ({(pod.schedule as any).duration || 120} min)
                      </span>
                    </div>
                  )}
                </div>
                
                <Button className="w-full mt-4 bg-primary text-primary-foreground" data-testid="join-session-button">
                  Join Next Session
                </Button>
              </CardContent>
            </Card>

            {/* Files Section */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary w-5 h-5" />
                    Files ({files?.length || 0})
                  </div>
                  <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="upload-file-button">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleFileSubmit} className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <input
                            type="file"
                            id="fileInput"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.ppt,.pptx,.xls,.xlsx,.csv,.mp4,.mp3,.zip"
                          />
                          <label htmlFor="fileInput" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              {selectedFile ? selectedFile.name : 'Click to upload a file from your computer'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports: PDF, Documents, Images, Presentations, Spreadsheets, Media files
                            </p>
                          </label>
                        </div>
                        
                        {selectedFile && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="font-medium">{selectedFile.name}</span>
                              <Badge variant="outline">{getFileCategory(selectedFile.type, selectedFile.name)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                        
                        {!selectedFile && (
                          <>
                            <div className="text-center">
                              <span className="text-sm text-muted-foreground">Or provide a file URL</span>
                            </div>
                            <div>
                              <Label htmlFor="fileUrl">File URL</Label>
                              <Input
                                id="fileUrl"
                                value={fileFormData.fileUrl}
                                onChange={(e) => setFileFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                                placeholder="https://example.com/file.pdf"
                                type="url"
                                data-testid="file-url-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="fileName">File Name</Label>
                              <Input
                                id="fileName"
                                value={fileFormData.fileName}
                                onChange={(e) => setFileFormData(prev => ({ ...prev, fileName: e.target.value }))}
                                placeholder="Enter file name"
                                data-testid="file-name-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="fileType">File Type</Label>
                              <Input
                                id="fileType"
                                value={fileFormData.fileType}
                                onChange={(e) => setFileFormData(prev => ({ ...prev, fileType: e.target.value }))}
                                placeholder="pdf, image, document, etc."
                                data-testid="file-type-input"
                              />
                            </div>
                          </>
                        )}
                        
                        <div>
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={fileFormData.description}
                            onChange={(e) => setFileFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of the file"
                            data-testid="file-description-input"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={uploadFileMutation.isPending}
                          className="w-full"
                          data-testid="submit-file"
                        >
                          {uploadFileMutation.isPending ? 'Uploading...' : 'Upload File'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filesLoading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading files...
                    </div>
                  ) : (files?.length ?? 0) > 0 ? (
                    files?.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`file-${file.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" data-testid={`file-name-${file.id}`}>
                            {file.fileName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {file.fileType}
                            </Badge>
                            <span>by {file.uploader?.firstName}</span>
                            {file.downloadCount > 0 && (
                              <span>• {file.downloadCount} downloads</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              window.open(file.fileUrl, '_blank');
                              // Update download count
                              apiRequest('POST', `/api/files/${file.id}/download`);
                            }}
                            data-testid={`download-file-${file.id}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          {file.uploadedBy === user.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFileDelete(file.id)}
                              disabled={deleteFileMutation.isPending}
                              data-testid={`delete-file-${file.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files shared yet</p>
                      <p className="text-xs">Upload study materials to get started</p>
                    </div>
                  )}
                </div>
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={startVideoCall}
                    disabled={createVideoCallMutation.isPending || !!activeCall}
                    data-testid="start-video-call"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {createVideoCallMutation.isPending 
                      ? 'Starting Call...' 
                      : activeCall 
                        ? 'Call in Progress' 
                        : 'Start Video Call'
                    }
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
