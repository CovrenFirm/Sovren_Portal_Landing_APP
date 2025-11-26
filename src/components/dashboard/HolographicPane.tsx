import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { ReactNode } from 'react';

interface HolographicPaneProps {
    children: ReactNode;
    className?: string;
    title?: string;
    glowColor?: 'indigo' | 'cyan' | 'rose' | 'amber';
    delay?: number;
}

export function HolographicPane({
    children,
    className,
    title,
    glowColor = 'indigo',
    delay = 0
}: HolographicPaneProps) {

    const glowStyles = {
        indigo: 'border-indigo-500/30 shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)]',
        cyan: 'border-cyan-500/30 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]',
        rose: 'border-rose-500/30 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]',
        amber: 'border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]',
    };

    const titleStyles = {
        indigo: 'text-indigo-400',
        cyan: 'text-cyan-400',
        rose: 'text-rose-400',
        amber: 'text-amber-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            transition={{
                duration: 0.8,
                delay,
                type: "spring",
                stiffness: 50
            }}
            className={cn(
                "relative overflow-hidden rounded-xl border backdrop-blur-xl bg-gray-950/40",
                "transform-gpu transition-all duration-300 hover:bg-gray-950/50",
                glowStyles[glowColor],
                className
            )}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
        >
            {/* Scanline Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/scanlines.png')] bg-repeat mix-blend-overlay" />

            {/* Prismatic Edge Highlight */}
            <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-br from-white/10 via-transparent to-black/20" />

            {/* Header / HUD Line */}
            {title && (
                <div className="relative px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className={cn("text-sm font-bold uppercase tracking-widest", titleStyles[glowColor])}>
                        {title}
                    </h3>
                    <div className="flex space-x-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", `bg-${glowColor}-500`)} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative p-6">
                {children}
            </div>

            {/* Corner Accents (HUD style) */}
            <div className={cn("absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-md opacity-50", `border-${glowColor}-500`)} />
            <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-md opacity-50", `border-${glowColor}-500`)} />
        </motion.div>
    );
}
