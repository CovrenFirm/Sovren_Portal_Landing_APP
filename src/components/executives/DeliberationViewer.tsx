import { useEffect, useRef, useState } from 'react';
import { Deliberation, DeliberationMessage } from '@/types/executives';
import { cn } from '@/lib/cn';
import WebSocketClient from '@/lib/websocket';

interface DeliberationViewerProps {
  deliberation: Deliberation;
  messages: DeliberationMessage[];
  wsClient?: WebSocketClient;
}

export default function DeliberationViewer({ deliberation, messages: initialMessages, wsClient }: DeliberationViewerProps) {
  const [messages, setMessages] = useState<DeliberationMessage[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wsClient) return;

    const handleNewMessage = (message: DeliberationMessage) => {
      if (message) {
        setMessages((prev) => [...prev, message]);
      }
    };

    wsClient.on(`deliberation:${deliberation.id}:message`, handleNewMessage);

    return () => {
      wsClient.off(`deliberation:${deliberation.id}:message`, handleNewMessage);
    };
  }, [wsClient, deliberation.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const statusConfig = {
    active: { label: 'Live', color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-500 animate-pulse' },
    completed: { label: 'Completed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-500' },
    awaiting_approval: { label: 'Awaiting Approval', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
  };

  const status = statusConfig[deliberation.status];

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{deliberation.topic}</h3>
          <div className={cn('px-3 py-1 rounded-full border text-xs font-medium', status.color)}>
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', status.dot)} />
              {status.label}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="flex flex-wrap gap-2">
          {deliberation.participants.map((participant) => (
            <div
              key={participant.executive_id}
              className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs"
            >
              <span className="text-blue-400 font-medium">{participant.name}</span>
              <span className="text-gray-500 ml-1">• {participant.role}</span>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <div>
            Started: <span className="text-gray-400">{new Date(deliberation.started_at).toLocaleString()}</span>
          </div>
          <div>
            Messages: <span className="text-gray-400">{deliberation.message_count}</span>
          </div>
        </div>
      </div>

      {/* Messages / Transcript */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-gray-950 scrollbar-thumb-gray-800"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Waiting for deliberation to begin...
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg border transition-all duration-200',
                message.sealed
                  ? 'bg-purple-500/5 border-purple-500/30'
                  : 'bg-gray-800/50 border-gray-700'
              )}
            >
              {/* Speaker Info */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {message.speaker_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{message.speaker_name}</div>
                    <div className="text-xs text-gray-500">{message.speaker_role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {message.sealed && (
                    <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-medium">
                      Sealed
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-gray-300 text-sm leading-relaxed pl-11">
                {message.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer - Live indicator */}
      {deliberation.status === 'active' && (
        <div className="border-t border-gray-800 p-3 bg-gray-900/80">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live updates enabled
          </div>
        </div>
      )}
    </div>
  );
}
