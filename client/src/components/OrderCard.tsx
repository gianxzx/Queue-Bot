import { type OrderResponse } from "@shared/routes";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Receipt,
  User,
  Hash
} from "lucide-react";

interface OrderCardProps {
  order: OrderResponse[0];
  index: number;
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
  noted: "text-blue-500 border-blue-500/30 bg-blue-500/5",
  processing: "text-purple-500 border-purple-500/30 bg-purple-500/5",
  done: "text-green-500 border-green-500/30 bg-green-500/5",
};

export function OrderCard({ order, index }: OrderCardProps) {
  const statusColor = statusColors[order.status.toLowerCase()] || statusColors.pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative group
        bg-card/40 backdrop-blur-md border border-border rounded-lg
        hover:border-primary/50 hover:bg-card/60
        transition-all duration-300 overflow-hidden
      `}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none" />

      <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        
        {/* Order Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className={`
              px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border
              ${statusColor}
            `}>
              {order.status}
            </span>
            <span className="text-muted-foreground text-xs font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {order.createdAt ? format(new Date(order.createdAt), "MMM d, HH:mm") : 'Just now'}
            </span>
          </div>

          <h3 className="text-xl font-display font-bold text-white tracking-wide">
            {order.food}
          </h3>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded">
              <Hash className="w-3 h-3 text-primary" />
              <span className="font-mono text-foreground">Qty: {order.qty}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded">
              <Receipt className="w-3 h-3 text-primary" />
              <span className="font-mono text-foreground">Bill: {order.totalBill}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded">
              <User className="w-3 h-3 text-primary" />
              <span className="font-mono text-foreground">{order.customerUsername}</span>
            </div>
          </div>
        </div>

        {/* Staff Info (Right Side) */}
        <div className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-border/30 w-full md:w-auto">
          <div className="text-right flex-1 md:flex-none">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-0.5">Handler</div>
            <div className="font-bold text-primary flex items-center justify-end gap-2">
              {order.staffUsername}
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-20" />
    </motion.div>
  );
}
