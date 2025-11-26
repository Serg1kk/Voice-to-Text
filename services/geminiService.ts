import { GoogleGenAI } from "@google/genai";
import { ProgressCallback } from "../types";

const apiKey = process.env.API_KEY;
// Using Flash because it has higher rate limits for parallel chunk processing
const MODEL_NAME = 'gemini-2.5-flash';

const CHUNK_SIZE_MB = 10;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MB * 1024 * 1024;
const CONCURRENCY_LIMIT = 3; // Process 3 chunks at a time

/**
 * Reads a Blob/File as Base64 string.
 */
const readBlobAsBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:*/*;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Processes a single audio chunk with Gemini.
 */
const processChunk = async (
  chunk: Blob, 
  index: number, 
  total: number, 
  mimeType: string
): Promise<{ index: number; text: string }> => {
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await readBlobAsBase64(chunk);

  const prompt = `
    TASK: Transcribe this audio segment verbatim into Russian.
    CONTEXT: This is part ${index + 1} of ${total} of a longer recording.
    
    INSTRUCTIONS:
    1. Transcribe EXACTLY what is heard. Do not summarize.
    2. If a sentence is cut off at the start or end, transcribe the partial words as best as possible.
    3. Identify speakers (e.g., **Спикер 1:**, **Спикер 2:**) if possible, but prioritize continuous text flow if context is unclear.
    4. Do NOT add "End of part" or "Part ${index + 1}" markers in the output. Just the transcript.
    5. Formatting: Use Markdown. New line for new speaker.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      },
      config: {
        temperature: 0.2,
      }
    });

    return { index, text: response.text || "" };
  } catch (err) {
    console.error(`Error processing chunk ${index + 1}:`, err);
    throw new Error(`Ошибка при обработке части ${index + 1}. Попробуйте снова.`);
  }
};

export const transcribeAudio = async (
  file: File, 
  mimeType: string, 
  onProgress?: ProgressCallback
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE_BYTES);

  if (onProgress) onProgress(`Подготовка файла: разбиение на ${totalChunks} частей...`);

  const chunks: Blob[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE_BYTES;
    const end = Math.min(start + CHUNK_SIZE_BYTES, totalSize);
    chunks.push(file.slice(start, end));
  }

  const results: { index: number; text: string }[] = [];
  
  // Process in batches
  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
    const batchPromises = batch.map((chunk, batchIndex) => {
      const globalIndex = i + batchIndex;
      if (onProgress) {
        onProgress(`Обработка частей ${globalIndex + 1}-${Math.min(i + CONCURRENCY_LIMIT, totalChunks)} из ${totalChunks}...`);
      }
      return processChunk(chunk, globalIndex, totalChunks, mimeType);
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  if (onProgress) onProgress("Сборка финального текста...");

  // Sort by index to ensure correct order
  results.sort((a, b) => a.index - b.index);

  // Join with double newline to separate potential speaker turns cleanly
  const fullTranscript = results.map(r => r.text).join('\n\n');

  return fullTranscript;
};