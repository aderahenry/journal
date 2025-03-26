# Journal App

A full-stack journaling application built with React, TypeScript, Material-UI, Go, and MySQL.

## Overview

The Journal App is a personal journaling application that allows users to create, edit, and manage journal entries. Users can categorize entries, track their mood, and view statistics about their journaling habits.

## Features

### Frontend

- Modern React with TypeScript
- Material-UI v5 components
- Redux Toolkit with RTK Query
- Responsive design
- Interactive data visualizations
- Optimistic updates

### Backend

- Go with Gorilla MUX
- GORM for database operations
- JWT authentication
- RESTful API
- MySQL database

## Getting Started

The application is divided into two main parts:

1. **Frontend**: React application with TypeScript, Redux, and Material-UI
2. **Backend**: Go REST API server with MySQL database

For detailed setup instructions, please refer to:

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Project Structure

```
journal/
├── frontend/        # React frontend application
├── backend/         # Go backend API server
└── .vscode/         # VS Code configuration
```

## System Design Document

### Architecture Diagram and Explanation

```
┌───────────────────┐      ┌─────────────────────┐      ┌───────────────────┐
│                   │      │                     │      │                   │
│  React Frontend   │      │    Go Backend       │      │   MySQL Database  │
│  ---------------  │◄────►│  ---------------    │◄────►│  ---------------  │
│  - React + TS     │ REST │  - Gorilla MUX      │ GORM │  - InnoDB Engine  │
│  - Redux Toolkit  │ API  │  - JWT Auth         │      │  - Transactions   │
│  - RTK Query      │      │  - Service Layer    │      │  - Foreign Keys   │
│  - Material UI    │      │  - Middleware       │      │  - Indexing       │
│                   │      │                     │      │                   │
└───────────────────┘      └─────────────────────┘      └───────────────────┘
         ▲                           ▲                            ▲
         │                           │                            │
         │                           │                            │
         ▼                           ▼                            ▼
┌───────────────────┐      ┌─────────────────────┐      ┌───────────────────┐
│                   │      │                     │      │                   │
│  Client Caching   │      │    Redis            │      │   Backup System   │
│  ---------------  │      │  ---------------    │      │  ---------------  │
│  - Local Storage  │      │  - Session Store    │      │  - Scheduled      │
│  - Redux Cache    │      │  - Rate Limiting    │      │    Snapshots      │
│  - Service Worker │      │  - Cache Layer      │      │  - Point-in-time  │
│    (Future)       │      │                     │      │    Recovery       │
│                   │      │                     │      │                   │
└───────────────────┘      └─────────────────────┘      └───────────────────┘
```

The Journal application follows a modern three-tier architecture:

1. **Presentation Layer (Frontend)**
   - React with TypeScript for type-safe development
   - Redux for centralized state management
   - RTK Query for data fetching and caching
   - Material UI for responsive, accessible design
   - Local browser storage for preference persistence

2. **Application Layer (Backend)**
   - Go with Gorilla MUX for efficient HTTP routing
   - Service-oriented architecture for separation of concerns
   - JWT authentication with middleware for route protection
   - Structured middleware pipelines for cross-cutting concerns
   - Detailed error handling and logging

3. **Data Layer (Database)**
   - MySQL with InnoDB engine for ACID transactions
   - GORM for object-relational mapping
   - Strategic indexing for query optimization
   - Foreign key constraints for data integrity
   - Soft deletion for audit trails

### Data Model Design and Relationships

