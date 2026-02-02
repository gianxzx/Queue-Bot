import { z } from 'zod';
import { insertOrderSchema, orders } from './schema';

export const api = {
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    getStats: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          totalOrders: z.number(),
          activeOrders: z.number(),
          completedOrders: z.number(),
        }),
      },
    }
  },
};

export type OrderResponse = z.infer<typeof api.orders.list.responses[200]>;
