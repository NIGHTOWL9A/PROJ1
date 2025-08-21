import { 
  type NavigationSession, 
  type InsertNavigationSession,
  type DetectedObject,
  type InsertDetectedObject,
  type AudioEvent,
  type InsertAudioEvent,
  type RecognizedText,
  type InsertRecognizedText
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Navigation Session methods
  createNavigationSession(session: InsertNavigationSession): Promise<NavigationSession>;
  getActiveNavigationSession(): Promise<NavigationSession | undefined>;
  updateNavigationSession(id: string, updates: Partial<NavigationSession>): Promise<NavigationSession>;
  
  // Detected Object methods
  createDetectedObject(object: InsertDetectedObject): Promise<DetectedObject>;
  getDetectedObjectsBySession(sessionId: string): Promise<DetectedObject[]>;
  getRecentDetectedObjects(sessionId: string, limit?: number): Promise<DetectedObject[]>;
  
  // Audio Event methods
  createAudioEvent(event: InsertAudioEvent): Promise<AudioEvent>;
  getAudioEventsBySession(sessionId: string): Promise<AudioEvent[]>;
  
  // Recognized Text methods
  createRecognizedText(text: InsertRecognizedText): Promise<RecognizedText>;
  getRecognizedTextsBySession(sessionId: string): Promise<RecognizedText[]>;
  getRecentRecognizedTexts(sessionId: string, limit?: number): Promise<RecognizedText[]>;
}

export class MemStorage implements IStorage {
  private navigationSessions: Map<string, NavigationSession>;
  private detectedObjects: Map<string, DetectedObject>;
  private audioEvents: Map<string, AudioEvent>;
  private recognizedTexts: Map<string, RecognizedText>;

  constructor() {
    this.navigationSessions = new Map();
    this.detectedObjects = new Map();
    this.audioEvents = new Map();
    this.recognizedTexts = new Map();
  }

  async createNavigationSession(insertSession: InsertNavigationSession): Promise<NavigationSession> {
    const id = randomUUID();
    const session: NavigationSession = {
      userId: insertSession.userId ?? null,
      currentInstruction: insertSession.currentInstruction ?? null,
      totalSteps: insertSession.totalSteps ?? null,
      isActive: insertSession.isActive ?? null,
      id,
      startTime: new Date(),
      endTime: null,
      progress: 0
    };
    this.navigationSessions.set(id, session);
    return session;
  }

  async getActiveNavigationSession(): Promise<NavigationSession | undefined> {
    return Array.from(this.navigationSessions.values()).find(
      session => session.isActive
    );
  }

  async updateNavigationSession(id: string, updates: Partial<NavigationSession>): Promise<NavigationSession> {
    const existing = this.navigationSessions.get(id);
    if (!existing) {
      throw new Error('Navigation session not found');
    }
    const updated = { ...existing, ...updates };
    this.navigationSessions.set(id, updated);
    return updated;
  }

  async createDetectedObject(insertObject: InsertDetectedObject): Promise<DetectedObject> {
    const id = randomUUID();
    const object: DetectedObject = {
      sessionId: insertObject.sessionId ?? null,
      name: insertObject.name,
      description: insertObject.description ?? null,
      distance: insertObject.distance ?? null,
      position: insertObject.position ?? null,
      confidence: insertObject.confidence ?? null,
      id,
      timestamp: new Date()
    };
    this.detectedObjects.set(id, object);
    return object;
  }

  async getDetectedObjectsBySession(sessionId: string): Promise<DetectedObject[]> {
    return Array.from(this.detectedObjects.values()).filter(
      obj => obj.sessionId === sessionId
    );
  }

  async getRecentDetectedObjects(sessionId: string, limit: number = 10): Promise<DetectedObject[]> {
    const objects = await this.getDetectedObjectsBySession(sessionId);
    return objects
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async createAudioEvent(insertEvent: InsertAudioEvent): Promise<AudioEvent> {
    const id = randomUUID();
    const event: AudioEvent = {
      sessionId: insertEvent.sessionId ?? null,
      type: insertEvent.type,
      content: insertEvent.content ?? null,
      audioLevel: insertEvent.audioLevel ?? null,
      id,
      timestamp: new Date()
    };
    this.audioEvents.set(id, event);
    return event;
  }

  async getAudioEventsBySession(sessionId: string): Promise<AudioEvent[]> {
    return Array.from(this.audioEvents.values()).filter(
      event => event.sessionId === sessionId
    );
  }

  async createRecognizedText(insertText: InsertRecognizedText): Promise<RecognizedText> {
    const id = randomUUID();
    const text: RecognizedText = {
      sessionId: insertText.sessionId ?? null,
      type: insertText.type,
      content: insertText.content,
      confidence: insertText.confidence ?? null,
      id,
      timestamp: new Date()
    };
    this.recognizedTexts.set(id, text);
    return text;
  }

  async getRecognizedTextsBySession(sessionId: string): Promise<RecognizedText[]> {
    return Array.from(this.recognizedTexts.values()).filter(
      text => text.sessionId === sessionId
    );
  }

  async getRecentRecognizedTexts(sessionId: string, limit: number = 10): Promise<RecognizedText[]> {
    const texts = await this.getRecognizedTextsBySession(sessionId);
    return texts
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
