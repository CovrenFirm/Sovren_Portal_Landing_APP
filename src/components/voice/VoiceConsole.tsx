'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useSceneStore, ScenePhase } from '@/state/sceneStore';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  error?: boolean;
}

interface VoiceConsoleProps {
  className?: string;
}

interface VoiceAPIResponse {
  success?: boolean;
  data?: {
    replyText?: string;
    reply_text?: string;
    replyAudioUrl?: string;
    reply_audio_url?: string;
  };
  replyText?: string;
  reply_text?: string;
  replyAudioUrl?: string;
  reply_audio_url?: string;
  error?: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted' | 'service-not-allowed' | string;
  message?: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Personas mapped to 3D executive roles (first 7 in AntigravityCore executiveRoles)
const PERSONAS = ['CEO', 'CFO', 'CTO', 'COO', 'CRO', 'CMO', 'Board'] as const;

// Color mapping for console to match 3D tier colors
const PERSONA_COLORS: Record<string, string> = {
  'CEO': 'hsl(30, 90%, 60%)',    // Warm orange (inner ring)
  'CFO': 'hsl(45, 90%, 60%)',    // Amber
  'CTO': 'hsl(60, 90%, 60%)',    // Yellow
  'COO': 'hsl(75, 90%, 60%)',    // Yellow-green
  'CRO': 'hsl(90, 90%, 60%)',    // Green-yellow
  'CMO': 'hsl(105, 90%, 60%)',   // Green
  'Board': 'hsl(120, 90%, 60%)', // Green
};

const ERROR_MESSAGES = {
  'no-speech': 'No speech detected. Please try again and speak clearly.',
  'audio-capture': 'Unable to capture audio. Check your microphone.',
  'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
  'network': 'Network error during speech recognition. Check your connection.',
  'aborted': 'Speech recognition was aborted.',
  'service-not-allowed': 'Speech recognition service not allowed.',
  'voice-service-unavailable': 'Voice service is temporarily unavailable. Please try again.',
  'no-audio-response': 'Voice service did not return audio. Audio responses are required.',
  'audio-playback-failed': 'Failed to play audio response. Check your browser audio settings.',
  'generic': 'An unexpected error occurred. Please try again.',
} as const;

const AUDIO_FETCH_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VoiceConsole({ className }: VoiceConsoleProps) {
  // ========================================
  // STATE
  // ========================================
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasSpeechAPI, setHasSpeechAPI] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // ========================================
  // REFS
  // ========================================
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ========================================
  // STORE
  // ========================================
  const { selectedExecutive, phase, setSelectedExecutive, setPhase } = useSceneStore();

