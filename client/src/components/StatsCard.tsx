import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  delay?: number;
}

export function StatsCard({ label, value, icon: Icon, colorClass, delay = 0 }: StatsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative overflow-hidden
        bg-card/30 backdrop-blur-sm border border-border rounded-xl p-6
        hover:bg-card/50 transition-colors duration-300
        group
      `}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass} opacity-80`} />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase mb-1">
            {label}
          </p>
          <h3 className={`text-4xl font-display font-bold ${colorClass.replace('bg-', 'text-')} drop-shadow-lg`}>
            {value}
          </h3>
        </div>
        <div className={`
          p-3 rounded-lg bg-background/50 border border-border
          ${colorClass.replace('bg-', 'text-')}
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
    </motion.div>
  );
}
