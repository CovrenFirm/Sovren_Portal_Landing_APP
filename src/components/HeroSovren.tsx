import React from 'react';
import Link from 'next/link';

export default function HeroSovren() {
    return (
        <section className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pt-24 pb-20 lg:pt-32">
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
                    <Link
                        href="#pricing"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
                    >
                        Start 72-Hour Trial →
                    </Link>
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
        </section>
    );
}
