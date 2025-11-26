import type { NextApiRequest, NextApiResponse } from 'next';
import WebSocket from 'ws';

// Use environment variable or fall back to default
const VOICE_BASE_URL = process.env.SOVREN_VOICE_BASE_URL || process.env.SOVREN_VOICE_DEMO_URL || 'http://10.66.0.2:8500';
const VOICE_WS_URL = VOICE_BASE_URL.replace(/^http/, 'ws');

// Timeout configurations
const WEBSOCKET_CONNECT_TIMEOUT = 5000; // 5s to establish connection
const WEBSOCKET_RESPONSE_TIMEOUT = 30000; // 30s to receive response
const HEALTH_CHECK_TIMEOUT = 3000; // 3s for health check

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  diagnostics?: HealthDiagnostics;
}

interface VoiceDemoRequest {
  persona: string;
  text: string;
}

interface VoiceDemoResponse {
  replyText: string;
  replyAudioUrl: string;
  persona: string;
  timestamp: string;
}

interface HealthDiagnostics {
  backendReachable: boolean;
  backendStatus: string;
  backendVersion?: string;
  websocketAvailable: boolean;
  redisStatus?: string;
  databaseStatus?: string;
  aiServices?: Record<string, string>;
  timestamp: string;
}

interface WebSocketMessage {
  type: string;
  persona?: string;
  text?: string;
  replyText?: string;
  reply_text?: string;
  replyAudioUrl?: string;
  reply_audio_url?: string;
  audioUrl?: string;
  audio_url?: string;
  error?: string;
  message?: string;
}

// All valid personas including CTO
const VALID_PERSONAS = ['CEO', 'CFO', 'CTO', 'COO', 'CRO', 'CMO', 'Board'] as const;
type Persona = typeof VALID_PERSONAS[number];

/**
 * Validates that a string is a valid persona
 */
function isValidPersona(persona: string): persona is Persona {
  return VALID_PERSONAS.includes(persona as Persona);
}

/**
 * Performs comprehensive health check on the voice service backend
 */
