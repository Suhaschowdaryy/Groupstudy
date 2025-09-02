import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  podId: string;
  messageType: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface ChatRoomProps {
  podId: string;
  podName?: string;
}

export default function ChatRoom({ podId, podName }: ChatRoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch existing messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/pods', podId, 'messages'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/pods/${podId}/messages`);
      return response.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/pods/${podId}/messages`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      // The WebSocket will handle adding the message to the UI
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (!user || !podId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to chat WebSocket');
      // Join the pod room
      ws.send(JSON.stringify({
        type: 'join_pod',
        userId: user.id,
        podId: podId,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          // Add new message to the query cache
          queryClient.setQueryData(
            ['/api/pods', podId, 'messages'],
            (oldMessages: ChatMessage[] = []) => {
              // Check if message already exists to avoid duplicates
              const messageExists = oldMessages.some(msg => msg.id === data.message.id);
              if (messageExists) return oldMessages;
              return [data.message, ...oldMessages];
            }
          );
          break;
          
        case 'user_joined':
          if (data.userId !== user.id) {
            setConnectedUsers(prev => [...prev, data.userId]);
            toast({
              title: "User joined",
              description: "Someone joined the chat",
            });
          }
          break;
          
        case 'user_left':
          setConnectedUsers(prev => prev.filter(id => id !== data.userId));
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from chat WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection error",
        description: "Failed to connect to chat. Please refresh the page.",
        variant: "destructive",
      });
    };

    return () => {
      ws.close();
    };
  }, [user, podId, queryClient, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage);
  };

  const getDisplayName = (user: ChatMessage['user']) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'Anonymous User';
  };

  const getInitials = (user: ChatMessage['user']) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'AU';
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="text-primary w-5 h-5" />
          {podName ? `${podName} Chat` : 'Group Chat'}
          {connectedUsers.length > 0 && (
            <span className="text-sm text-muted-foreground ml-auto">
              {connectedUsers.length + 1} online
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <Separator />
      
      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {[...messages].reverse().map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${
                    message.userId === user?.id ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(message.user)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col max-w-[70%] ${
                    message.userId === user?.id ? 'items-end' : 'items-start'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {getDisplayName(message.user)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className={`rounded-lg px-3 py-2 max-w-full break-words ${
                      message.userId === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <Separator />
      
      {/* Message Input */}
      <CardContent className="p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
            data-testid="chat-input"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="send-chat-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}