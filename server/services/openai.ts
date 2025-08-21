import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function analyzeImageForNavigation(base64Image: string): Promise<{
  objects: Array<{
    name: string;
    description: string;
    distance: string;
    position: string;
    confidence: number;
  }>;
  obstacles: Array<{
    name: string;
    description: string;
    distance: string;
    position: string;
    confidence: number;
  }>;
  textContent: Array<{
    type: string;
    content: string;
    confidence: number;
  }>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a vision assistant for visually impaired navigation. Analyze the image and identify:
1. Objects and landmarks that could help with navigation
2. Potential obstacles or hazards
3. Any visible text (signs, gate numbers, directions)

Provide distance estimates and positioning (left, right, ahead, behind) relative to the camera view.
Respond with JSON in this exact format: {
  "objects": [{"name": string, "description": string, "distance": string, "position": string, "confidence": number}],
  "obstacles": [{"name": string, "description": string, "distance": string, "position": string, "confidence": number}],
  "textContent": [{"type": string, "content": string, "confidence": number}]
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for navigation assistance for a visually impaired person."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Failed to analyze image:", error);
    throw new Error("Failed to analyze image for navigation");
  }
}

export async function processAudioForNavigation(audioText: string): Promise<{
  events: Array<{
    type: string;
    content: string;
    importance: 'low' | 'medium' | 'high';
    actionRequired: boolean;
  }>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an audio processing assistant for visually impaired navigation. Analyze the transcribed audio and identify:
1. Public announcements or important information
2. Vehicle sounds or traffic-related audio
3. Human conversations that might contain navigation help
4. Warning sounds or alarms

Classify each event by importance and whether immediate action is required.
Respond with JSON in this exact format: {
  "events": [{"type": string, "content": string, "importance": "low"|"medium"|"high", "actionRequired": boolean}]
}`
        },
        {
          role: "user",
          content: `Analyze this transcribed audio for navigation assistance: "${audioText}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Failed to process audio:", error);
    throw new Error("Failed to process audio for navigation");
  }
}

export async function generateNavigationInstruction(
  currentContext: {
    detectedObjects: string[];
    recognizedText: string[];
    userQuery?: string;
    currentLocation?: string;
    destination?: string;
  }
): Promise<{
  instruction: string;
  priority: 'normal' | 'urgent' | 'warning';
  estimatedDuration: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a navigation assistant for visually impaired users. Generate clear, actionable navigation instructions based on the current context.

Instructions should be:
- Concise and easy to follow
- Include specific distances and directions
- Prioritize safety
- Use natural language

Respond with JSON in this exact format: {
  "instruction": string,
  "priority": "normal"|"urgent"|"warning",
  "estimatedDuration": string
}`
        },
        {
          role: "user",
          content: `Generate navigation instruction based on:
Detected objects: ${currentContext.detectedObjects.join(', ')}
Recognized text: ${currentContext.recognizedText.join(', ')}
User query: ${currentContext.userQuery || 'None'}
Current location: ${currentContext.currentLocation || 'Unknown'}
Destination: ${currentContext.destination || 'Not specified'}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Failed to generate navigation instruction:", error);
    throw new Error("Failed to generate navigation instruction");
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<{ text: string }> {
  try {
    // Create a temporary file-like object from the buffer
    const audioFile = new File([audioBuffer], "audio.wav", { type: "audio/wav" });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return { text: transcription.text };
  } catch (error) {
    console.error("Failed to transcribe audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}