  // ========================================
  // AUTO-SCROLL
  // ========================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ========================================
  // SPEECH RECOGNITION SETUP
  // ========================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for Speech Recognition API
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechAPI(false);
      return;
    }

    setHasSpeechAPI(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Handle recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;

        setTranscript(transcriptText);

        // Only process final results
        if (result.isFinal) {
          handleUserMessage(transcriptText);
          setTranscript('');
        }
      };

      // Handle recognition errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setPhase('idle');

        const errorMessage = ERROR_MESSAGES[event.error as keyof typeof ERROR_MESSAGES] ||
                             ERROR_MESSAGES['generic'];
        setError(errorMessage);
      };

      // Handle recognition end
      recognition.onend = () => {
        setIsListening(false);
        // Only reset phase if we're not processing
        if (phase === 'listening' && !isProcessing) {
          setPhase('idle');
        }
      };

      // Handle recognition start
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setHasSpeechAPI(false);
      setError('Failed to initialize speech recognition.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run once on mount

  // ========================================
  // TOGGLE LISTENING
  // ========================================
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available.');
      return;
    }

    setError(null);

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setPhase('idle');
      } catch (err) {
        console.error('Failed to stop recognition:', err);
        setIsListening(false);
        setPhase('idle');
      }
    } else {
      try {
        recognitionRef.current.start();
        setPhase('listening');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start microphone. Please check permissions and try again.');
        setIsListening(false);
        setPhase('idle');
      }
    }
  }, [isListening, setPhase]);

  // ========================================
  // FETCH VOICE RESPONSE WITH TIMEOUT
  // ========================================
  const fetchVoiceResponse = useCallback(async (content: string, persona: string): Promise<VoiceAPIResponse> => {
    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), AUDIO_FETCH_TIMEOUT);

    try {
      setIsFetchingAudio(true);

      const response = await fetch('/api/voice-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          text: content,
        }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Voice service error (${response.status})`);
      }

      const result: VoiceAPIResponse = await response.json();
      return result;

    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out. The voice service is taking too long to respond.');
      }

      throw err;
    } finally {
      setIsFetchingAudio(false);
      abortControllerRef.current = null;
    }
  }, []);

  // ========================================
  // PLAY AUDIO WITH ERROR HANDLING
  // ========================================
  const playAudio = useCallback(async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Clean up any existing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Set audio properties
        audio.preload = 'auto';
        audio.volume = 1.0;

        setIsPlayingAudio(true);
        setPhase('responding');

        // Handle successful audio end
        audio.onended = () => {
          setIsPlayingAudio(false);
          setPhase('idle');
          audioRef.current = null;
          resolve();
        };

        // Handle audio loading errors
        audio.onerror = (e) => {
          setIsPlayingAudio(false);
          setPhase('idle');
          audioRef.current = null;
          console.error('Audio playback error:', e);
          reject(new Error(ERROR_MESSAGES['audio-playback-failed']));
        };

        // Handle canplay event to ensure audio is ready
        audio.oncanplay = () => {
          console.log('Audio ready to play');
        };

        // Attempt to play
        audio.play().catch((err) => {
          setIsPlayingAudio(false);
          setPhase('idle');
          audioRef.current = null;
          console.error('Audio play failed:', err);
          reject(new Error(ERROR_MESSAGES['audio-playback-failed']));
        });

      } catch (err) {
        setIsPlayingAudio(false);
        setPhase('idle');
        audioRef.current = null;
        reject(err);
      }
    });
  }, [setPhase]);

  // ========================================
  // HANDLE USER MESSAGE
  // ========================================
  const handleUserMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    if (isProcessing) return;

    setError(null);
    setRetryCount(0);

    const userMsg: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setPhase('thinking');

    let currentRetry = 0;

    while (currentRetry <= MAX_RETRIES) {
      try {
        // Fetch voice response
        const result = await fetchVoiceResponse(content, selectedExecutive || 'CEO');

        // Handle both wrapped and unwrapped responses
        const data = result.success ? result.data : result;

        // Extract text and audio with fallback field names
        const replyText = data?.replyText || data?.reply_text;
        const audioUrl = data?.replyAudioUrl || data?.reply_audio_url;

        // Validate response
        if (!replyText) {
          throw new Error('Voice service returned no reply text');
        }

        if (!audioUrl) {
          throw new Error(ERROR_MESSAGES['no-audio-response']);
        }

        // Create assistant message
        const assistantMsg: Message = {
          role: 'assistant',
          content: replyText,
          timestamp: new Date(),
          audioUrl: audioUrl,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Play audio response
        try {
          await playAudio(audioUrl);
        } catch (audioErr) {
          console.error('Audio playback failed:', audioErr);
          setError(audioErr instanceof Error ? audioErr.message : ERROR_MESSAGES['audio-playback-failed']);
          // Don't retry on audio playback failure - the text is already shown
        }

        // Success - exit retry loop
        break;

      } catch (err) {
        console.error(`Voice demo error (attempt ${currentRetry + 1}/${MAX_RETRIES + 1}):`, err);

        currentRetry++;
        setRetryCount(currentRetry);

        if (currentRetry > MAX_RETRIES) {
          // Max retries reached
          const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES['voice-service-unavailable'];
          setError(errorMessage);

          // Add error message to chat
          const errorMsg: Message = {
            role: 'assistant',
            content: `Error: ${errorMessage}`,
            timestamp: new Date(),
            error: true,
          };
          setMessages((prev) => [...prev, errorMsg]);

          setPhase('idle');
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry - 1)));
        }
      }
    }

    setIsProcessing(false);
    if (!isPlayingAudio) {
      setPhase('idle');
    }
  }, [isProcessing, selectedExecutive, fetchVoiceResponse, playAudio, setPhase]);

  // ========================================
  // TEXT INPUT SUBMIT
  // ========================================
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing && !isPlayingAudio) {
      handleUserMessage(textInput);
      setTextInput('');
    }
  }, [textInput, isProcessing, isPlayingAudio, handleUserMessage]);

  // ========================================
  // PERSONA CHANGE
  // ========================================
  const handlePersonaChange = useCallback((persona: string) => {
    if (!isProcessing && !isPlayingAudio) {
      setSelectedExecutive(persona);
      setError(null);
    }
  }, [isProcessing, isPlayingAudio, setSelectedExecutive]);

  // ========================================
  // PHASE INDICATOR
  // ========================================
  const getPhaseIndicator = (currentPhase: ScenePhase) => {
    switch (currentPhase) {
      case 'idle':
        return {
          color: 'bg-green-500',
          animation: '',
          label: 'Ready',
          icon: '●',
        };
      case 'listening':
        return {
          color: 'bg-blue-500',
          animation: 'animate-pulse',
          label: 'Listening',
          icon: '◉',
        };
      case 'thinking':
        return {
          color: 'bg-yellow-500',
          animation: 'animate-pulse',
          label: 'Processing',
          icon: '◐',
        };
      case 'responding':
        return {
          color: 'bg-indigo-500',
          animation: 'animate-pulse',
          label: 'Speaking',
          icon: '◎',
        };
      default:
        return {
          color: 'bg-gray-500',
          animation: '',
          label: 'Unknown',
          icon: '○',
        };
    }
  };

  const phaseIndicator = getPhaseIndicator(phase);

  // Get persona color
  const personaColor = PERSONA_COLORS[selectedExecutive || 'CEO'] || PERSONA_COLORS['CEO'];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div
      className={cn(
        'relative bg-black/90 backdrop-blur-xl border-2 rounded-lg shadow-2xl',
        'transition-all duration-300',
        phase === 'listening' && 'border-blue-400 shadow-blue-500/40',
        phase === 'thinking' && 'border-purple-400 shadow-purple-500/40',
        phase === 'responding' && 'border-green-400 shadow-green-500/40',
        phase === 'idle' && 'border-gray-700 shadow-gray-900/20',
        className
      )}
      style={{
        background: 'linear-gradient(145deg, rgba(0,0,0,0.95) 0%, rgba(15,15,25,0.95) 100%)'
      }}
    >
      {/* Corner accent indicators */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-indigo-500/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-indigo-500/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-indigo-500/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-indigo-500/50" />

      <div className="p-5">
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('w-2 h-2 rounded-full transition-all duration-300', phaseIndicator.color, phaseIndicator.animation)}></div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Command Panel</h3>
            </div>
            <div className="text-xs font-mono text-gray-600">Talk to an AI Executive</div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 bg-gray-900/50 rounded border border-gray-800">
            <span className={cn('transition-colors text-lg', phaseIndicator.color.replace('bg-', 'text-'))}>
              {phaseIndicator.icon}
            </span>
            <span className="text-gray-400 uppercase">{phaseIndicator.label}</span>
          </div>
        </div>

      {/* ==================== PERSONA SELECTOR ==================== */}
      <div className="mb-5">
        <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider font-mono">Active Executive</label>
        <div className="flex flex-wrap gap-2">
          {PERSONAS.map((persona) => {
            const isActive = selectedExecutive === persona;
            const color = PERSONA_COLORS[persona];
            return (
              <button
                key={persona}
                onClick={() => handlePersonaChange(persona)}
                disabled={isProcessing || isPlayingAudio}
                className={cn(
                  'relative px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 uppercase tracking-wide',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
                  isActive
                    ? 'text-white scale-105 shadow-lg'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/70 border border-gray-800',
                  (isProcessing || isPlayingAudio) && 'opacity-50 cursor-not-allowed hover:scale-100'
                )}
                style={isActive ? {
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}40`,
                  border: `1px solid ${color}`
                } : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-md animate-pulse" style={{
                    background: `linear-gradient(145deg, ${color}20, transparent)`,
                  }} />
                )}
                <span className="relative z-10">{persona}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== ERROR DISPLAY ==================== */}
      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-md text-xs text-red-300 animate-in fade-in font-mono">
          <div className="flex items-start gap-2">
            <span className="text-red-400 font-bold text-sm">⚠</span>
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        </div>
      )}

      {/* ==================== INPUT SECTION ==================== */}
      <div className="mb-4 space-y-3">
        {/* Text Input */}
        <form onSubmit={handleTextSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={hasSpeechAPI ? 'Type command...' : 'Type command...'}
              disabled={isProcessing || isPlayingAudio}
              className={cn(
                'flex-1 bg-black/60 border rounded-md px-3 py-2.5 text-xs text-white placeholder-gray-600 font-mono',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-all',
                phase === 'idle' ? 'border-gray-800 focus:ring-indigo-500/50' : 'border-gray-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <button
              type="submit"
              disabled={isProcessing || isPlayingAudio || !textInput.trim()}
              className={cn(
                'px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                textInput.trim() && !isProcessing && !isPlayingAudio
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-800 border border-gray-700'
              )}
            >
              Send
            </button>
          </div>
        </form>

        {/* Voice Input */}
        {hasSpeechAPI && (
          <div>
            <button
              onClick={toggleListening}
              disabled={isProcessing || isPlayingAudio}
              className={cn(
                'w-full py-3 rounded-md font-bold text-xs uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
                isListening
                  ? 'bg-red-600/90 hover:bg-red-600 focus:ring-red-500 animate-pulse shadow-lg shadow-red-500/40 border-2 border-red-400'
                  : 'bg-gray-900/80 hover:bg-gray-800 focus:ring-gray-700 border border-gray-700',
                (isProcessing || isPlayingAudio) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-base">{isListening ? '⏹' : '🎤'}</span>
              <span>{isListening ? 'Recording...' : 'Voice Command'}</span>
            </button>

            {/* Live Transcript */}
            {transcript && (
              <div className="mt-2 text-xs p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-md animate-in slide-in-from-top">
                <div className="flex items-start gap-2 font-mono">
                  <span className="text-blue-400 animate-pulse text-sm">◉</span>
                  <div className="flex-1 text-blue-200">"{transcript}"</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== TRANSCRIPT DISPLAY ==================== */}
      <div className="border border-gray-800 rounded-md p-3 bg-black/60 min-h-[180px] max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 text-xs py-6">
            <div className="text-2xl mb-2 opacity-30">⌘</div>
            <p className="font-mono uppercase tracking-wide">Awaiting Command</p>
            <p className="text-[10px] mt-1 text-gray-700">
              {hasSpeechAPI ? 'Voice or text input' : 'Text input only'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.slice(-3).map((msg, idx) => (
              <div
                key={messages.length - 3 + idx}
                className={cn(
                  'p-2.5 rounded border transition-all duration-200 text-xs',
                  msg.role === 'user'
                    ? 'bg-gray-900/50 text-gray-200 border-gray-800'
                    : msg.error
                    ? 'bg-red-950/30 text-red-300 border-red-900/50'
                    : 'border-gray-800'
                )}
                style={msg.role === 'assistant' && !msg.error ? {
                  backgroundColor: `${personaColor}10`,
                  borderColor: `${personaColor}30`
                } : undefined}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'text-[10px] font-bold uppercase tracking-wider font-mono',
                      msg.role === 'user' ? 'text-gray-500' : msg.error ? 'text-red-500' : 'text-gray-400'
                    )}
                      style={msg.role === 'assistant' && !msg.error ? { color: personaColor } : undefined}
                    >
                      {msg.role === 'user' ? 'YOU' : selectedExecutive}
                    </div>
                    {msg.audioUrl && (
                      <div className="text-[10px]" title="Audio">🔊</div>
                    )}
                  </div>
                  <div className="text-[9px] text-gray-600 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-[11px] leading-relaxed">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ==================== PROCESSING INDICATOR ==================== */}
      {(isProcessing || isFetchingAudio || isPlayingAudio) && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900/60 border border-gray-800 rounded-md text-[10px] font-mono uppercase tracking-wider">
            <span className={cn(
              'animate-pulse text-sm',
              phase === 'thinking' && 'text-purple-400',
              phase === 'responding' && 'text-green-400'
            )}>
              {isPlayingAudio ? '🔊' : phase === 'thinking' ? '◐' : '⚙'}
            </span>
            <span className="text-gray-400">
              {isPlayingAudio ? 'Audio Playback' :
               isFetchingAudio ? 'Fetching Response' :
               phase === 'thinking' ? 'Processing' :
               'Working'}
            </span>
            {retryCount > 0 && (
              <span className="text-yellow-500">Retry {retryCount}/{MAX_RETRIES}</span>
            )}
          </div>
        </div>
      )}

      {/* ==================== BROWSER COMPATIBILITY WARNING ==================== */}
      {!hasSpeechAPI && (
        <div className="mt-3 text-[10px] text-yellow-600 text-center p-2 bg-yellow-950/20 border border-yellow-900/40 rounded-md font-mono">
          <span>⚠ Voice input unavailable • Use Chrome/Edge for full experience</span>
        </div>
      )}
      </div>
    </div>
  );
}