async function performHealthCheck(): Promise<HealthDiagnostics> {
  const diagnostics: HealthDiagnostics = {
    backendReachable: false,
    backendStatus: 'unknown',
    websocketAvailable: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Test HTTP health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const healthResponse = await fetch(`${VOICE_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    diagnostics.backendReachable = true;

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      diagnostics.backendStatus = healthData.status || 'ok';
      diagnostics.backendVersion = healthData.version;
      diagnostics.redisStatus = healthData.redis;
      diagnostics.databaseStatus = healthData.database;
      diagnostics.aiServices = healthData.ai_services;
    } else {
      diagnostics.backendStatus = `error_${healthResponse.status}`;
    }

    // Test WebSocket availability
    const wsUrl = `${VOICE_WS_URL}/ws/voice`;
    diagnostics.websocketAvailable = await testWebSocketConnection(wsUrl);

  } catch (error) {
    diagnostics.backendReachable = false;
    diagnostics.backendStatus = error instanceof Error ? error.message : 'connection_failed';
  }

  return diagnostics;
}

/**
 * Tests if WebSocket connection can be established
 */
async function testWebSocketConnection(wsUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    let ws: WebSocket | null = null;
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (ws) {
          ws.close();
        }
        resolve(false);
      }
    }, WEBSOCKET_CONNECT_TIMEOUT);

    try {
      ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          ws?.close();
          resolve(true);
        }
      });

      ws.on('error', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      });
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    }
  });
}

/**
 * Sends a voice demo request via WebSocket and waits for response
 */
async function sendVoiceRequest(
  persona: Persona,
  text: string
): Promise<VoiceDemoResponse> {
  const wsUrl = `${VOICE_WS_URL}/ws/voice`;

  console.log(`[voice-demo] Connecting to WebSocket: ${wsUrl}`);
  console.log(`[voice-demo] Request: persona=${persona}, text="${text.substring(0, 50)}..."`);

  return new Promise((resolve, reject) => {
    let ws: WebSocket | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;
    let responseTimeout: NodeJS.Timeout | null = null;
    let resolved = false;

    const cleanup = () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      if (responseTimeout) clearTimeout(responseTimeout);
      if (ws) {
        ws.removeAllListeners();
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        ws = null;
      }
    };

    const resolveOnce = (result: VoiceDemoResponse) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(result);
      }
    };

    const rejectOnce = (error: Error) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(error);
      }
    };

    try {
      ws = new WebSocket(wsUrl);

      // Connection timeout
      connectionTimeout = setTimeout(() => {
        rejectOnce(new Error('WebSocket connection timeout - could not connect to voice service'));
      }, WEBSOCKET_CONNECT_TIMEOUT);

      ws.on('open', () => {
        console.log('[voice-demo] WebSocket connected');
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }

        // Set response timeout
        responseTimeout = setTimeout(() => {
          rejectOnce(new Error('Voice service response timeout - no response received within 30 seconds'));
        }, WEBSOCKET_RESPONSE_TIMEOUT);

        // Send the request
        const request = {
          type: 'voice_request',
          persona,
          text,
        };
        console.log('[voice-demo] Sending request:', request);
        ws?.send(JSON.stringify(request));
      });

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          console.log('[voice-demo] Received message type:', message.type);

          // Handle error responses
          if (message.type === 'error') {
            const errorMsg = message.error || message.message || 'Unknown error from voice service';
            console.error('[voice-demo] Error from backend:', errorMsg);
            rejectOnce(new Error(errorMsg));
            return;
          }

          // Handle successful response
          if (message.type === 'voice_response' || message.type === 'response') {
            // Extract text from various possible field names
            const replyText = message.replyText || message.reply_text || message.text || '';

            // Extract audio URL from various possible field names
            const replyAudioUrl =
              message.replyAudioUrl ||
              message.reply_audio_url ||
              message.audioUrl ||
              message.audio_url ||
              '';

            console.log('[voice-demo] Extracted replyText:', replyText?.substring(0, 50));
            console.log('[voice-demo] Extracted replyAudioUrl:', replyAudioUrl);

            // Validate response
            if (!replyText || replyText.trim() === '') {
              console.error('[voice-demo] No reply text in response:', message);
              rejectOnce(new Error('Voice service returned invalid response - missing reply text'));
              return;
            }

            if (!replyAudioUrl || replyAudioUrl.trim() === '') {
              console.error('[voice-demo] No audio URL in response:', message);
              rejectOnce(new Error('Voice service did not return audio URL - audio responses are required'));
              return;
            }

            // Success - return the response
            console.log('[voice-demo] Success - response complete');
            resolveOnce({
              replyText,
              replyAudioUrl,
              persona,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('[voice-demo] Failed to parse WebSocket message:', error);
          rejectOnce(new Error('Failed to parse voice service response'));
        }
      });

      ws.on('error', (error) => {
        console.error('[voice-demo] WebSocket error:', error);
        rejectOnce(new Error(`WebSocket error: ${error.message || 'Connection failed'}`));
      });

      ws.on('close', (code, reason) => {
        console.log(`[voice-demo] WebSocket closed: code=${code}, reason=${reason}`);
        if (!resolved) {
          rejectOnce(new Error('WebSocket connection closed unexpectedly'));
        }
      });

    } catch (error) {
      console.error('[voice-demo] Failed to create WebSocket:', error);
      rejectOnce(new Error('Failed to establish WebSocket connection'));
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<VoiceDemoResponse>>
) {
  // Health check endpoint
  if (req.method === 'GET') {
    console.log('[voice-demo] Health check requested');
    try {
      const diagnostics = await performHealthCheck();

      const isHealthy =
        diagnostics.backendReachable &&
        diagnostics.websocketAvailable &&
        diagnostics.backendStatus !== 'error';

      return res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        diagnostics,
        error: isHealthy ? undefined : 'Voice service is not fully operational',
      });
    } catch (error) {
      console.error('[voice-demo] Health check failed:', error);
      return res.status(503).json({
        success: false,
        error: 'Failed to perform health check',
        diagnostics: {
          backendReachable: false,
          backendStatus: 'error',
          websocketAvailable: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  // Only allow POST for voice requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Use POST for voice requests or GET for health check.`,
    });
  }

  try {
    const { persona, text } = req.body as VoiceDemoRequest;

    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      console.error('[voice-demo] Invalid request body:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body - expected JSON object with persona and text fields',
      });
    }

    // Validate required fields
    if (!persona || typeof persona !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid persona field - must be a non-empty string',
      });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid text field - must be a non-empty string',
      });
    }

    // Validate persona is one of the allowed types (including CTO)
    if (!isValidPersona(persona)) {
      return res.status(400).json({
        success: false,
        error: `Invalid persona "${persona}". Must be one of: ${VALID_PERSONAS.join(', ')}`,
      });
    }

    // Validate text length
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text message cannot be empty',
      });
    }

    if (trimmedText.length > 500) {
      return res.status(400).json({
        success: false,
        error: `Text message too long (${trimmedText.length} characters, max 500)`,
      });
    }

    console.log(`[voice-demo] Processing request - persona: ${persona}, text length: ${trimmedText.length}`);

    // Send request via WebSocket
    const responseData = await sendVoiceRequest(persona, trimmedText);

    console.log('[voice-demo] Successfully generated response');
    console.log(`[voice-demo] Reply text: "${responseData.replyText.substring(0, 100)}..."`);
    console.log(`[voice-demo] Audio URL: ${responseData.replyAudioUrl}`);

    // Return successful response
    return res.status(200).json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('[voice-demo] Request failed:', error);

    // Determine appropriate error response
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Connection errors
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        return res.status(504).json({
          success: false,
          error: 'Voice service timeout - the service took too long to respond. Please try again.',
        });
      }

      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection')) {
        return res.status(503).json({
          success: false,
          error: 'Voice service unavailable - cannot connect to backend service. Please contact support.',
        });
      }

      if (errorMessage.includes('WebSocket')) {
        return res.status(502).json({
          success: false,
          error: `Voice service communication error: ${errorMessage}`,
        });
      }

      // Validation or business logic errors
      if (errorMessage.includes('invalid') || errorMessage.includes('missing')) {
        return res.status(502).json({
          success: false,
          error: errorMessage,
        });
      }

      // Generic error with message
      return res.status(500).json({
        success: false,
        error: `Voice service error: ${errorMessage}`,
      });
    }

    // Unknown error
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your voice request. Please try again.',
    });
  }
}
