import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Bot, Send, User, Sparkles, Clock, BookOpen, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  subject?: string;
}

export default function AIChat() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const { data: aiHistory } = useQuery({
    queryKey: ['/api/ai/history'],
    enabled: !!user,
  });

  const askAIMutation = useMutation({
    mutationFn: async ({ question, subject }: { question: string; subject?: string }) => {
      const response = await apiRequest('POST', '/api/ai/ask', {
        question,
        subject,
        context: selectedSubject || subject
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.response,
        isAI: true,
        timestamp: new Date(),
        subject: selectedSubject,
      };
      setMessages(prev => [...prev, aiMessage]);
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
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const generateStudyPlanMutation = useMutation({
    mutationFn: async ({ subject, timeAvailable }: { subject: string; timeAvailable: number }) => {
      const response = await apiRequest('POST', '/api/ai/study-plan', {
        subject,
        timeAvailable
      });
      return response.json();
    },
    onSuccess: (data) => {
      const planMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Here's a personalized study plan for ${selectedSubject}:\n\n${JSON.stringify(data.studyPlan, null, 2)}`,
        isAI: true,
        timestamp: new Date(),
        subject: selectedSubject,
      };
      setMessages(prev => [...prev, planMessage]);
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
        description: error.message || "Failed to generate study plan",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Send to AI
    askAIMutation.mutate({
      question: inputMessage,
      subject: selectedSubject,
    });
  };

  const handleGenerateStudyPlan = () => {
    if (!selectedSubject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `Generate a study plan for ${selectedSubject}`,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    generateStudyPlanMutation.mutate({
      subject: selectedSubject,
      timeAvailable: 10, // Default 10 hours per week
    });
  };

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Psychology', 'History', 'Literature', 'Economics'];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-pulse">
              <Bot className="text-white w-6 h-6" />
            </div>
            AI Study Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            Get personalized help with your studies and academic questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="glassmorphism h-[700px] flex flex-col bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary w-5 h-5" />
                    AI Chat
                  </CardTitle>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-48" data-testid="subject-context">
                      <SelectValue placeholder="Select subject context" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="ai-chat-messages">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                        data-testid={`chat-message-${message.id}`}
                      >
                        <div className={`flex items-start space-x-3 max-w-3xl ${message.isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
                          <Avatar className="w-8 h-8">
                            {message.isAI ? (
                              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                <Bot className="text-white w-4 h-4" />
                              </div>
                            ) : (
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className={`glassmorphism rounded-2xl p-4 ${
                            message.isAI 
                              ? 'bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30' 
                              : 'bg-primary/10 border border-primary/20'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid={`message-content-${message.id}`}>
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.subject && (
                                <span className="text-primary">{message.subject}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {(askAIMutation.isPending || generateStudyPlanMutation.isPending) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-3 max-w-3xl">
                        <Avatar className="w-8 h-8">
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <Bot className="text-white w-4 h-4 animate-pulse" />
                          </div>
                        </Avatar>
                        <div className="glassmorphism rounded-2xl p-4 bg-card/30 dark:bg-card/30 backdrop-blur-lg border border-border/30">
                          <div className="flex items-center space-x-2">
                            <div className="animate-bounce">●</div>
                            <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</div>
                            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <Separator />
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about your studies..."
                        className="min-h-[80px] resize-none"
                        data-testid="ai-chat-input"
                      />
                      <Button 
                        type="submit" 
                        disabled={!inputMessage.trim() || askAIMutation.isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        data-testid="send-ai-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleGenerateStudyPlan}
                      disabled={!selectedSubject || generateStudyPlanMutation.isPending}
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent/10"
                      data-testid="generate-study-plan"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Generate Study Plan for {selectedSubject || 'Selected Subject'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Topics */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" />
                  Quick Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Explain quantum mechanics',
                    'Help with calculus problems',
                    'Create a study schedule',
                    'Review biology concepts',
                    'Programming best practices',
                  ].map((topic, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => setInputMessage(topic)}
                      data-testid={`quick-topic-${index}`}
                    >
                      <span className="text-sm">{topic}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-primary w-5 h-5" />
                  Recent Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(aiHistory as any[])?.slice(0, 5).map((interaction: any, index: number) => (
                    <div 
                      key={interaction.id}
                      className="p-3 glassmorphism rounded-lg cursor-pointer hover:bg-muted/30 transition-colors bg-card/20 dark:bg-card/20 backdrop-blur-lg border border-border/20"
                      onClick={() => setInputMessage(interaction.question)}
                      data-testid={`history-item-${index}`}
                    >
                      <p className="text-sm text-muted-foreground truncate">
                        {interaction.question}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-primary">{interaction.context || 'General'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(interaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent questions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-primary w-5 h-5" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 glassmorphism rounded-lg bg-card/20 dark:bg-card/20 backdrop-blur-lg border border-border/20">
                    <p className="text-primary mb-1">💡 Pro Tip</p>
                    <p className="text-muted-foreground">
                      Use the Feynman Technique - explain concepts in simple terms to test your understanding.
                    </p>
                  </div>
                  
                  <div className="p-3 glassmorphism rounded-lg bg-card/20 dark:bg-card/20 backdrop-blur-lg border border-border/20">
                    <p className="text-accent mb-1">🎯 Focus Method</p>
                    <p className="text-muted-foreground">
                      Try the Pomodoro Technique: 25 minutes focused study, 5 minutes break.
                    </p>
                  </div>

                  <div className="p-3 glassmorphism rounded-lg bg-card/20 dark:bg-card/20 backdrop-blur-lg border border-border/20">
                    <p className="text-secondary mb-1">🧠 Memory Hack</p>
                    <p className="text-muted-foreground">
                      Space out your review sessions for better long-term retention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
