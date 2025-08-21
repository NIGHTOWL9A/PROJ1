# Visual Navigation Assistant

## Overview

This is a real-time accessibility application designed to assist visually impaired users with navigation through voice commands, computer vision, and audio processing. The system provides voice-guided directions, object detection, text recognition, and audio hazard detection to help users navigate safely in indoor environments like airports, malls, and public buildings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 and TypeScript, using Vite as the build tool. The UI framework is built on top of shadcn/ui components with Radix UI primitives, providing a comprehensive set of accessible components styled with Tailwind CSS. The application uses Wouter for lightweight routing and TanStack Query for server state management.

**Key Frontend Patterns:**
- **Component-based modular design**: Each major feature (vision, audio, voice, text recognition) is encapsulated in its own component
- **Custom React hooks**: Abstractions for camera access (`use-camera`), microphone recording (`use-microphone`), speech synthesis/recognition (`use-speech`), and WebSocket communication (`use-websocket`)
- **Real-time data handling**: WebSocket integration for live updates from vision analysis and audio processing
- **Accessibility-first design**: Large touch targets, high contrast colors, screen reader support, and voice navigation

### Backend Architecture
The server uses Express.js with TypeScript running on Node.js. It implements a RESTful API with WebSocket support for real-time communication. The architecture separates concerns into distinct service layers for different AI processing tasks.

**Key Backend Patterns:**
- **Route-based API structure**: Clean separation of endpoints with middleware for logging and error handling
- **Service layer abstraction**: Dedicated OpenAI service for vision analysis, audio processing, and text generation
- **Real-time communication**: WebSocket server for broadcasting analysis results to connected clients
- **Memory-based storage**: Simple in-memory storage implementation with interface for future database integration
- **File upload handling**: Multer middleware for processing image and audio uploads with size limits

### Data Storage Solutions
Currently implements an in-memory storage system with a clean interface that can be easily swapped for persistent storage. The schema is defined using Drizzle ORM with PostgreSQL dialect, indicating preparation for database integration.

**Database Schema Design:**
- **Navigation sessions**: Track user navigation sessions with progress and instructions
- **Detected objects**: Store vision analysis results with confidence scores and positioning
- **Audio events**: Record audio hazard detection and ambient sound analysis
- **Recognized texts**: Archive OCR results from signs and visual text

### Authentication and Authorization
The current implementation includes a basic user storage interface but does not implement full authentication. The system is designed with user sessions in mind for future enhancement.

### AI Integration Architecture
The system integrates with OpenAI's GPT-4o model for multiple AI services:

**Vision Analysis Service:**
- **Image processing**: Analyzes camera frames for navigation objects, obstacles, and text content
- **Object detection**: Identifies landmarks, hazards, and navigational aids with distance estimates
- **OCR capabilities**: Extracts text from signs, gate numbers, and directional indicators
- **Structured output**: Returns JSON-formatted results for consistent client processing

**Audio Processing Service:**
- **Sound analysis**: Processes ambient audio to detect vehicles, alarms, and other hazards
- **Speech transcription**: Converts voice commands to text for navigation requests
- **Audio event classification**: Categories sounds by importance level and required actions

**Navigation Instruction Generation:**
- **Route planning**: Generates step-by-step voice instructions based on visual analysis
- **Context awareness**: Adapts instructions based on detected objects and user progress
- **Natural language output**: Provides clear, conversational directions optimized for audio delivery

## External Dependencies

### Core Framework Dependencies
- **React ecosystem**: React 18, TypeScript, Vite for modern frontend development
- **UI framework**: shadcn/ui with Radix UI primitives for accessible component library
- **Styling**: Tailwind CSS with custom accessibility-focused design tokens
- **State management**: TanStack Query for server state, built-in React state for local UI

### Backend Dependencies
- **Express.js**: Web server framework with TypeScript support
- **WebSocket**: Real-time bidirectional communication via 'ws' library
- **File processing**: Multer for handling multipart form data and file uploads

### Database and ORM
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **Neon Database**: Serverless PostgreSQL database service integration
- **Database migration**: Drizzle Kit for schema management and migrations

### AI and Machine Learning
- **OpenAI API**: GPT-4o model for vision analysis, audio processing, and text generation
- **Computer vision**: Real-time image analysis through OpenAI's vision capabilities
- **Speech processing**: Browser Web Speech API for voice recognition and synthesis

### Development and Deployment
- **Replit integration**: Custom Vite plugins for Replit development environment
- **Build tools**: ESBuild for server bundling, PostCSS for CSS processing
- **Development utilities**: Runtime error overlays and cartographer for enhanced debugging

### Browser APIs
- **MediaDevices API**: Camera and microphone access for real-time processing
- **Web Speech API**: Speech recognition and synthesis for voice interaction
- **WebSocket API**: Real-time communication between client and server