# EYWA.NET Order Queue Dashboard

## Overview

This is a full-stack order management system for a food service operation. The application consists of a Discord bot that allows staff to add and manage orders via slash commands, paired with a web dashboard that displays real-time order statistics and queue status. The system is designed with a cyberpunk/neon visual theme and automatically syncs data between Discord interactions and the web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state with 10-second auto-refresh intervals
- **Styling**: Tailwind CSS with custom cyberpunk theme variables and shadcn/ui component library
- **Animations**: Framer Motion for smooth list and card transitions
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Discord Integration**: discord.js v14 with slash commands for order management
- **Development**: Vite middleware for HMR in development mode

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: shared/schema.ts (orders table with customer info, food items, payment, status tracking)
- **Migrations**: drizzle-kit with migrations output to ./migrations directory

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Type Safety**: Shared types between frontend and backend via @shared imports
- **API Contract**: Routes and response schemas defined once in shared/routes.ts, used by both client and server

### Discord Bot Features
- Slash commands for adding orders (/add-queue)
- Staff role verification (specific role IDs required)
- Order status updates via select menus
- Queue channel for order message tracking

## External Dependencies

### Database
- PostgreSQL (connection via DATABASE_URL environment variable)
- Drizzle ORM for type-safe queries
- connect-pg-simple for session storage capability

### Discord Integration
- discord.js v14 for bot functionality
- @discordjs/rest for API interactions
- Bot token required via environment variable
- Configured for specific guild, channel, and role IDs

### UI Component Library
- shadcn/ui (new-york style) with Radix UI primitives
- Full component suite including dialogs, dropdowns, forms, toasts
- Custom theme with CSS variables for cyberpunk aesthetic

### Key NPM Packages
- @tanstack/react-query: Server state management
- framer-motion: Animation library
- date-fns: Date formatting
- zod: Schema validation
- drizzle-orm + drizzle-kit: Database ORM and migrations
- wouter: Client-side routing