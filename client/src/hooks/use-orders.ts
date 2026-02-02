import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type OrderResponse } from "@shared/routes";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Auto-refresh every 10s as requested
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: [api.orders.getStats.path],
    queryFn: async () => {
      const res = await fetch(api.orders.getStats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.orders.getStats.responses[200].parse(await res.json());
    },
    refetchInterval: 10000,
  });
}