```
┌────────────────────┐       ┌─────────────────────┐       ┌────────────────────┐
│      User          │       │    JournalEntry     │       │       Tag          │
│ ------------------ │       │ ------------------- │       │ ------------------ │
│ id (PK)            │       │ id (PK)             │       │ id (PK)            │
│ email              │       │ user_id (FK)        │       │ user_id (FK)       │
│ password_hash      │       │ category_id (FK)    │       │ name               │
│ first_name         │       │ title               │       │ created_at         │
│ last_name          │       │ content             │       │ updated_at         │
│ created_at         │       │ mood                │       │ deleted_at         │
│ updated_at         │       │ word_count          │       └────────────────────┘
│ deleted_at         │       │ created_at          │               ▲
└────────────────────┘       │ updated_at          │               │
          ▲                  │ deleted_at          │               │
          │                  └─────────────────────┘               │
          │                           ▲                            │
          │                           │                            │
          │                           │                            │
          │                  ┌─────────────────────┐      ┌────────────────────┐
          │                  │ JournalEntryTag     │      │                    │
          │                  │ ------------------- │      │                    │
          │                  │ entry_id (PK, FK)   │◄─────┘                    │
          │                  │ tag_id (PK, FK)     │                           │
          │                  │ created_at          │                           │
          │                  │ updated_at          │                           │
          │                  │ deleted_at          │                           │
          │                  └─────────────────────┘                           │
          │                                                                    │
          │                                                                    │
┌─────────────────────┐                           ┌─────────────────────┐      │
│  UserPreferences    │                           │     Category        │      │
│ ------------------- │                           │ ------------------- │      │
│ id (PK)             │                           │ id (PK)             │      │
│ user_id (FK)        │◄──────────────────────────┤ user_id (FK)        │◄─────┘
│ theme               │                           │ name                │
│ default_view        │                           │ color               │
│ date_format         │                           │ created_at          │
│ email_notifications │                           │ updated_at          │
│ created_at          │                           │ deleted_at          │
│ updated_at          │                           └─────────────────────┘
│ deleted_at          │
└─────────────────────┘
```

**Key Entity Relationships:**

1. **User to Entries**: One-to-many (1:N)
   - A user can have multiple journal entries
   - Each entry belongs to exactly one user

2. **User to Categories**: One-to-many (1:N)
   - A user can create multiple categories
   - Each category belongs to exactly one user

3. **Category to Entries**: One-to-many (1:N)
   - A category can contain multiple entries
   - Each entry may belong to a single category (or none)

4. **User to Tags**: One-to-many (1:N)
   - A user can create multiple tags
   - Each tag belongs to exactly one user

5. **Entries to Tags**: Many-to-many (M:N)
   - An entry can have multiple tags
   - A tag can be applied to multiple entries
   - Requires the join table: JournalEntryTag

6. **User to Preferences**: One-to-one (1:1)
   - Each user has exactly one preferences record
   - Each preference record belongs to exactly one user

**Data Design Considerations:**

- All tables implement soft deletion (deleted_at) for data recovery
- Timestamps on all models for auditing
- Foreign keys enforce referential integrity
- Unique constraints prevent duplicate data
- Strategic indexes optimize query performance

### Security Measures Beyond Basic Authentication

1. **JWT Token Security**
   - Short-lived tokens (24 hours)
   - Secure HttpOnly cookies
   - CSRF protection with tokens
   - Token invalidation on logout
   - IP address binding

2. **Password Security**
   - Bcrypt hashing with salt
   - Password strength requirements
   - Account lockout after failed attempts
   - Secure password reset workflow

3. **Data Protection**
   - Input validation and sanitization
   - Parameterized SQL queries via GORM
   - Content security policy headers
   - XSS and CSRF protection
   - Rate limiting on authentication endpoints

4. **Infrastructure Security**
   - HTTPS-only with TLS 1.3
   - Secure HTTP headers
   - Environment-based configuration
   - Secrets management
   - Regular dependency auditing

5. **Authorization Controls**
   - Fine-grained access control
   - Resource ownership verification
   - Row-level security in database queries
   - Middleware validation on all protected routes

6. **Rate Limiting**
   - Redis-based token bucket algorithm
   - Separate limits for login and registration
   - Login endpoint:
     - 3 initial attempts
     - 1 attempt per minute after initial attempts
     - 24-hour rate limit window
   - Registration endpoint:
     - 5 attempts
     - 1 attempt every 5 seconds
     - 5-minute rate limit window
   - IP-based tracking
   - Automatic retry-after headers
   - Graceful failure handling

### Potential Scaling Challenges and Solutions

#### Scaling to Support 1M+ Users

1. **Database Scaling**
   - **Challenge**: Single MySQL instance becomes a bottleneck
   - **Solution**: Implement read replicas for query distribution
   - **Solution**: Database sharding by user_id
   - **Solution**: Migrate to a distributed database like Vitess

