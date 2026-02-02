import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { startBot } from "./bot";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start the Discord Bot
  startBot();

  // API Routes
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get(api.orders.getStats.path, async (req, res) => {
    const orders = await storage.getOrders();
    const active = orders.filter(o => o.status !== 'done').length;
    const completed = orders.filter(o => o.status === 'done').length;
    res.json({
      totalOrders: orders.length,
      activeOrders: active,
      completedOrders: completed
    });
  });

  return httpServer;
}
