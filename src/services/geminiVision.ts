import { GoogleGenerativeAI } from '@google/generative-ai';
import { StockReportItem } from '../types';

export interface VisionAnalysisResult {
  success: boolean;
  items: StockReportItem[];
  rawResponse: string;
  isFallback?: boolean;
  error?: string;
}

// Convert File to base64 inline
export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'image/jpeg',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SYSTEM_PROMPT = `You are looking at a photo of a medicine storage shelf in an Indian public health centre. Identify each distinct medicine box/bottle/strip visible, estimate the count of each, and return ONLY valid JSON in this shape: 
[{"medicineName": string, "quantity": number, "confidence": "high"|"medium"|"low"}]
If you cannot confidently identify a medicine name from packaging, use a generic label like "Unlabeled tablets (blister pack)". Do not include markdown code block formatting like \`\`\`json, return raw JSON array only.`;

export async function analyzeShelfPhoto(imageFile: File): Promise<VisionAnalysisResult> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    return {
      success: false,
      items: [],
      rawResponse: '',
      isFallback: false,
      error: 'No Gemini API Key configured in environment (VITE_GEMINI_API_KEY). Please add your API key to .env or use manual entry.'
    };
  }

  // Model strictly set to gemini-3.5-flash
  const modelName = (import.meta as any).env?.VITE_GEMINI_MODEL || 'gemini-3.5-flash';

  const genAI = new GoogleGenerativeAI(apiKey);
  const imagePart = await fileToGenerativePart(imageFile);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
    const responseText = result.response.text();

    const cleanedJsonText = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed: StockReportItem[] = JSON.parse(cleanedJsonText);

    return {
      success: true,
      items: parsed,
      rawResponse: responseText,
      isFallback: false,
    };
  } catch (err: any) {
    console.error(`Gemini 3.5 Vision API error with model '${modelName}':`, err);
    return {
      success: false,
      items: [],
      rawResponse: '',
      isFallback: false,
      error: err.message || `Gemini 3.5 Vision API request failed (503 / Model Error). Please retry or use manual entry.`
    };
  }
}
