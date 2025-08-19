# Overview

This is a comprehensive API Provider Catalog web application built to manage and display information about API providers, their APIs, and endpoints in a hierarchical structure. The application serves as a centralized catalog where users can browse, search, and manage API provider information with multi-language support (English and Arabic). It features a modern React frontend with a Node.js/Express backend and PostgreSQL database using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: React-i18next for English/Arabic language support with RTL layout
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Type Safety**: Full TypeScript implementation with strict type checking
- **API Design**: RESTful API structure with CRUD operations for all entities
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot reload with Vite integration and runtime error overlay

## Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema Structure**: Hierarchical data model with four main entities:
  - **Categories**: Shared classification system across all providers
  - **Providers**: Top-level API provider organizations
  - **APIs**: Service offerings within each provider
  - **Endpoints**: Individual API endpoints within each API
- **Relationships**: Many-to-many relationships between providers/APIs and categories using junction tables
- **Data Validation**: Zod schemas for runtime validation matching database constraints

## Key Architectural Decisions

### Hierarchical Data Model
The application implements a three-tier hierarchy (Provider → API → Endpoint) to accurately represent how API services are organized in the real world. This allows for granular management and better AI decision-making capabilities.

### Shared Category System
Categories are centralized and shared across all providers rather than being provider-specific. This ensures consistent classification and easier cross-provider comparisons.

### Type Safety Throughout
The application uses TypeScript extensively with shared schemas between frontend and backend, ensuring type safety from database to UI components.

### Internationalization Support
Built-in support for English and Arabic languages with proper RTL layout handling, demonstrating consideration for global accessibility.

### Component-Based UI Architecture
Utilizes a component library approach with reusable UI components and form components, ensuring consistency and maintainability.

## Performance Considerations
- Query optimization with TanStack Query for intelligent caching and background updates
- Lazy loading of components and routes
- Optimized bundle splitting with Vite
- Efficient re-rendering with React Query's invalidation strategies

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL database hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## UI and Styling
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating type-safe component variants

## Development Tools
- **Vite**: Fast build tool and development server with HMR
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing for Tailwind CSS
- **Replit Integration**: Development environment integration with runtime error overlay

## Form and Validation
- **React Hook Form**: Performance-optimized form library
- **Zod**: Schema validation library for TypeScript
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## State Management and Data Fetching
- **TanStack React Query**: Server state management with intelligent caching
- **React Router**: Lightweight routing solution (Wouter)

## Internationalization
- **i18next**: Internationalization framework
- **React i18next**: React bindings for i18next

## Utility Libraries
- **date-fns**: Modern date utility library
- **clsx**: Utility for constructing className strings
- **nanoid**: URL-safe unique ID generator