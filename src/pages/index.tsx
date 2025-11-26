import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';
import ShadowBoardSection from '@/components/ShadowBoardSection';
import { useSubscription } from '@/hooks/useSubscription';

// Dynamically import OrbitalBackground with no SSR
const OrbitalBackground = dynamic(
  () => import('@/components/3d/OrbitalBackground'),
  { ssr: false }
);

const VoiceConsole = dynamic(() => import('@/components/voice/VoiceConsole'), {
  ssr: false,
});

// Feature Card Component
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative p-8 rounded-2xl bg-indigo-950/20 border border-indigo-500/40 backdrop-blur-sm transition-all duration-300 hover:bg-indigo-900/40 hover:border-indigo-400 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:-translate-y-1 overflow-hidden">
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Icon Container */}
      <div className="relative z-10 w-14 h-14 mb-6 rounded-xl bg-indigo-900/50 border border-indigo-500/50 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300">
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-200 transition-colors">{title}</h3>
        <p className="text-indigo-200/80 leading-relaxed text-sm font-medium group-hover:text-indigo-100 transition-colors">{description}</p>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// Comparison Card Component
interface ComparisonCardProps {
  title: string;
  subtitle: string;
  competitorDescription: string;
  sovrenDescription: string;
  features: { label: string; value: string }[];
}

