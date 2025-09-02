import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  generateStudyPlan, 
  calculatePodMatch, 
  answerStudyQuestion, 
  generateStudyTip,
  moderateChatMessage 
} from "./gemini";
import { 
  insertStudyPodSchema, 
  insertPodMembershipSchema,
  insertStudySessionSchema,
  insertChatMessageSchema,
  insertAiInteractionSchema,
  insertPodFileSchema,
  insertVideoCallSessionSchema,
  insertVideoCallParticipantSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server first
  const httpServer = createServer(app);
  
  // Auth middleware
  setupAuth(app);

  // This route is now handled in auth.ts
  // Removing duplicate route definition

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = req.body;
      
      const user = await storage.updateUserProfile(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Study Pod routes
  app.post('/api/pods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const podData = insertStudyPodSchema.parse({
        ...req.body,
        creatorId: userId
      });
      
      const pod = await storage.createStudyPod(podData);
      
      // Automatically join creator to the pod
      await storage.joinPod({
        userId,
        podId: pod.id,
        role: "creator"
      });
      
      res.status(201).json(pod);
    } catch (error) {
      console.error("Error creating pod:", error);
      res.status(500).json({ message: "Failed to create study pod" });
    }
  });

  app.get('/api/pods', async (req, res) => {
    try {
      const { subject, learningPace } = req.query;
      const pods = await storage.getStudyPods({
        subject: subject as string,
        learningPace: learningPace as string
      });
      res.json(pods);
    } catch (error) {
      console.error("Error fetching pods:", error);
      res.status(500).json({ message: "Failed to fetch study pods" });
    }
  });

  app.get('/api/pods/:id', async (req, res) => {
    try {
      const pod = await storage.getStudyPod(req.params.id);
      if (!pod) {
        return res.status(404).json({ message: "Study pod not found" });
      }
      res.json(pod);
    } catch (error) {
      console.error("Error fetching pod:", error);
      res.status(500).json({ message: "Failed to fetch study pod" });
    }
  });

  app.post('/api/pods/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const podId = req.params.id;
      
      const membership = await storage.joinPod({
        userId,
        podId,
        role: "member"
      });
      
      res.status(201).json(membership);
    } catch (error) {
      console.error("Error joining pod:", error);
      res.status(500).json({ message: "Failed to join study pod" });
    }
  });

  app.get('/api/pods/:id/members', async (req, res) => {
    try {
      const members = await storage.getPodMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching pod members:", error);
      res.status(500).json({ message: "Failed to fetch pod members" });
    }
  });

  // User's pods
  app.get('/api/my-pods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userPods = await storage.getUserPods(userId);
      res.json(userPods);
    } catch (error) {
      console.error("Error fetching user pods:", error);
      res.status(500).json({ message: "Failed to fetch user pods" });
    }
  });

  // AI Recommendations
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const recommendations = await storage.getRecommendedPods(userId, limit);
      
      // Calculate AI match scores for each recommendation
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const enrichedRecommendations = await Promise.all(
        recommendations.map(async (pod) => {
          try {
            const matchScore = await calculatePodMatch(
              {
                subjects: user.preferredSubjects || [],
                learningPace: user.learningPace || "intermediate",
                availability: user.availability || {},
                goals: user.studyGoals || []
              },
              {
                subject: pod.subject,
                learningPace: pod.learningPace || "intermediate",
                schedule: pod.schedule || {},
                goal: pod.goal || ""
              }
            );
            
            return {
              ...pod,
              matchScore: matchScore.score,
              matchReasons: matchScore.reasons
            };
          } catch (error) {
            console.error("Error calculating match score:", error);
            return {
              ...pod,
              matchScore: 75, // Default score if AI fails
              matchReasons: ["Compatible learning pace and subject"]
            };
          }
        })
      );

      res.json(enrichedRecommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Study Sessions
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  app.get('/api/upcoming-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getUpcomingSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming sessions" });
    }
  });

  app.post('/api/sessions/:id/attend', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionId = req.params.id;
      
      const attendance = await storage.markAttendance({
        sessionId,
        userId,
        studyTimeMinutes: req.body.studyTimeMinutes || 0
      });
      
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  // Badges
  app.get('/api/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Chat
  app.get('/api/pods/:id/messages', async (req, res) => {
    try {
      const podId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getPodMessages(podId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/pods/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const podId = req.params.id;
      const { content } = req.body;
      
      // Moderate message with AI
      const moderation = await moderateChatMessage(content);
      if (!moderation.isAppropriate) {
        return res.status(400).json({ 
          message: "Message content is not appropriate", 
          reason: moderation.reason,
          suggestedEdit: moderation.suggestedEdit 
        });
      }
      
      const messageData = insertChatMessageSchema.parse({
        podId,
        userId,
        content,
        messageType: "text"
      });
      
      const message = await storage.createMessage(messageData);
      
      // Get user info for the message
      const user = await storage.getUser(userId);
      
      // Broadcast the new message to all connected clients in this pod
      const broadcastMessage = {
        type: 'new_message',
        message: {
          ...message,
          user: user
        }
      };
      
      (httpServer as any).broadcastToPod(podId, broadcastMessage);
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // AI Assistant
  app.post('/api/ai/ask', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { question, subject, context } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      const response = await answerStudyQuestion(question, subject, context);
      
      // Save interaction
      await storage.createAiInteraction({
        userId,
        question,
        response,
        context: subject || context
      });
      
      res.json({ response });
    } catch (error) {
      console.error("Error processing AI question:", error);
      res.status(500).json({ message: "Failed to process question" });
    }
  });

  app.get('/api/ai/study-tip', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const subjects = user.preferredSubjects || ["General"];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const learningPace = user.learningPace || "intermediate";
      
      // Get recent AI interactions for context
      const recentInteractions = await storage.getUserAiHistory(userId, 5);
      const recentTopics = recentInteractions
        .map(i => i.context)
        .filter(Boolean) as string[];
      
      const tip = await generateStudyTip(subject, learningPace, recentTopics);
      
      res.json({ tip, subject });
    } catch (error) {
      console.error("Error generating study tip:", error);
      res.status(500).json({ message: "Failed to generate study tip" });
    }
  });

  app.post('/api/ai/study-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { subject, timeAvailable } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const studyPlan = await generateStudyPlan(
        subject,
        user.learningPace || "intermediate",
        user.studyGoals || [],
        timeAvailable || 10
      );
      
      res.json({ studyPlan });
    } catch (error) {
      console.error("Error generating study plan:", error);
      res.status(500).json({ message: "Failed to generate study plan" });
    }
  });

  app.get('/api/ai/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getUserAiHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching AI history:", error);
      res.status(500).json({ message: "Failed to fetch AI history" });
    }
  });

  // File sharing routes
  app.post('/api/pods/:podId/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const podId = req.params.podId;
      const fileData = insertPodFileSchema.parse({
        ...req.body,
        podId,
        uploadedBy: userId
      });
      
      const file = await storage.uploadFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/pods/:podId/files', async (req, res) => {
    try {
      const podId = req.params.podId;
      const files = await storage.getPodFiles(podId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.delete('/api/files/:fileId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const fileId = req.params.fileId;
      
      const success = await storage.deleteFile(fileId, userId);
      if (success) {
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found or unauthorized" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  app.post('/api/files/:fileId/download', async (req, res) => {
    try {
      const fileId = req.params.fileId;
      await storage.updateFileDownloadCount(fileId);
      res.json({ message: "Download count updated" });
    } catch (error) {
      console.error("Error updating download count:", error);
      res.status(500).json({ message: "Failed to update download count" });
    }
  });

  // Video call routes
  app.post('/api/pods/:podId/video-calls', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const podId = req.params.podId;
      const sessionData = insertVideoCallSessionSchema.parse({
        ...req.body,
        podId,
        hostId: userId
      });
      
      const session = await storage.createVideoCallSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating video call session:", error);
      res.status(500).json({ message: "Failed to create video call session" });
    }
  });

  app.get('/api/pods/:podId/video-calls', async (req, res) => {
    try {
      const podId = req.params.podId;
      const sessions = await storage.getVideoCallSessions(podId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching video call sessions:", error);
      res.status(500).json({ message: "Failed to fetch video call sessions" });
    }
  });

  app.get('/api/pods/:podId/active-call', async (req, res) => {
    try {
      const podId = req.params.podId;
      const activeCall = await storage.getActiveVideoCall(podId);
      res.json(activeCall);
    } catch (error) {
      console.error("Error fetching active video call:", error);
      res.status(500).json({ message: "Failed to fetch active video call" });
    }
  });

  app.post('/api/video-calls/:sessionId/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionId = req.params.sessionId;
      
      const participation = await storage.joinVideoCall({
        sessionId,
        userId
      });
      
      res.status(201).json(participation);
    } catch (error) {
      console.error("Error joining video call:", error);
      res.status(500).json({ message: "Failed to join video call" });
    }
  });

  app.post('/api/video-calls/:sessionId/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionId = req.params.sessionId;
      
      await storage.leaveVideoCall(sessionId, userId);
      res.json({ message: "Left video call successfully" });
    } catch (error) {
      console.error("Error leaving video call:", error);
      res.status(500).json({ message: "Failed to leave video call" });
    }
  });

  app.put('/api/video-calls/:sessionId/status', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { isActive } = req.body;
      
      const session = await storage.updateVideoCallStatus(sessionId, isActive);
      res.json(session);
    } catch (error) {
      console.error("Error updating video call status:", error);
      res.status(500).json({ message: "Failed to update video call status" });
    }
  });

  app.get('/api/video-calls/:sessionId/participants', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const participants = await storage.getVideoCallParticipants(sessionId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching video call participants:", error);
      res.status(500).json({ message: "Failed to fetch video call participants" });
    }
  });

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients by pod ID
  const podConnections = new Map<string, Set<WebSocket & { userId?: string; podId?: string }>>();
  
  wss.on('connection', (ws: WebSocket & { userId?: string; podId?: string }, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_pod':
            ws.userId = message.userId;
            ws.podId = message.podId;
            
            // Add to pod connections
            if (!podConnections.has(message.podId)) {
              podConnections.set(message.podId, new Set());
            }
            podConnections.get(message.podId)!.add(ws);
            
            // Notify other users that someone joined
            const joinNotification = {
              type: 'user_joined',
              userId: message.userId,
              podId: message.podId,
              timestamp: new Date().toISOString()
            };
            
            podConnections.get(message.podId)!.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(joinNotification));
              }
            });
            break;
            
          case 'send_message':
            // This will be handled by the HTTP API endpoint
            // The WebSocket is just for receiving real-time updates
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove from pod connections
      if (ws.podId && podConnections.has(ws.podId)) {
        podConnections.get(ws.podId)!.delete(ws);
        
        // Notify other users that someone left
        if (ws.userId) {
          const leaveNotification = {
            type: 'user_left',
            userId: ws.userId,
            podId: ws.podId,
            timestamp: new Date().toISOString()
          };
          
          podConnections.get(ws.podId)!.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(leaveNotification));
            }
          });
        }
        
        // Clean up empty pod connections
        if (podConnections.get(ws.podId)!.size === 0) {
          podConnections.delete(ws.podId);
        }
      }
    });
  });
  
  // Function to broadcast message to pod members
  function broadcastToPod(podId: string, message: any) {
    if (podConnections.has(podId)) {
      podConnections.get(podId)!.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }
  
  // Store the broadcast function on the server for use in routes
  (httpServer as any).broadcastToPod = broadcastToPod;
  
  return httpServer;
}
