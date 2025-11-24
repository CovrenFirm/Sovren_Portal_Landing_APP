import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

// Dynamically import VoiceConsole to avoid SSR issues with speech recognition
const VoiceConsole = dynamic(
  () => import('@/components/voice/VoiceConsole'),
  { ssr: false }
);

export default function DemoPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Voice Demo - Sovren AI</title>
        <meta name="description" content="Try Sovren AI's executive voice interface" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Sovren AI
                </h1>
                <span className="text-sm text-gray-500 hidden sm:inline">|</span>
                <span className="text-sm text-gray-400 hidden sm:inline">Voice Demo</span>
              </div>

              <div className="flex items-center space-x-4">
                {mounted && isAuthenticated && user ? (
                  <>
                    <div className="hidden sm:flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.tier} Tier</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              See Sovren in Action
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Talk to an AI executive, watch how it responds, and hear how Sovren sounds in your ear.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Suggested Prompts
                </h2>
                <div className="space-y-3">
                  <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-3">
                    <p className="text-sm text-indigo-300 font-medium mb-1">Ask the CEO:</p>
                    <p className="text-sm text-gray-400">"What should we focus on next quarter?"</p>
                  </div>
                  <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-3">
                    <p className="text-sm text-indigo-300 font-medium mb-1">Ask the CFO:</p>
                    <p className="text-sm text-gray-400">"Where are we overexposed financially?"</p>
                  </div>
                  <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-3">
                    <p className="text-sm text-indigo-300 font-medium mb-1">Ask the COO:</p>
                    <p className="text-sm text-gray-400">"What's blocking execution this week?"</p>
                  </div>
                  <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-3">
                    <p className="text-sm text-indigo-300 font-medium mb-1">Ask the CRO:</p>
                    <p className="text-sm text-gray-400">"How can we accelerate pipeline growth?"</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  How It Works
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Experience conversations with AI-powered executive personas. Each persona has unique expertise and perspective.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-medium">Select a Persona</h3>
                      <p className="text-gray-500 text-xs mt-1">Choose from CEO, CFO, CRO, COO, CMO, or Board</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-medium">Start Speaking</h3>
                      <p className="text-gray-500 text-xs mt-1">Click the microphone and speak your question</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-400 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-medium">Get AI Response</h3>
                      <p className="text-gray-500 text-xs mt-1">Receive intelligent audio and text replies</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Persona Capabilities
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>CEO:</strong> Strategic vision and leadership</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>CFO:</strong> Financial analysis and planning</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>CRO:</strong> Revenue growth strategies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>COO:</strong> Operations optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>CMO:</strong> Marketing and brand strategy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-2">•</span>
                    <span><strong>Board:</strong> Governance and oversight</span>
                  </li>
                </ul>
              </div>

              {!isAuthenticated && mounted && (
                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    Limited Demo Mode
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    You're using the demo in guest mode. Sign up for full access to:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited conversations
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Conversation history
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Advanced AI features
                    </li>
                  </ul>
                  <Link
                    href="/signup"
                    className="block w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-center font-medium transition-colors"
                  >
                    Sign Up Now
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column - Voice Console */}
            <div className="lg:col-span-2">
              {mounted ? (
                <VoiceConsole className="h-full min-h-[600px]" />
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 h-full min-h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading voice interface...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          {!isAuthenticated && mounted && (
            <div className="mt-12 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-2xl p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready for the Full Experience?
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Start your 72-hour trial and unlock full access to Sovren AI's executive intelligence platform.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-lg transition-colors"
              >
                Start 72-Hour Trial
              </Link>
            </div>
          )}

          {/* Browser Compatibility Notice */}
          <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-300">Browser Compatibility</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Voice recognition works best in Chrome, Edge, and Safari. Make sure to allow microphone access when prompted.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; 2025 Sovren AI. Powered by advanced AI technology.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
