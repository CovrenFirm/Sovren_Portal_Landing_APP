import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

const OrbitalBackground = dynamic(
  () => import('@/components/3d/OrbitalBackground'),
  { ssr: false }
);

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

      <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
        <OrbitalBackground />

        {/* Dark overlay for readability */}
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 pointer-events-none z-0" />

        {/* Header */}
        <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold tracking-tight">
                  SOVREN <span className="text-indigo-400">AI</span>
                </h1>
                <span className="text-sm text-gray-500 hidden sm:inline">|</span>
                <span className="text-sm text-gray-400 hidden sm:inline tracking-wide uppercase">Voice Demo</span>
              </div>

              <div className="flex items-center space-x-4">
                {mounted && isAuthenticated && user ? (
                  <>
                    <div className="hidden sm:flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-200 font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-indigo-400 uppercase tracking-wider">{user.tier} Tier</p>
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
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
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
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              See Sovren in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Action</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Talk to an AI executive, watch how it responds, and hear how Sovren sounds in your ear.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Suggested Prompts Card */}
              <div className="group relative p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 backdrop-blur-md overflow-hidden transition-all hover:border-indigo-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h2 className="relative z-10 text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                  Suggested Prompts
                </h2>
                <div className="relative z-10 space-y-3">
                  {[
                    { role: 'CEO', text: "What should we focus on next quarter?" },
                    { role: 'CFO', text: "Where are we overexposed financially?" },
                    { role: 'COO', text: "What's blocking execution this week?" },
                    { role: 'CRO', text: "How can we accelerate pipeline growth?" }
                  ].map((prompt, i) => (
                    <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-3 hover:bg-indigo-900/20 hover:border-indigo-500/30 transition-colors cursor-pointer">
                      <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Ask the {prompt.role}:</p>
                      <p className="text-sm text-gray-300 italic">"{prompt.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works Card */}
              <div className="group relative p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 backdrop-blur-md overflow-hidden">
                <h2 className="relative z-10 text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-500 rounded-full" />
                  How It Works
                </h2>
                <div className="relative z-10 space-y-4">
                  {[
                    { step: 1, title: 'Select a Persona', desc: 'Choose from CEO, CFO, CRO, COO, CMO, or Board' },
                    { step: 2, title: 'Start Speaking', desc: 'Click the microphone and speak your question' },
                    { step: 3, title: 'Get AI Response', desc: 'Receive intelligent audio and text replies' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                        <span className="text-indigo-400 font-bold text-sm">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-bold">{item.title}</h3>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capabilities Card */}
              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Persona Capabilities
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {[
                    { role: 'CEO', desc: 'Strategic vision and leadership' },
                    { role: 'CFO', desc: 'Financial analysis and planning' },
                    { role: 'CRO', desc: 'Revenue growth strategies' },
                    { role: 'COO', desc: 'Operations optimization' },
                    { role: 'CMO', desc: 'Marketing and brand strategy' },
                    { role: 'Board', desc: 'Governance and oversight' }
                  ].map((item) => (
                    <li key={item.role} className="flex items-start">
                      <span className="text-indigo-400 mr-2">•</span>
                      <span><strong className="text-white">{item.role}:</strong> {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!isAuthenticated && mounted && (
                <div className="relative p-6 rounded-2xl bg-yellow-900/10 border border-yellow-500/30 backdrop-blur-md">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Limited Demo Mode
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    You're using the demo in guest mode. Sign up for full access to:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    {['Unlimited conversations', 'Conversation history', 'Advanced AI features'].map((feat, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl text-center font-bold transition-all shadow-lg shadow-yellow-900/20"
                  >
                    Sign Up Now
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column - Voice Console */}
            <div className="lg:col-span-2">
              {mounted ? (
                <div className="h-full min-h-[600px] rounded-3xl overflow-hidden border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.15)] bg-black/40 backdrop-blur-xl">
                  <VoiceConsole className="h-full" />
                </div>
              ) : (
                <div className="h-full min-h-[600px] rounded-3xl border border-indigo-500/30 bg-black/40 backdrop-blur-xl flex items-center justify-center">
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
            <div className="mt-12 relative overflow-hidden rounded-3xl border border-indigo-500/50 bg-indigo-950/30 p-12 text-center backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10" />
              <h2 className="relative z-10 text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready for the Full Experience?
              </h2>
              <p className="relative z-10 text-indigo-200 mb-8 max-w-2xl mx-auto text-lg">
                Start your 72-hour trial and unlock full access to Sovren AI's executive intelligence platform.
              </p>
              <Link
                href="/signup"
                className="relative z-10 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.4)]"
              >
                Start 72-Hour Trial
              </Link>
            </div>
          )}

          {/* Browser Compatibility Notice */}
          <div className="mt-8 bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-bold text-gray-200">Browser Compatibility</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Voice recognition works best in Chrome, Edge, and Safari. Make sure to allow microphone access when prompted.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 mt-12 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; 2025 Sovren AI. Powered by advanced AI technology.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
