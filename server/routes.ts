import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";

// Extend Express Request type to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import { storage } from "./storage";
import { 
  analyzeImageForNavigation, 
  processAudioForNavigation, 
  generateNavigationInstruction,
  transcribeAudio 
} from "./services/openai";
import { 
  insertNavigationSessionSchema,
  insertDetectedObjectSchema,
  insertAudioEventSchema,
  insertRecognizedTextSchema 
} from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Navigation session routes
  app.post('/api/navigation/start', async (req, res) => {
    try {
      const sessionData = insertNavigationSessionSchema.parse(req.body);
      const session = await storage.createNavigationSession(sessionData);
      
      broadcast({ type: 'navigation_started', session });
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/navigation/active', async (req, res) => {
    try {
      const activeSession = await storage.getActiveNavigationSession();
      res.json(activeSession);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch('/api/navigation/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage.updateNavigationSession(id, updates);
      
      broadcast({ type: 'navigation_updated', session });
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Vision analysis route
  app.post('/api/vision/analyze', upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image provided' });
      }

      const base64Image = req.file.buffer.toString('base64');
      const analysis = await analyzeImageForNavigation(base64Image);
      
      // Store detected objects and text
      const sessionId = req.body.sessionId;
      if (sessionId) {
        // Store objects
        for (const obj of analysis.objects) {
          const objectData = insertDetectedObjectSchema.parse({
            sessionId,
            name: obj.name,
            description: obj.description,
            distance: obj.distance,
            position: obj.position,
            confidence: obj.confidence
          });
          await storage.createDetectedObject(objectData);
        }
        
        // Store obstacles
        for (const obstacle of analysis.obstacles) {
          const objectData = insertDetectedObjectSchema.parse({
            sessionId,
            name: obstacle.name,
            description: obstacle.description,
            distance: obstacle.distance,
            position: obstacle.position,
            confidence: obstacle.confidence
          });
          await storage.createDetectedObject(objectData);
        }
        
        // Store recognized text
        for (const text of analysis.textContent) {
          const textData = insertRecognizedTextSchema.parse({
            sessionId,
            type: text.type,
            content: text.content,
            confidence: text.confidence
          });
          await storage.createRecognizedText(textData);
        }
      }

      broadcast({ type: 'vision_analysis', analysis });
      res.json(analysis);
    } catch (error) {
      console.error('Vision analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze image' });
    }
  });

  // Audio processing route
  app.post('/api/audio/process', upload.single('audio'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No audio provided' });
      }

      // Transcribe audio first
      const transcription = await transcribeAudio(req.file.buffer);
      
      // Process transcribed text
      const analysis = await processAudioForNavigation(transcription.text);
      
      // Store audio events
      const sessionId = req.body.sessionId;
      if (sessionId) {
        for (const event of analysis.events) {
          const eventData = insertAudioEventSchema.parse({
            sessionId,
            type: event.type,
            content: event.content,
            audioLevel: req.body.audioLevel || 50
          });
          await storage.createAudioEvent(eventData);
        }
      }

      broadcast({ type: 'audio_analysis', analysis, transcription: transcription.text });
      res.json({ analysis, transcription: transcription.text });
    } catch (error) {
      console.error('Audio processing error:', error);
      res.status(500).json({ message: 'Failed to process audio' });
    }
  });

  // Navigation instruction generation
  app.post('/api/navigation/instruction', async (req, res) => {
    try {
      const { sessionId, userQuery, currentLocation, destination } = req.body;
      
      // Get recent context from session
      const objects = await storage.getRecentDetectedObjects(sessionId);
      const texts = await storage.getRecentRecognizedTexts(sessionId);
      
      const context = {
        detectedObjects: objects.map((obj: any) => `${obj.name} (${obj.distance})`),
        recognizedText: texts.map((text: any) => text.content),
        userQuery,
        currentLocation,
        destination
      };
      
      const instruction = await generateNavigationInstruction(context);
      
      // Update session with new instruction
      await storage.updateNavigationSession(sessionId, {
        currentInstruction: instruction.instruction
      });
      
      broadcast({ type: 'navigation_instruction', instruction });
      res.json(instruction);
    } catch (error) {
      console.error('Instruction generation error:', error);
      res.status(500).json({ message: 'Failed to generate instruction' });
    }
  });

  // Get session data
  app.get('/api/navigation/:id/objects', async (req, res) => {
    try {
      const { id } = req.params;
      const objects = await storage.getDetectedObjectsBySession(id);
      res.json(objects);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/navigation/:id/audio', async (req, res) => {
    try {
      const { id } = req.params;
      const events = await storage.getAudioEventsBySession(id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/navigation/:id/texts', async (req, res) => {
    try {
      const { id } = req.params;
      const texts = await storage.getRecognizedTextsBySession(id);
      res.json(texts);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return httpServer;
}