2. **API Layer Scaling**
   - **Challenge**: Increased request load on single API server
   - **Solution**: Horizontal scaling with load balancing
   - **Solution**: Containerization with Kubernetes for orchestration
   - **Solution**: API Gateway for routing and rate limiting

3. **Caching Strategy**
   - **Challenge**: Repeated expensive queries
   - **Solution**: Implement Redis for query/session caching
   - **Solution**: CDN for static assets
   - **Solution**: Edge caching for global distribution

4. **Search Functionality**
   - **Challenge**: Full-text search becomes slow at scale
   - **Solution**: Implement Elasticsearch for journal content
   - **Solution**: Async indexing of new content
   - **Solution**: Faceted search capabilities

5. **Media Storage**
   - **Challenge**: Storing images/attachments
   - **Solution**: Object storage (S3-compatible)
   - **Solution**: CDN integration
   - **Solution**: Image resizing and optimization service

### Potential Bottlenecks and Solutions

1. **Database Writes**
   - **Bottleneck**: High-frequency entry updates
   - **Solution**: Command-query responsibility segregation (CQRS)
   - **Solution**: Write-ahead logging
   - **Solution**: Batch processing for statistics

2. **Authentication System**
   - **Bottleneck**: Login/token validation
   - **Solution**: Distributed session store with Redis
   - **Solution**: JWT validation at edge
   - **Solution**: Auth service with connection pooling

3. **Statistics Generation**
   - **Bottleneck**: Calculating real-time metrics
   - **Solution**: Pre-compute statistics using background jobs
   - **Solution**: Materialized views
   - **Solution**: Time-series database for trends

4. **Rich Text Content**
   - **Bottleneck**: Storage and retrieval of formatted content
   - **Solution**: Efficient content encoding (Markdown/JSONB)
   - **Solution**: Content compression
   - **Solution**: Partial content loading

### Components to Redesign at Scale

1. **Authentication System**
   - Move to a dedicated auth service
   - Implement OAuth/OpenID Connect
   - Add multi-factor authentication

2. **Data Access Layer**
   - Replace direct GORM queries with repository pattern
   - Implement domain-driven design
   - Add domain event publishing for cross-service communication

3. **Monolithic Backend**
   - Decompose into microservices:
     - Auth Service
     - Entry Service
     - User Service
     - Analytics Service
     - Notification Service

4. **Frontend Architecture**
   - Implement micro-frontends for team scalability
   - Server-side rendering for performance
   - Progressive Web App capabilities
   - Edge rendering for global performance

5. **Notification System**
   - Event-driven architecture
   - Message queue for reliable delivery
   - Subscription management service
   - Push notification infrastructure

## Technical Decision Log

### 1. Client-Side vs. Server-Side Rendering

**Problem**: Determining the optimal rendering approach for the application.

**Options Considered**:

1. **Client-Side Rendering (CSR)**: Traditional React SPA
2. **Server-Side Rendering (SSR)**: Next.js or similar
3. **Static Site Generation (SSG)**: For content-heavy portions

**Chosen Approach**: Client-Side Rendering with potential for hybrid rendering

**Rationale**:

- The application is highly interactive with frequent state changes
- Most content is private and user-specific
- Authentication state drives most UI decisions
- Development velocity is higher with CSR for the MVP

**Trade-offs**:

- (+) Simplified development process
- (+) Clean separation between frontend and backend
- (+) Better caching opportunities for API data
- (-) Initial load time may be slower
- (-) SEO is less optimized (but less important for private journal content)

### 2. Data Fetching Strategy

**Problem**: How to efficiently fetch and manage data between client and server.

**Options Considered**:

1. **Raw Fetch/Axios**: Manual data fetching with custom hooks
2. **React Query**: Declarative data fetching library
3. **Apollo Client**: GraphQL-based solution
4. **RTK Query**: Redux Toolkit's data fetching solution

**Chosen Approach**: RTK Query

**Rationale**:

- Integrates naturally with existing Redux store
- Provides automatic caching, refetching, and invalidation
- Generates custom hooks for each endpoint
- Built-in optimistic updates
- TypeScript integration for type safety

**Trade-offs**:

- (+) Reduced boilerplate compared to traditional Redux
- (+) Standardized data fetching pattern across the application
- (+) Built-in loading/error states
- (-) Adds complexity to the Redux store
- (-) Learning curve for developers unfamiliar with RTK Query
- (-) Less flexible than GraphQL for complex data requirements

### 3. Backend Technology Stack

**Problem**: Selecting the appropriate backend technology for journal application.

**Options Considered**:

1. **Node.js/Express**: JavaScript-based backend
2. **Django/Python**: Python-based full-stack framework
3. **Go with Gorilla MUX**: Lightweight, performant solution
4. **Ruby on Rails**: Rapid development framework

**Chosen Approach**: Go with Gorilla MUX

**Rationale**:

- Excellent performance characteristics
- Strong typing and compiler support reduces runtime errors
- Concurrency model handles multiple requests efficiently
- Lower memory footprint than Node.js
- Structured and maintainable codebase

**Trade-offs**:

- (+) High performance and resource efficiency
- (+) Excellent for long-running services
- (+) Static typing reduces runtime errors
- (-) Smaller ecosystem than Node.js or Python
- (-) Less rapid development than Rails
- (-) Requires separate frontend/backend teams

### 4. Database Schema Design

**Problem**: How to design the database schema for flexibility, performance, and integrity.

**Options Considered**:

1. **Normalized Schema**: Traditional relational approach
2. **Partially Denormalized**: Some redundancy for performance
3. **NoSQL Approach**: Document-based storage
4. **Hybrid Approach**: SQL + JSON columns

**Chosen Approach**: Normalized Schema with strategic indexes

**Rationale**:

- Data integrity is critical for user journal content
- Relationships between entities are well-defined
- ACID transactions needed for user data
- Query patterns are predictable
- GORM works best with normalized schemas

**Trade-offs**:

- (+) Data consistency and integrity
- (+) Efficient storage with minimal redundancy
- (+) Clear relationships between entities
- (-) More complex queries for nested relationships
- (-) Potential performance impact from joins
- (-) Less flexibility for schema evolution

### 5. Authentication Strategy

**Problem**: Implementing secure, scalable user authentication.

**Options Considered**:

1. **Session-based Auth**: Traditional cookie-session approach
2. **JWT Tokens**: Stateless authentication
3. **OAuth/OpenID**: Third-party authentication
4. **Custom Auth System**: Built from scratch

**Chosen Approach**: JWT Token Authentication

**Rationale**:

- Stateless design simplifies scaling
- No need for distributed session storage
- Well-supported in Go ecosystem
- Works well with frontend SPA architecture
- Self-contained tokens with built-in expiration

**Trade-offs**:

- (+) Simplified backend architecture
- (+) No session storage required
- (+) Works well across multiple services
- (-) Token revocation is more challenging
- (-) Need to handle token refresh flow
- (-) Increased token size with more claims

### 6. Rate Limiting Implementation

**Problem**: Protecting authentication endpoints from brute force attacks and abuse.

**Options Considered**:

1. **In-Memory Rate Limiting**: Simple but not distributed
2. **Database-based Rate Limiting**: Persistent but high latency
3. **Redis with Token Bucket**: Distributed and performant
4. **Third-party Rate Limiting Service**: Managed but additional cost

**Chosen Approach**: Redis with Token Bucket Algorithm

**Rationale**:

- Distributed rate limiting across multiple servers
- Atomic operations via LUA scripts
- Low latency and high throughput
- Configurable per endpoint
- Built-in expiration for automatic cleanup

**Implementation Details**:

- Login endpoint:
  - 3 initial attempts
  - 1 attempt per minute after initial attempts
  - 24-hour rate limit window
- Registration endpoint:
  - 5 attempts
  - 1 attempt every 5 seconds
  - 5-minute rate limit window
- IP-based tracking
- Automatic retry-after headers
- Graceful failure handling

**Trade-offs**:

- (+) Distributed and scalable
- (+) Atomic operations prevent race conditions
- (+) Configurable per endpoint
- (+) Automatic cleanup via Redis expiration
- (-) Additional infrastructure dependency
- (-) Need to handle Redis connection failures
- (-) Memory usage for rate limit tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details. 