function ComparisonCard({ title, subtitle, competitorDescription, sovrenDescription, features }: ComparisonCardProps) {
  return (
    <div className="group relative p-8 rounded-2xl bg-slate-900 border border-indigo-500 hover:bg-slate-900 hover:border-indigo-400 transition-all duration-500 hover:-translate-y-1 shadow-[0_0_30px_rgba(79,70,229,0.25)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800 group-hover:border-indigo-500/30 transition-colors">
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-100 transition-colors">{title}</h3>
        <div className="text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase opacity-80 group-hover:opacity-100 group-hover:text-indigo-300 transition-all">{subtitle}</div>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-6 mb-8">
        <div className="space-y-2 opacity-60 group-hover:opacity-40 transition-opacity">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">The Old Way</div>
          <p className="text-sm text-slate-200 leading-relaxed">{competitorDescription}</p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            The Sovren Way
          </div>
          <p className="text-sm text-white font-medium leading-relaxed group-hover:text-indigo-50 transition-colors">{sovrenDescription}</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 pt-6 border-t border-slate-800 group-hover:border-indigo-500/20 transition-colors">
        {features.map((feature, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">{feature.label}</span>
            <span className="text-white font-bold">{feature.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [introFadingOut, setIntroFadingOut] = useState(false);
  const { startTrial, isLoading } = useSubscription();

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
              SOVREN AI
            </div>
            <div className="text-xl text-gray-400 tracking-widest">
              COMMAND YOUR FUTURE
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
        <OrbitalBackground />

        <section className="relative overflow-hidden text-white">
          {/* Dark overlay for readability - Adjusted to prevent top truncation */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/90 z-0" />
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pt-24 pb-20 lg:pt-32">
            {/* HERO TEXT - Centered/Full Width */}
            <div className="max-w-4xl">
              <h1 className="mt-8 max-w-[20ch] text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.9] tracking-tight text-white">
                <span className="block">Run your company</span>
                <span className="block">
                  from a{" "}
                  <span className="bg-gradient-to-r from-[#FF6B6B] via-[#A06CD5] to-[#6C63FF] bg-clip-text text-transparent">
                    black-ops
                  </span>
                </span>
                <span className="block bg-gradient-to-r from-[#FF6B6B] via-[#A06CD5] to-[#6C63FF] bg-clip-text text-transparent">
                  command console.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-[1.05rem] sm:text-lg lg:text-xl leading-relaxed text-slate-200 drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]">
                One AI Chief of Staff, a 21-executive Shadow Board, and an AI Receptionist
                that handles inbound calls for your leadership, routes intelligently based on
                caller intent, transcribes voicemails into actions, captures leads directly
                into your CRM, and enforces business hours with after-hours handling — all on
                a sovereign, voice-first operating system.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => startTrial('SOLO')}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Start 72-Hour Trial →'}
                </button>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 transition-all hover:scale-105"
                >
                  Watch Live Demo
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Credit card required. A temporary $1 authorization hold will be placed to
                verify your card and then released. No subscription charges are captured
                during your 72-hour trial. Cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section - OPAQUE BACKGROUND */}
        <section className="relative z-10 py-24 px-6 bg-black border-t border-indigo-500/30">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">
                BUILT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 animate-pulse">DIFFERENT</span>
              </h2>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto font-medium border-l-4 border-indigo-500 pl-6 text-left md:text-center md:border-l-0 md:pl-0 drop-shadow-md">
                Not a chatbot. Not a CRM plugin. <br className="hidden md:block" />
                A complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 font-bold">executive operating system</span>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Shadow Board Section - OPAQUE BACKGROUND */}
        <div className="bg-black relative z-10">
          <ShadowBoardSection />
        </div>

        {/* Comparison Section - OPAQUE BACKGROUND & NO PURPLE SPOTLIGHT */}
        <section className="relative z-10 py-32 px-6 overflow-hidden bg-black">
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-8 text-white drop-shadow-2xl">
                WHY SOVREN AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">vs. EVERYTHING ELSE</span>
              </h2>
              <p className="text-2xl text-slate-100 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                The market offers tools. We offer an <span className="text-white font-bold border-b-4 border-indigo-500">outcome</span>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <ComparisonCard
                title="vs Voice APIs"
                subtitle="BLAND, VAPI, RETELL"
                competitorDescription="Programmable voice streams. Good for reading scripts, but they have no memory, no business context, and no authority."
                sovrenDescription="A fully autonomous executive that understands your entire business, remembers every client, and negotiates complex deals."
                features={[
                  { label: 'Context', value: 'Session Only' },
                  { label: 'Authority', value: 'None' },
                  { label: 'Setup', value: 'Weeks of Dev' }
                ]}
              />
              <ComparisonCard
                title="vs Chatbots"
                subtitle="INTERCOM, DRIFT"
                competitorDescription="Passive text trees waiting for input. They deflect tickets but cannot drive a conversation or close a sale."
                sovrenDescription="Proactive voice intelligence that picks up the phone, navigates gatekeepers, and drives revenue without you lifting a finger."
                features={[
                  { label: 'Medium', value: 'Text / Passive' },
                  { label: 'Goal', value: 'Deflection' },
                  { label: 'Revenue', value: 'Low Impact' }
                ]}
              />
              <ComparisonCard
                title="vs Human Staff"
                subtitle="EXECUTIVE TEAM"
                competitorDescription="Limited bandwidth. 8 hours/day. Inconsistent performance. Knowledge walks out the door when they churn."
                sovrenDescription="21 specialized executives working 24/7. Instant expertise. Perfect recall. Zero churn. Infinite scale."
                features={[
                  { label: 'Availability', value: '40 hrs/wk' },
                  { label: 'Cost', value: '$1.2M+/yr' },
                  { label: 'Scale', value: 'Linear' }
                ]}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section - OPAQUE BACKGROUND */}
        <section id="pricing" className="relative z-10 py-32 px-6 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-slate-400">
                Cancel anytime. No long-term contracts. Start your 72-hour trial today.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Solo Founder */}
              <div className="relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-600 transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">Solo Founder</h3>
                <p className="text-sm text-slate-400 mb-6">Perfect for solopreneurs and creators.</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-white">$199</span>
                  <span className="text-slate-500 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    1 Human User
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    1 AI Receptionist (Inbound calls)
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    1 AI Chief of Staff (Strategy)
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Basic CRM & Calendar integration
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Email support
                  </li>
                </ul>
                <button
                  onClick={() => startTrial('SOLO')}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Start 72-Hour Trial'}
                </button>
                <p className="mt-4 text-xs text-center text-slate-500">
                  Credit card required. Temporary $1 hold. No subscription charges during trial.
                </p>
              </div>

              {/* Professional - Highlighted */}
              <div className="relative p-8 rounded-3xl bg-indigo-950/40 border border-indigo-500/50 backdrop-blur-md shadow-2xl scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
                <p className="text-sm text-indigo-200 mb-6">For growing teams and small businesses.</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold text-white">$349</span>
                  <span className="text-indigo-200 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Up to 5 Human Users
                  </li>
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Everything in Solo Founder
                  </li>
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Full Shadow Board (21 AI Executives)
                  </li>
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Up to 1,000 inbound calls/month
                  </li>
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Advanced CRM (HubSpot/Salesforce)
                  </li>
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center text-white text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 text-xs">✓</span>
                    Custom executive governance
                  </li>
                </ul>
                <button
                  onClick={() => startTrial('PROFESSIONAL')}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Start 72-Hour Trial'}
                </button>
                <p className="mt-4 text-xs text-center text-indigo-300">
                  Credit card required. Temporary $1 hold. No subscription charges during trial.
                </p>
              </div>

              {/* Business */}
              <div className="relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-600 transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">Business</h3>
                <p className="text-sm text-slate-400 mb-6">For high-volume operations.</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-white">$1,199</span>
                  <span className="text-slate-500 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Up to 10 Human Users
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Everything in Professional
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Unlimited inbound calls
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Dedicated Account Manager
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    SLA Guarantees
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Custom API access
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-xs">✓</span>
                    Audit logs & security
                  </li>
                </ul>
                <button
                  onClick={() => startTrial('BUSINESS')}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Start 72-Hour Trial'}
                </button>
                <p className="mt-4 text-xs text-center text-slate-500">
                  Credit card required. Temporary $1 hold. No subscription charges during trial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - OPAQUE BACKGROUND */}
        <section className="relative z-10 py-24 px-6 overflow-hidden bg-black">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-black z-0" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Stop Being the Bottleneck
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Your competition is still hiring humans and managing spreadsheets. You'll be commanding a 21-executive AI board while you sleep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 rounded-full bg-white text-indigo-900 font-bold text-lg hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105">
                Start 72-Hour Trial →
              </button>
              <button className="px-8 py-4 rounded-full border border-indigo-400 text-indigo-100 font-bold text-lg hover:bg-indigo-900/50 transition-all hover:scale-105">
                See the Demo
              </button>
            </div>
            <p className="mt-6 text-sm text-indigo-300/60">
              Credit card required. A temporary $1 authorization hold will be placed to verify your card and then released. No subscription charges are captured during your 72-hour trial. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Footer - OPAQUE BACKGROUND */}
        <footer className="relative z-10 py-12 px-6 border-t border-slate-900 bg-black">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="text-2xl font-bold text-white mb-4">SOVREN</div>
              <p className="text-slate-500 max-w-sm">
                The first AI-native executive operating system. Stop running your company alone.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">Features</li>
                <li className="hover:text-white cursor-pointer">Pricing</li>
                <li className="hover:text-white cursor-pointer">Demo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
                <li className="hover:text-white cursor-pointer">Security</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-sm">
            © 2024 Sovren AI. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
