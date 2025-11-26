import { cn } from '@/lib/cn';

const SHADOW_ROLES = [
    {
        category: 'AI RECEPTIONIST',
        roles: [
            { code: 'RCPT', name: 'AI Receptionist' }
        ]
    },
    {
        category: 'Executive Leadership',
        roles: [
            { code: 'CEO', name: 'Chief Executive Officer' },
            { code: 'COO', name: 'Chief Operating Officer' },
            { code: 'CSO', name: 'Chief Strategy Officer' }
        ]
    },
    {
        category: 'Finance & Revenue',
        roles: [
            { code: 'CFO', name: 'Chief Financial Officer' },
            { code: 'CRO', name: 'Chief Revenue Officer' }
        ]
    },
    {
        category: 'Marketing & Sales',
        roles: [
            { code: 'CMO', name: 'Chief Marketing Officer' },
            { code: 'CCO', name: 'Chief Commercial Officer' },
            { code: 'CGO', name: 'Chief Growth Officer' }
        ]
    },
    {
        category: 'Technology & Innovation',
        roles: [
            { code: 'CTO', name: 'Chief Technology Officer' },
            { code: 'CDO', name: 'Chief Data Officer' },
            { code: 'CIO', name: 'Chief Innovation Officer' },
            { code: 'CAO', name: 'Chief Analytics Officer' }
        ]
    },
    {
        category: 'Product & Customer',
        roles: [
            { code: 'CPO', name: 'Chief Product Officer' },
            { code: 'CXO', name: 'Chief Experience Officer' }
        ]
    },
    {
        category: 'People & Culture',
        roles: [
            { code: 'CHRO', name: 'Chief Human Resources Officer' }
        ]
    },
    {
        category: 'Legal, Risk & Compliance',
        roles: [
            { code: 'CLO', name: 'Chief Legal Officer' },
            { code: 'CCmO', name: 'Chief Compliance Officer' },
            { code: 'CRiskO', name: 'Chief Risk Officer' },
            { code: 'CISO', name: 'Chief Information Security Officer' }
        ]
    },
    {
        category: 'Operations & Sustainability',
        roles: [
            { code: 'CSCO', name: 'Chief Supply Chain Officer' },
            { code: 'CSusO', name: 'Chief Sustainability Officer' }
        ]
    }
];

export default function ShadowBoardSection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden">
            {/* Background Spotlight - Intensified */}
            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight text-white">
                        YOUR EXECUTIVE BRANCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">NAMED</span>
                    </h2>
                    <p className="text-2xl text-slate-200 leading-relaxed font-light max-w-3xl mx-auto">
                        Sovren drops a receptionist and <span className="text-white font-semibold">20 C-suite roles</span> into your company.
                        Each seat has a name, a domain, and hard authority limits.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {SHADOW_ROLES.map((group) => (
                        <div
                            key={group.category}
                            className="group relative flex flex-col rounded-2xl p-8 transition-all duration-300 bg-zinc-900 border border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.25)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] hover:border-indigo-400 hover:-translate-y-1"
                        >
                            {/* Header with distinct background */}
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-indigo-600/40 to-transparent rounded-t-2xl" />

                            <h3 className="relative z-10 text-sm font-black uppercase tracking-[0.25em] text-indigo-300 mb-8 flex items-center gap-3">
                                {group.category}
                            </h3>

                            <ul className="relative z-10 space-y-5">
                                {group.roles.map((role) => (
                                    <li key={role.code} className="flex items-center gap-4 group/role">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500 blur-[4px] opacity-0 group-hover/role:opacity-50 transition-opacity" />
                                            <span className="relative flex items-center justify-center rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/20 min-w-[4rem] group-hover/role:ring-indigo-400 group-hover/role:bg-indigo-600 transition-all">
                                                {role.code}
                                            </span>
                                        </div>
                                        <span className="text-white text-base font-bold tracking-wide group-hover/role:text-indigo-100 transition-colors">{role.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
