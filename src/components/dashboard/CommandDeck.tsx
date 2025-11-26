import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { NeuralCore } from '@/components/3d/NeuralCore';
import { HolographicPane } from '@/components/dashboard/HolographicPane';
import { motion } from 'framer-motion';
import { Activity, Users, DollarSign, Zap, Shield, Globe, Cpu, Radio } from 'lucide-react';

export default function CommandDeck() {
    return (
        <div className="relative w-full h-screen bg-gray-950 overflow-hidden text-white font-sans selection:bg-indigo-500/30">

            {/* 3D Background Layer */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={45} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

                    <NeuralCore />

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={0.5}
                        maxPolarAngle={Math.PI / 1.5}
                        minPolarAngle={Math.PI / 3}
                    />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* Vignette & Scanlines Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
            <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-[url('/scanlines.png')] bg-repeat" />

            {/* UI Layer */}
            <div className="relative z-20 w-full h-full flex flex-col p-6 pointer-events-none">

                {/* Top HUD Bar */}
                <header className="flex items-center justify-between mb-8 pointer-events-auto">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center backdrop-blur-md">
                            <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white">SOVREN<span className="text-indigo-500">.AI</span></h1>
                            <div className="flex items-center space-x-2 text-xs text-indigo-300/70 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>Neural Link Stable</span>
                                <span>::</span>
                                <span>Latency 12ms</span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex items-center space-x-6">
                        {['Command', 'Intelligence', 'Operations', 'Finance'].map((item, i) => (
                            <button key={item} className="group relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                {item}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </button>
                        ))}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white/20" />
                    </nav>
                </header>

                {/* Main Dashboard Grid */}
                <main className="flex-1 grid grid-cols-12 gap-6 pointer-events-auto">

                    {/* Left Column: Key Metrics */}
                    <div className="col-span-3 flex flex-col space-y-6">
                        <HolographicPane title="Total Revenue" glowColor="indigo" delay={0.1}>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-bold text-white">$4.2M</span>
                                <span className="text-sm text-green-400 flex items-center">
                                    <Activity className="w-3 h-3 mr-1" /> +12.5%
                                </span>
                            </div>
                            <div className="mt-4 h-16 w-full bg-indigo-900/20 rounded-lg overflow-hidden relative">
                                {/* Mock Chart Line */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <path d="M0,64 L20,50 L40,55 L60,30 L80,40 L100,20 L120,35 L140,10 L160,25 L180,5 L200,15 L220,0" fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    <path d="M0,64 L20,50 L40,55 L60,30 L80,40 L100,20 L120,35 L140,10 L160,25 L180,5 L200,15 L220,0 V64 H0 Z" fill="url(#gradient)" opacity="0.2" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </HolographicPane>

                        <HolographicPane title="Active Subscribers" glowColor="cyan" delay={0.2}>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-bold text-white">8,420</span>
                                <span className="text-sm text-green-400 flex items-center">
                                    <Users className="w-3 h-3 mr-1" /> +5.2%
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                <div className="flex justify-between mb-1">
                                    <span>Retention Rate</span>
                                    <span className="text-cyan-400">94%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1">
                                    <div className="bg-cyan-500 h-1 rounded-full" style={{ width: '94%' }} />
                                </div>
                            </div>
                        </HolographicPane>

                        <HolographicPane title="System Health" glowColor="rose" delay={0.3}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                    <div className="text-xs text-rose-300 uppercase">CPU Load</div>
                                    <div className="text-xl font-bold text-white">42%</div>
                                </div>
                                <div className="text-center p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                    <div className="text-xs text-rose-300 uppercase">Memory</div>
                                    <div className="text-xl font-bold text-white">6.4GB</div>
                                </div>
                            </div>
                        </HolographicPane>
                    </div>

                    {/* Center Column: The "Void" Viewport (Empty for now to show background) */}
                    <div className="col-span-6 flex flex-col justify-end pb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="text-center"
                        >
                            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/0 tracking-tighter mb-2">
                                COMMAND DECK
                            </h2>
                            <p className="text-indigo-300/60 text-sm uppercase tracking-[0.5em]">
                                Sovren Executive Intelligence System
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Column: Activity & Feeds */}
                    <div className="col-span-3 flex flex-col space-y-6">
                        <HolographicPane title="Live Neural Stream" glowColor="amber" delay={0.4} className="flex-1">
                            <div className="space-y-4">
                                {[
                                    { icon: Radio, text: "Incoming transmission from Tokyo HQ", time: "2s ago", color: "text-amber-400" },
                                    { icon: Shield, text: "Security protocol updated: Level 5", time: "45s ago", color: "text-green-400" },
                                    { icon: DollarSign, text: "Large transaction detected: $450k", time: "2m ago", color: "text-indigo-400" },
                                    { icon: Globe, text: "New regional node online: Singapore", time: "5m ago", color: "text-cyan-400" },
                                    { icon: Zap, text: "System optimization complete", time: "12m ago", color: "text-purple-400" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start space-x-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                                        <item.icon className={cn("w-4 h-4 mt-1", item.color)} />
                                        <div>
                                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.text}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </HolographicPane>

                        <HolographicPane title="Quick Protocols" glowColor="indigo" delay={0.5}>
                            <div className="grid grid-cols-2 gap-3">
                                {['Deploy Agent', 'Scan Network', 'Generate Report', 'System Purge'].map((action) => (
                                    <button key={action} className="px-3 py-2 text-xs font-bold text-indigo-300 border border-indigo-500/30 rounded hover:bg-indigo-500/20 hover:border-indigo-500 transition-all uppercase tracking-wider text-left">
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </HolographicPane>
                    </div>

                </main>
            </div>
        </div>
    );
}
