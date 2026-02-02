import { useOrders, useOrderStats } from "@/hooks/use-orders";
import { OrderCard } from "@/components/OrderCard";
import { StatsCard } from "@/components/StatsCard";
import { 
  Activity, 
  CheckCircle2, 
  ListOrdered, 
  RefreshCw,
  Terminal
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: orders, isLoading, refetch, isRefetching } = useOrders();
  const { data: stats } = useOrderStats();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 lg:p-12 relative">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,18,23,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,23,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-20 z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/40 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-primary animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                EYWA<span className="text-primary">.NET</span>
              </h1>
            </div>
            <p className="text-muted-foreground font-mono tracking-widest text-sm uppercase">
              System Dashboard /// Status: <span className="text-green-500">Online</span>
            </p>
          </div>

          <Button 
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground font-mono group"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
            {isRefetching ? 'SYNCING...' : 'REFRESH_DATA'}
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            label="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ListOrdered}
            colorClass="bg-blue-500"
            delay={0.1}
          />
          <StatsCard 
            label="Active Queue"
            value={stats?.activeOrders || 0}
            icon={Activity}
            colorClass="bg-purple-500"
            delay={0.2}
          />
          <StatsCard 
            label="Completed"
            value={stats?.completedOrders || 0}
            icon={CheckCircle2}
            colorClass="bg-green-500"
            delay={0.3}
          />
        </div>

        {/* Active Orders List */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
            <h2 className="text-2xl font-display font-bold text-foreground tracking-wide">
              Active Transmission Stream
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          {isLoading ? (
            <div className="grid gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card/20 rounded-lg border border-white/5" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="grid gap-4">
              {orders.map((order, idx) => (
                <OrderCard key={order.id} order={order} index={idx} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center border border-dashed border-border/50 rounded-xl bg-card/10"
            >
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 text-primary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display text-muted-foreground">No Active Orders</h3>
              <p className="text-sm font-mono text-muted-foreground/60 mt-2">The queue is currently clear.</p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
