import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { CRMActivity } from '@/lib/crmApi';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedItemProps {
    activity: CRMActivity;
    index: number;
}

export function ActivityFeedItem({ activity, index }: ActivityFeedItemProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'email': return Mail;
            case 'call': return Phone;
            case 'meeting': return Calendar;
            case 'note': return FileText;
            default: return Activity;
        }
    };

    const Icon = getIcon(activity.type);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
            <div className="mt-1">
                <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                    <Icon size={16} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">
                        {activity.subject}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {activity.description}
                </p>
            </div>
        </motion.div>
    );
}
