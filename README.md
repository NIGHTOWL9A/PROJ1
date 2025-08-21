# NaviVision - Visual Navigation Assistant

AI-powered navigation assistance for visually impaired users featuring voice commands, computer vision, and audio processing.

## Features

- **Voice Interaction**: Hands-free voice commands and responses
- **Computer Vision**: Real-time object detection and text recognition
- **Audio Processing**: Environmental hazard detection and audio alerts
- **Navigation Instructions**: Step-by-step voice-guided directions
- **Emergency Controls**: Quick access safety features
- **Accessibility**: Large touch targets, screen reader support, high contrast

## Deployment Options

### Free Deployment on Vercel

1. **Connect to GitHub**:
   - Push your code to a GitHub repository
   - Connect your Vercel account to GitHub

2. **Deploy**:
   - Import your repository in Vercel
   - Set environment variables (see .env.example)
   - Deploy automatically

3. **Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key for AI processing
   - `NODE_ENV`: Set to "production"

### Alternative Free Platforms

- **Railway**: Full-stack deployment with database support
- **Render**: Free tier with backend + frontend hosting
- **Netlify**: Great for frontend with serverless functions

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, WebSocket
- **AI**: OpenAI GPT-4o for vision, audio, and text processing
- **Database**: PostgreSQL with Drizzle ORM (optional)

## API Requirements

- OpenAI API key for AI-powered features
- Camera and microphone permissions for full functionality

## Accessibility

This app is designed with accessibility as a primary concern:
- Voice navigation support
- Screen reader compatibility  
- Large, high-contrast interface elements
- Audio feedback for all interactions