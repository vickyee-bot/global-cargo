# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## System Overview

**Global Cargo Shipping Management System** - A comprehensive maritime logistics management platform designed to facilitate, track, and optimize the shipping of cargo across continents via registered vessels. The system integrates multiple components of maritime cargo logistics—clients, cargo, ships, crew, and shipments—into a single solution that enhances operational efficiency, improves visibility, and supports business scalability.

**Project Date**: 15-JULY-2025  
**Type**: ICTA Internship Program Project No. 3

## Architecture Overview

This is a **full-stack maritime logistics management system** with the following architecture:

### Backend (`/backend`)
- **Framework**: Express.js (ES modules)
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: RESTful API with controller-route pattern
- **Authentication**: JWT-based with bcrypt password hashing
- **Main Entities**: Ships, Crew, Ports, Cargo, Clients, Shipments, Users
- **Key Files**:
  - `src/server.js` - Entry point
  - `src/app.js` - Express app setup with CORS and routes
  - `prisma/schema.prisma` - Database schema matching SQL specifications
  - Controllers in `src/controllers/` for each entity with full CRUD operations
  - Routes in `src/routes/` for each entity with authentication

### Frontend (`/frontend`)
- **Framework**: React + Vite + TypeScript
- **UI Library**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Authentication**: React Context with JWT storage
- **Routing**: React Router DOM with protected routes
- **Architecture**: Component-based with shared Layout and sidebar navigation
- **Key Features**: 
  - Real-time operational dashboard
  - Complete CRUD operations for all entities
  - Ship registration and tracking
  - Crew management with role assignments
  - Client and cargo management
  - Shipment scheduling and tracking
  - Advanced analytics and reporting

### Database Schema
The Prisma schema defines a maritime cargo management system with relationships between:
- **Ships** ↔ **Crew** (one-to-many)
- **Ships** ↔ **Shipments** (one-to-many)  
- **Ports** ↔ **Shipments** (origin/destination ports)
- **Cargo** ↔ **Clients** (many-to-one)
- **Cargo** ↔ **Shipments** (one-to-many)

## Development Commands

### Backend Development
```bash
cd backend
npm install
npm run dev          # Start development server (nodemon)
npm run seed         # Run database seed
```

### Frontend Development  
```bash
cd frontend
npm install
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Database Operations
```bash
cd backend
# Prisma commands
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database
npx prisma db pull      # Pull schema from database
npx prisma migrate dev  # Create and apply migration
npx prisma studio      # Open Prisma Studio
```

## Project Structure

```
global-cargo/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic for each entity
│   │   ├── routes/        # Express routes
│   │   ├── app.js         # Express app configuration
│   │   ├── server.js      # Server entry point
│   │   └── prisma.js      # Prisma client instance
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.js        # Database seeding
│   │   └── migrations/    # Database migrations
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/           # shadcn/ui components
    │   │   ├── forms/        # Form components
    │   │   ├── common/       # Shared components
    │   │   └── Layout.tsx    # Main layout with sidebar
    │   ├── pages/           # Route components
    │   ├── hooks/           # Custom React hooks
    │   └── lib/             # Utilities
    └── package.json
```

## API Endpoints

All API endpoints are prefixed with `/api`:
- `/api/health` - Health check
- `/api/ships` - Ship management
- `/api/crew` - Crew management  
- `/api/ports` - Port management
- `/api/cargo` - Cargo management
- `/api/clients` - Client management
- `/api/shipments` - Shipment management

## Environment Setup

### Backend Environment Variables
Create `/backend/.env`:
```
DATABASE_URL="postgresql://..."
PORT=5000
```

### Frontend Configuration
- Uses Vite for build tooling
- Configured for TypeScript strict mode
- shadcn/ui components with Tailwind CSS
- React Query for API state management

## Working with the Codebase

### Adding New Features
1. **Backend**: Add controller in `src/controllers/`, route in `src/routes/`, update `app.js`
2. **Frontend**: Add page in `src/pages/`, update routing in `App.tsx`
3. **Database**: Modify `schema.prisma`, run `npx prisma migrate dev`

### Key Architectural Patterns
- **Backend**: Each entity has dedicated controller and route files
- **Frontend**: Pages consume API via React Query hooks
- **UI**: Consistent use of shadcn/ui components with Tailwind styling
- **Forms**: React Hook Form with Zod validation (when implemented)

### CORS Configuration
Backend allows requests from:
- `http://localhost:8080` (local frontend)
- `https://global-cargo-frontend.onrender.com` (production)

## Deployment Context







The application appears designed for deployment on Render.com based on the CORS configuration and references to `global-cargo-frontend.onrender.com`.
