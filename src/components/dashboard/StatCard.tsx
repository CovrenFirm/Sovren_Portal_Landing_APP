import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: 'indigo' | 'purple' | 'blue' | 'emerald';
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    delay?: number;
}

export function StatCard({ title, value, icon: Icon, color, trend, delay = 0 }: StatCardProps) {
    const colors = {
        indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
        blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
        emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={clsx(
                'relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm bg-gradient-to-br',
                colors[color]
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={clsx('p-2 rounded-lg bg-white/5', `text-${color}-400`)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={clsx(
                        'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                        trend.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    )}>
                        <span>{trend.positive ? '+' : ''}{trend.value}%</span>
                    </div>
                )}
            </div>

            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-400">{title}</p>

            {trend && (
                <p className="text-xs text-gray-500 mt-2">{trend.label}</p>
            )}
        </motion.div>
    );
}
