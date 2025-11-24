'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';

const VoiceConsole = dynamic(
  () => import('@/components/voice/VoiceConsole').catch(err => {
    console.error('Failed to load VoiceConsole:', err);
    return { default: () => (
      <div className="bg-red-900/90 border border-red-700 rounded-lg p-4">
        <div className="text-red-300 text-sm">Voice Console unavailable</div>
      </div>
    )};
  }),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-4">
        <div className="text-slate-300 text-sm">Initializing Voice Console...</div>
      </div>
    )
  }
);

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [introFadingOut, setIntroFadingOut] = useState(false);

  useEffect(() => {
    // Start fade-out after 1 second
    const fadeTimer = setTimeout(() => {
      setIntroFadingOut(true);
    }, 1000);

    // Remove intro overlay after fade completes
    const removeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Sovren AI - Stop Running Your Company Alone</title>
        <meta
          name="description"
          content="AI-powered executive operating system. 21 AI executives handling strategy, operations, and execution. Start your 72-hour trial today."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Cinematic Intro Overlay */}
      {showIntro && (
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000',
            introFadingOut ? 'opacity-0' : 'opacity-100'
          )}
        >
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SOVREN
            </div>
            <div className="text-xl text-gray-400 tracking-widest">
              COMMAND YOUR FUTURE
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-black text-white">
        <section className="relative overflow-hidden bg-black text-white">
          {/* Cinematic glow background */}
          <div className="pointer-events-none absolute inset-x-[-40%] -top-64 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.45),_transparent_60%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.3),_transparent_55%)] opacity-60" />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pt-24 pb-20 lg:flex-row lg:items-center lg:gap-12 lg:pt-32">
            {/* LEFT COLUMN – TEXT */}
            <div className="lg:w-1/2">
              {/* Micro-pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-1 text-xs font-medium text-slate-100 ring-1 ring-slate-700/70">
                <span>AI Chief of Staff</span>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span>21-Executive Shadow Board</span>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span>Voice-First OS</span>
              </div>

              {/* H1 – controlled line breaks + tight leading */}
              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.9] tracking-tight text-white">
                <span className="block">Run your company</span>
                <span className="block">
                  from a{" "}
                  <span className="whitespace-nowrap bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                    black-ops
                  </span>
                </span>
                <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                  command console.
                </span>
              </h1>

              {/* Subhead */}
              <p className="mt-6 max-w-xl text-lg text-slate-200">
                One AI Chief of Staff, a 21-executive Shadow Board, and an AI Receptionist
                that answer calls, emails, and CRM for you — all on a sovereign, voice-first
                operating system.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Start 72-Hour Trial →
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                >
                  Watch Live Demo
                </Link>
              </div>

              {/* Trial disclaimer – FINAL TEXT */}
              <p className="mt-4 text-xs text-slate-400">
                Credit card required. A temporary $1 authorization hold will be placed to
                verify your card and then released. No subscription charges are captured
                during your 72-hour trial. Cancel anytime.
              </p>
            </div>

            {/* RIGHT COLUMN – SOVREN COMMAND STACK PANEL (NO 3D) */}
            <div className="mt-12 flex justify-center lg:mt-0 lg:w-1/2">
              <div className="relative w-full max-w-xl rounded-3xl border border-slate-700/80 bg-slate-950/80 p-5 shadow-[0_0_80px_rgba(129,140,248,0.65)] backdrop-blur-xl">
                {/* Top bar */}
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="font-semibold tracking-wide">SOVREN / COMMAND STACK</span>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[0.65rem] font-medium text-emerald-300 ring-1 ring-emerald-500/50">
                    LIVE EXECUTION
                  </span>
                </div>

                {/* Executive grid */}
                <div className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                    <span>Shadow Board</span>
                    <span>Active Channels</span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-200">
                    {[
                      "CEO",
                      "CFO",
                      "COO",
                      "CTO",
                      "CRO",
                      "CMO",
                      "CHRO",
                      "CLO",
                      "CIO",
                      "CSO",
                      "CDO",
                      "CISO",
                      "VP-Sales",
                      "VP-Mktg",
                      "VP-Ops",
                      "VP-Prod",
                      "VP-Legal",
                      "VP-HR",
                      "Dir-Sec",
                      "Dir-Risk",
                      "Dir-Compl",
                    ].map((role, idx) => (
                      <div
                        key={role}
                        className="group flex items-center gap-2 rounded-xl bg-slate-950/80 px-2 py-2 ring-1 ring-slate-700/70 hover:ring-indigo-400/80"
                      >
                        <div
                          className={`h-2.5 w-2.5 rounded-full shadow-[0_0_18px_rgba(129,140,248,0.9)] ${
                            idx < 3
                              ? "bg-amber-400"
                              : idx < 7
                              ? "bg-emerald-400"
                              : idx < 14
                              ? "bg-sky-400"
                              : "bg-fuchsia-400"
                          }`}
                        />
                        <span className="text-[0.7rem] font-medium text-slate-100 group-hover:text-white">
                          {role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity feed */}
                <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                    <span>Live command stream</span>
                    <span>Last 90 seconds</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <div>
                        <p className="text-[0.7rem] text-slate-300">
                          <span className="font-semibold text-emerald-300">CEO</span>{" "}
                          approved a pricing adjustment and pushed it to CRM + billing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <p className="text-[0.7rem] text-slate-300">
                        <span className="font-semibold text-sky-300">CFO</span>{" "}
                        recalculated runway with today&apos;s pipeline and flagged a
                        risk scenario.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                      <p className="text-[0.7rem] text-slate-300">
                        <span className="font-semibold text-fuchsia-300">COO</span>{" "}
                        rerouted low-value calls to the AI Receptionist and pushed only
                        3 escalations to you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Experience It Live
              </h2>
              <p className="text-xl text-gray-400">
                Talk to an AI executive right now. No signup required.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <VoiceConsole className="shadow-2xl shadow-indigo-500/20" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Built Different
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Not a chatbot. Not a CRM plugin. A complete executive operating system.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon="🤖"
                title="AI Receptionist"
                description="Handles all inbound calls with natural dialogue, routes to the right executive, and maintains context across every interaction."
              />
              <FeatureCard
                icon="👔"
                title="Executive Shadow Board"
                description="21 specialized AI executives with distinct personalities, expertise areas, and decision-making frameworks. They debate, advise, and execute."
              />
              <FeatureCard
                icon="📊"
                title="Sovereign CRM"
                description="Every call, email, decision, and interaction flows into a CRM you own and control. No vendor lock-in, no data hostage situations."
              />
              <FeatureCard
                icon="⚖️"
                title="Constitutional Governance"
                description="Set company-wide rules, policies, and constraints. Your AI executives operate within your governance framework, not theirs."
              />
              <FeatureCard
                icon="🔄"
                title="Multi-Channel Orchestration"
                description="Phone, email, calendar, CRM, and more. One unified system orchestrating all your company communications."
              />
              <FeatureCard
                icon="📈"
                title="Real-Time Analytics"
                description="Every conversation analyzed. Every decision tracked. Full visibility into what your AI executives are doing and why."
              />
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 px-6 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Sovren vs Everything Else
              </h2>
              <p className="text-xl text-gray-400">
                You have options. Here's why we're different.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <ComparisonCard
                title="vs Call Bots"
                subtitle="(Bland, Vapi, etc.)"
                points={[
                  'They do: Great single-purpose phone agents',
                  'They don\'t: Execute across channels, maintain strategic context, or integrate with your entire operation',
                  'Sovren: AI Receptionist PLUS 21-executive brain across all channels'
                ]}
              />
              <ComparisonCard
                title="vs Dev Toolkits"
                subtitle="(Twilio, OpenAI API, etc.)"
                points={[
                  'They do: Provide building blocks and APIs',
                  'They don\'t: Architect the system, manage state, or give you pre-built executives',
                  'Sovren: Pre-built operating system, not plumbing'
                ]}
              />
              <ComparisonCard
                title="vs CRM + AI"
                subtitle="(Salesforce Einstein, etc.)"
                points={[
                  'They do: Bolt AI onto existing CRM workflows',
                  'They don\'t: Voice-first execution or autonomous multi-executive orchestration',
                  'Sovren: The CRM + the brain + the execution engine'
                ]}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-950 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-400">
                Choose the plan that fits your scale. Start your 72-hour trial today.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <PricingCard
                tier="Solo Founder"
                price="$199"
                period="month"
                description="Perfect for solo founders and small teams"
                features={[
                  '1 AI Receptionist',
                  '2 C-Suite Executives (CEO, CFO)',
                  'Up to 500 inbound calls/month',
                  'Voice + Email + Calendar integration',
                  'Basic CRM with 1,000 contacts',
                  '2GB voice storage',
                  'Email support'
                ]}
              />
              <PricingCard
                tier="Professional"
                price="$349"
                period="month"
                featured
                description="For growing companies that need more firepower"
                features={[
                  'Everything in Solo, plus:',
                  '5 C-Suite Executives (CEO, CFO, CRO, CMO, COO)',
                  'Up to 1,500 inbound calls/month',
                  'Multi-user access (5 team members)',
                  'Advanced CRM with 10,000 contacts',
                  '10GB voice storage',
                  'Priority support',
                  'Custom executive personalities'
                ]}
              />
              <PricingCard
                tier="Business"
                price="$1,199"
                period="month"
                description="Full executive board for serious operations"
                features={[
                  'Everything in Professional, plus:',
                  '10 C-Suite Executives',
                  'Up to 5,000 inbound calls/month',
                  'Unlimited team members',
                  'Unlimited CRM contacts',
                  '50GB voice storage',
                  'Dedicated account manager',
                  'Custom integrations',
                  'White-glove onboarding'
                ]}
              />
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-400 mb-4">
                Need more than 10 executives or 5,000 calls/month?
              </p>
              <Link
                href="/contact"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Contact us for Enterprise pricing →
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop Being the Bottleneck
            </h2>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Your competitors are still drowning in emails and managing spreadsheets.
              You'll be commanding a 21-executive AI board while you sleep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-10 py-5 bg-white text-black hover:bg-gray-100 rounded-lg font-bold text-lg text-center transition-all transform hover:scale-105"
              >
                Start 72-Hour Trial →
              </Link>
              <Link
                href="/demo"
                className="px-10 py-5 border-2 border-white hover:bg-white hover:text-black rounded-lg font-bold text-lg text-center transition-all transform hover:scale-105"
              >
                See It in Action
              </Link>
            </div>
            <p className="text-sm text-gray-300 mt-6">
              Credit card required. A temporary $1 authorization hold will be placed to verify
              your card and then released. No subscription charges are captured during your
              72-hour trial. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-black border-t border-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  SOVREN
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sovereign, voice-first operating system for your business.
                  21 AI executives, one unified command center.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-gray-200">Product</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="hover:text-white transition-colors">
                      Demo
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/features" className="hover:text-white transition-colors">
                      Features
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-gray-200">Company</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:text-white transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-gray-200">Legal</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/security" className="hover:text-white transition-colors">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-500 text-sm">
                © 2025 Sovren AI. All rights reserved.
              </div>
              <div className="flex gap-6">
                <a
                  href="https://twitter.com/sovrenai"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/sovrenai"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/sovrenai"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Helper Components

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-indigo-500 transition-all hover:transform hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

interface ComparisonCardProps {
  title: string;
  subtitle: string;
  points: string[];
}

function ComparisonCard({ title, subtitle, points }: ComparisonCardProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-1 text-indigo-400">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <ul className="space-y-3">
        {points.map((point, idx) => (
          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
            <span className="text-indigo-400 flex-shrink-0 mt-1">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PricingCardProps {
  tier: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
}

function PricingCard({
  tier,
  price,
  period,
  description,
  features,
  featured = false,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-8 transition-all hover:transform hover:scale-105',
        featured
          ? 'bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/50 scale-105'
          : 'bg-gray-900/50 border border-gray-800'
      )}
    >
      {featured && (
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2 text-white">{tier}</h3>
      <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{description}</p>

      <div className="mb-6">
        <span className="text-5xl font-bold text-white">{price}</span>
        <span className="text-gray-400">/{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm">
            <svg
              className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className={cn(
          'block w-full py-4 rounded-lg font-bold text-center transition-all',
          featured
            ? 'bg-white text-black hover:bg-gray-100'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
        )}
      >
        Start 72-Hour Trial
      </Link>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Credit card required. Temporary $1 authorization hold only; no subscription charges during your 72-hour trial.
      </p>
    </div>
  );
}
