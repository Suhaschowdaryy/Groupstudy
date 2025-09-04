# StudyPod - AI-Powered Study Group Matching Platform

## Overview

StudyPod is a modern web application that uses AI to connect students with compatible study partners and groups. The platform facilitates the creation of small, focused study pods (4-8 students) and provides intelligent matching based on learning goals, pace, availability, and subject preferences. It features real-time collaboration tools, gamification elements, and an AI assistant for personalized study recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a single-page application (SPA) architecture
- **Routing**: Wouter for client-side routing with authentication-based route protection
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds
- **Design System**: Custom glassmorphism effects with gradient-based color schemes

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **API Design**: RESTful API with conventional HTTP methods and status codes
- **Authentication**: Passport.js with Google OAuth and email/password authentication
- **Session Management**: Express sessions with PostgreSQL session store for persistent login state
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Setup**: Hot module replacement with Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Schema Organization**: Shared schema definitions between client and server in `/shared/schema.ts`
- **Database Migrations**: Drizzle Kit for schema migrations and database management
- **Connection Pooling**: Neon serverless connection pooling for efficient database access

### Authentication and Authorization
- **Provider**: Passport.js with Google OAuth 2.0 and local email/password strategies
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL (1 week default)
- **Route Protection**: Middleware-based authentication checks on protected API endpoints
- **User Management**: Database-stored user profiles with password hashing and Google ID linking
- **Security**: HTTP-only cookies with secure flags and CSRF protection

### AI Integration
- **Provider**: Google Gemini 2.5 Flash for AI-powered features
- **Study Matching**: Intelligent algorithm for compatible study partner recommendations
- **Content Generation**: Personalized study plans, tips, and academic question answering
- **Chat Moderation**: AI-powered content filtering for group communications
- **Recommendation Engine**: Subject-based learning recommendations and resource suggestions

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting for primary data storage
- **Google Gemini API**: Gemini 2.5 Flash integration for AI-powered features and recommendations
- **Google OAuth**: Authentication service with OAuth 2.0 flow for secure login
- **Google Fonts**: Font delivery for Inter, Orbitron, and other typefaces

### Core Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod validation
- **UI Framework**: Radix UI primitives, shadcn/ui components, Lucide React icons
- **Data Fetching**: TanStack Query for server state management and caching
- **Database**: Drizzle ORM, Neon serverless client, PostgreSQL connection pooling
- **Styling**: Tailwind CSS, class-variance-authority, clsx for conditional styling
- **Animation**: Framer Motion for smooth UI transitions and interactions
- **Utilities**: date-fns for date handling, nanoid for ID generation, zod for schema validation

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript for type safety, ESLint configuration
- **Replit Integration**: Cartographer plugin and runtime error overlay for development
- **Environment**: Node.js ESM modules with tsx for TypeScript execution
