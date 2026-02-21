import { logService } from '../logger/loggerService';
import fs from 'fs';
import path from 'path';

export interface LisaFilters {
  lösungskategorie?: string[];
  anwendungsbereich?: string[];
  aufgabenbereich?: string[];
  technischer_bereich?: string[];
  digitalisierung?: string[];
}

export interface LisaResponse {
  content: string;
  isJson: boolean;
  filters?: LisaFilters;
  isMock?: boolean;
}

const ENDPOINT_FILE = path.join(process.cwd(), '.llm_endpoint');

function loadEndpoint(model?: string): string | null {
  try {
    const endpointPath = fs.existsSync(ENDPOINT_FILE) ? ENDPOINT_FILE : null;
    if (!endpointPath) return process.env.LISA_API_BASE ? String(process.env.LISA_API_BASE) : null;

    const entries = fs.readFileSync(endpointPath, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map((line): [string, string] | null => {
        const [key, rawUrl] = line.split(/\s+/);
        if (!key || !rawUrl) return null;
        const url = /^https?:\/\//.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        return [key.toLowerCase(), url];
      })
      .filter((entry): entry is [string, string] => entry !== null);

    const map = Object.fromEntries(entries);

    const requested = map[String(model || '').toLowerCase()];
    if (requested) return requested;

    return Object.values(map)[0] || null;
  } catch {
    return process.env.LISA_API_BASE ? String(process.env.LISA_API_BASE) : null;
  }
}

function buildChatUrl(base?: string): string {
  const baseUrl = String(base || '').replace(/\/+$/, '');
  if (/\/(api|v1)\/chat\/completions$/i.test(baseUrl)) return baseUrl;
  if (/\/api$/i.test(baseUrl)) return baseUrl + '/chat/completions';
  if (/\/v1$/i.test(baseUrl)) return baseUrl + '/chat/completions';
  return baseUrl + '/api/chat/completions';
}

const LISA_API_TOKEN = process.env.LISA_API_TOKEN || process.env.LISA_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || process.env.LISA_MODEL_NAME;
const LISA_API_BASE = loadEndpoint(LLM_MODEL) || process.env.LISA_API_BASE;
const LISA_API_URL = buildChatUrl(LISA_API_BASE);
const USE_MOCK_LISA = process.env.USE_MOCK_LISA === 'true' || !LISA_API_TOKEN || LISA_API_TOKEN.length < 10;

console.log('[LISA] API Token:', LISA_API_TOKEN ? `${LISA_API_TOKEN.substring(0, 10)}...` : 'MISSING');
console.log('[URL] LISA API URL:', LISA_API_URL);
console.log('[MODEL] LLM Model:', LLM_MODEL);
console.log('[MODE] Using MOCK LISA:', USE_MOCK_LISA ? 'YES (Testing Mode)' : 'NO (Production Mode)');

/* Commented out: System prompt is now provided by LISA agent 'dilowa'
export function getSystemPrompt(context?: string): string {
  return `...`;
}
*/

export async function sendMessageToLisa(
  userMessage: string,
  context?: string,
  systemPrompt?: string
): Promise<LisaResponse> {
  try {
    if (USE_MOCK_LISA) {
      return getMockLisaResponse(userMessage, context);
    }

    const defaultSystem = 'Du bist ein präziser Bot. Antworte immer KURZ und DIREKT. Niemals Tabellen, Diagramme, Erklärungen.';

    const payload = {
      messages: [
        { role: 'system', content: systemPrompt || defaultSystem },
        { role: 'user', content: userMessage }
      ],
      model: LLM_MODEL,
      stream: false,
      max_tokens: 500,
      temperature: 0.7,
      ...(context && { context })
    };

    logService.info('Calling LISA API...', { userMessage });

    const response = await fetch(LISA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LISA_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorInfo = { 
        statusCode: response.status, 
        statusText: response.statusText,
        errorMessage: errorText 
      };
      logService.error('LISA API error:', new Error(JSON.stringify(errorInfo)));
      console.warn('[WARN] LISA API failed, falling back to mock...');
      return getMockLisaResponse(userMessage, context);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    logService.info('LISA response received', { contentLength: content.length });

    return parseListaResponse(content);
  } catch (error) {
    logService.error('Error calling LISA API:', error as Error);
    return getMockLisaResponse(userMessage, context);
  }
}

function getMockLisaResponse(userMessage: string, context?: string): LisaResponse {
  return {
    content: 'Kannst du deine Anfrage bitte etwas präziser beschreiben (z.B. Ziel, Anwendung oder Prozess)?',
    isJson: false,
    isMock: true
  };
}

export function parseListaResponse(content: string): LisaResponse {
  const trimmed = content.trim();
  if (!trimmed.startsWith('{')) {
    return {
      content: trimmed,
      isJson: false
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (isValidLisaFilters(parsed)) {
      logService.info('Valid LISA filters detected', { filters: parsed });
      return {
        content: trimmed,
        isJson: true,
        filters: parsed
      };
    }
    return { content: trimmed, isJson: false };
  } catch (error) {
    logService.warn('Failed to parse JSON from LISA response:', { error });
    return {
      content: trimmed,
      isJson: false
    };
  }
}

function isValidLisaFilters(obj: any): obj is LisaFilters {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const validKeys = [
    'lösungskategorie',
    'anwendungsbereich',
    'aufgabenbereich',
    'technischer_bereich',
    'digitalisierung'
  ];

  const hasValidKey = Object.keys(obj).some(key => validKeys.includes(key));
  
  if (!hasValidKey) {
    return false;
  }

  for (const key of Object.keys(obj)) {
    if (validKeys.includes(key) && !Array.isArray(obj[key])) {
      return false;
    }
  }

  return true;
}

export async function formatSolutionsWithLisa(
  solutions: any[],
  originalQuery: string
): Promise<string> {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (USE_MOCK_LISA) {
      return `Ich habe ${solutions.length} passende Lösungen gefunden:\n\n${
        solutions.map((s, idx) => `${idx + 1}. [${s.name || 'Unbenannt'}](${frontendUrl}/digital-atlas/digitale-solution/${s.id})
   ${s.shortDescription || 'Keine Beschreibung verfügbar'}`).join('\n\n')
      }\n\nMehr Details sind verfügbar.`;
    }

    const solutionPayload = solutions.map(s => ({
      id: s.id,
      name: s.name,
      shortDescription: s.shortDescription,
      portalLink: `${frontendUrl}/digital-atlas/digitale-solution/${s.id}`
    }));

    const systemPromptForSolutions = `You output database solutions ONLY. Absolute rules:
1. Maximum 10 lines total
2. NEVER add: tables, diagrams, architecture, planning, questions
3. Format: "[Name](link) - description" (one line per solution)
4. ONLY use data from the JSON. Nothing invented.
5. German language, concise, direct.`;

    const prompt = `SOLUTIONS (use ONLY these):
${JSON.stringify(solutionPayload, null, 2)}

Request: "${originalQuery}"

Output solutions concisely with links.`;

    const response = await sendMessageToLisa(prompt, undefined, systemPromptForSolutions);
    if (response.isMock || response.isJson) {
      return `Ich habe ${solutions.length} passende Lösungen gefunden:\n\n${
        solutions.map((s, idx) => `${idx + 1}. [${s.name || 'Unbenannt'}](${frontendUrl}/digital-atlas/digitale-solution/${s.id})
   ${s.shortDescription || 'Keine Beschreibung verfügbar'}`).join('\n\n')
      }\n\nDie Vorschläge stammen aus unserer Datenbank.`;
    }
    return response.content;
  } catch (error) {
    logService.error('Error formatting solutions with LISA:', error as Error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `Ich habe ${solutions.length} passende Lösungen gefunden:\n\n${
      solutions.map((s, idx) => `${idx + 1}. [${s.name || 'Unbenannt'}](${frontendUrl}/digital-atlas/digitale-solution/${s.id})`).join('\n')
    }\n\nDie Vorschläge stammen aus unserer Datenbank.`;
  }
}
