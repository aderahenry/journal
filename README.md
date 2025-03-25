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

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend│     │   Go Backend    │     │    MySQL DB     │
│  (TypeScript)   │◄───►│  (Gorilla MUX)  │◄───►│    (InnoDB)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

The application follows a three-tier architecture:

1. **Frontend Layer**: React application with TypeScript, handling UI/UX and client-side state management
2. **Backend Layer**: Go server providing RESTful APIs and business logic
3. **Data Layer**: MySQL database for persistent storage

## Data Model

```
User
├── ID
├── Email
├── PasswordHash
├── FirstName
├── LastName
└── Preferences

JournalEntry
├── ID
├── UserID
├── CategoryID
├── Title
├── Content
├── Mood
├── WordCount
└── Tags

Category
├── ID
├── UserID
├── Name
└── Color

Tag
├── ID
├── UserID
└── Name
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 