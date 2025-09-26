# Overview

7even is a gamified environmental education platform that combines interactive learning, real-world missions, and social collaboration to teach environmental science and encourage sustainable actions. The platform uses experience points (XP), EcoCredits, achievements, and guild-based teamwork to motivate users to learn about topics like biodiversity, climate science, waste management, and green innovation while taking measurable real-world environmental actions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React.js with TypeScript, using Vite as the build tool and Wouter for client-side routing. The UI is built with shadcn/ui components using Tailwind CSS for styling.

**Component Structure**: The frontend follows a component-based architecture with reusable UI components for cards, forms, navigation, and specialized environmental education features like AR scanning simulation and ecosystem simulation interfaces.

**State Management**: Uses TanStack Query (React Query) for server state management, with custom hooks for authentication and user data. Local state is managed with React hooks.

**Progressive Web App**: Configured as a PWA with manifest.json for mobile app-like experience, including offline capabilities and mobile navigation.

## Backend Architecture

**Framework**: Node.js with Express.js server, using ESM modules and TypeScript for type safety.

**Authentication**: Replit Auth integration using OpenID Connect with Passport.js strategies. Session management uses PostgreSQL-backed sessions with connect-pg-simple.

**API Design**: RESTful API structure with route handlers for user management, learning content, missions, guilds, achievements, and progress tracking.

**Database Abstraction**: Uses Drizzle ORM with a storage interface pattern that abstracts database operations, making it easy to swap implementations while maintaining consistent API.

## Data Storage Architecture

**Primary Database**: PostgreSQL with Neon serverless driver for production scalability.

**ORM**: Drizzle ORM with schema-first approach, using migrations for database versioning.

**Schema Design**: Structured around core entities including users, lessons, missions, guilds, achievements, user progress, leaderboards, and eco actions. Includes enum types for tracks, difficulty levels, and mission statuses.

**Session Storage**: PostgreSQL-backed session storage for authentication persistence.

## Gamification System

**Experience System**: XP-based progression with levels, where users earn points from completing lessons, missions, and real-world eco actions.

**Reward Mechanisms**: EcoCredits as virtual currency earned through environmental actions, achievements with badge system, and leaderboards for competitive elements.

**Learning Tracks**: Four specialized learning paths - EcoExplorer (biodiversity), ClimateChampion (climate science), WasteWarrior (waste management), and GreenInnovator (sustainable technology).

**Social Features**: Guild system for collaborative learning and team challenges, with member management and progress tracking.

# External Dependencies

**Database Services**: 
- Neon PostgreSQL for serverless database hosting
- Database connection pooling for performance

**Authentication Services**:
- Replit Auth using OpenID Connect
- Passport.js for authentication strategies

**UI Framework**:
- Radix UI primitives for accessible components
- shadcn/ui component library
- Tailwind CSS for styling
- Lucide React for icons

**Development Tools**:
- Vite for build tooling and development server
- TypeScript for type safety
- ESBuild for production bundling
- PostCSS with Autoprefixer

**Runtime Dependencies**:
- TanStack React Query for data fetching and caching
- Wouter for lightweight client-side routing
- React Hook Form with Zod for form validation
- Date-fns for date manipulation
- Class Variance Authority for component variants

**Development Environment**:
- Replit-specific plugins for development experience
- Runtime error overlay for debugging
- Development banner and cartographer for Replit integration