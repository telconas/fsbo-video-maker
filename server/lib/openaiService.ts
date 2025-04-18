import { PropertyVideo } from "@shared/schema";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a property description using OpenAI's GPT-4o model
 */
export async function generatePropertyDescription(
  video: PropertyVideo,
): Promise<string> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  // Get basic property details for the prompt
  const address = getFullAddress(video);
  const { price, description } = video;

  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert real estate agent specializing in writing compelling property descriptions. 
          Write a professional and engaging 30-45 second narration script for a real estate video.
          Focus on the property's key selling points, the neighborhood, and unique features.
          Do not include the price in the description as it will be shown separately.
          Aim for a warm, inviting tone that would make potential buyers interested in the property.
          Do not include any contact information in the description.
          Keep the description concise, between 80-100 words. The description must be SHORT and fit in a 30-45 second narration. When you speak numbers, you will speak each digit at a time. For example, 12003 would be read, one, two, zero,zero, three.`,
        },
        {
          role: "user",
          content: `Create a brief professional narration for this property:
          Address: ${address}
          Price: ${price}
          ${description ? `Owner's description: ${description}` : ""}
          
          Remember: The script should be 30-45 seconds when read aloud (80-100 words).
          Be conversational, brief, and professional. Focus on just 2-3 key features.
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 250, // Reduced max tokens for a shorter description
    });

    const generatedDescription = response.choices[0].message.content;
    return generatedDescription || "Welcome to this beautiful property.";
  } catch (error) {
    console.error("Error generating property description:", error);
    // Return a simple default description if the API fails
    return `Welcome to this beautiful property at ${address}.`;
  }
}

// Helper function to format a complete address from various fields
function getFullAddress(video: PropertyVideo): string {
  if (video.streetAddress && (video.city || video.state || video.zipCode)) {
    const parts = [];
    parts.push(video.streetAddress);

    const locationParts = [];
    if (video.city) locationParts.push(video.city);
    if (video.state) locationParts.push(video.state);
    if (video.zipCode) locationParts.push(video.zipCode);

    if (locationParts.length > 0) {
      parts.push(locationParts.join(", "));
    }

    return parts.join(", ");
  }

  return video.address;
}

/**
 * Convert text to speech using OpenAI's TTS API
 */
export async function convertTextToSpeech(
  text: string,
  videoId: number,
  voiceId?: string,
): Promise<string> {
  type OpenAIVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  // Define the output directory and file path
  const audioDir = path.join(process.cwd(), "public", "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const fileName = `narration-${videoId}-${Date.now()}.mp3`;
  const outputPath = path.join(audioDir, fileName);

  // Always use Nova voice for reliability and consistency
  // Nova is a warm, professional female voice that works best for property tours
  const voice = "nova";

  try {
    // Create an MP3 file with the narration
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as OpenAIVoice,
      input: text,
      speed: 0.95, // Slightly slower for real estate narration
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Write the buffer to an MP3 file
    fs.writeFileSync(outputPath, buffer);

    // Return the URL path to the audio file
    return `/audio/${fileName}`;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw new Error("Failed to generate audio narration");
  }
}

/**
 * Generate property description and convert to speech
 * Returns the URL to the generated audio file
 */
export async function generatePropertyAudio(
  video: PropertyVideo,
): Promise<string> {
  try {
    // First generate the description
    const aiDescription = await generatePropertyDescription(video);

    // Then convert to speech using the selected voice
    const narrationUrl = await convertTextToSpeech(
      aiDescription,
      video.id,
      video.voiceId || undefined,
    );

    // Update the video's AI description and narration URL
    await storage.updatePropertyVideoNarration(
      video.id,
      aiDescription,
      narrationUrl,
    );

    return narrationUrl;
  } catch (error) {
    console.error("Error generating property audio:", error);
    throw error;
  }
}

// Import the storage - needs to be at the bottom to avoid circular dependencies
import { storage } from "../storage";
