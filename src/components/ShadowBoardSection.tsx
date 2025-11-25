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
        <section className="bg-black text-white border-t border-slate-800/70 py-20 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Your executive branch. Named.
                    </h2>
                    <p className="text-xl text-gray-400">
                        Sovren drops a receptionist and 20 C-suite roles into your company.
                        Each seat has a name, a domain, and hard authority limits. When you
                        hear a decision, you know exactly which chair made it.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {SHADOW_ROLES.map((group) => (
                        <div
                            key={group.category}
                            className="flex flex-col rounded-lg p-8 transition-all hover:transform hover:scale-105 bg-gray-900/50 border border-gray-800"
                        >
                            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">
                                {group.category}
                            </h3>
                            <ul className="space-y-3">
                                {group.roles.map((role) => (
                                    <li key={role.code} className="flex items-baseline gap-3">
                                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-100 ring-1 ring-slate-700/80 min-w-[3.5rem] text-center">
                                            {role.code}
                                        </span>
                                        <span className="text-slate-300 text-sm">{role.name}</span>
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
