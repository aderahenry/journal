# Journal App Backend

This is the backend server for the Journal App, providing REST APIs for journal entry management, authentication, and categories.

## Prerequisites

- Go 1.16 or later
- MySQL 8.0 or later
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aderahenry/journal.git
cd journal/backend
```

### 2. Install Dependencies

```bash
go mod download
```

### 3. Database Setup

1. Create a MySQL database:

```bash
mysql -u root -p
```

Once logged in to MySQL, create the database:

```sql
CREATE DATABASE journal_db;
EXIT;
```

2. Run database schema initialization:

The application will automatically create the necessary tables when it runs for the first time, but you need to create categories manually using the provided script:

```bash
mysql -u root -p"your_password" journal_db < scripts/create_categories.sql
```

### 4. Configuration

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Open the `.env` file and update the values:

```
# Server Configuration
PORT=3000
ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=journal_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173
```

Make sure to replace `your_password` with your actual MySQL password and set a strong `JWT_SECRET`.

### 5. Run the Server

Start the backend server:

```bash
go run main.go
```

The server should start on port 3000 (or the port specified in your `.env` file). You can test that it's working by accessing:

```
http://localhost:3000/health
```

This should return `OK` if the server is running properly.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token

### Journal Entries

- `GET /api/entries` - Get all entries for the current user
- `GET /api/entries/{id}` - Get a specific entry
- `POST /api/entries` - Create a new entry
- `PUT /api/entries/{id}` - Update an entry
- `DELETE /api/entries/{id}` - Delete an entry
- `GET /api/entries/stats` - Get entry statistics

### Categories

- `GET /api/categories` - Get all categories for the current user
- `GET /api/categories/{id}` - Get a specific category

## Development

### Project Structure

- `/handlers` - HTTP request handlers
- `/middleware` - HTTP middleware functions
- `/models` - Data models and DTOs
- `/services` - Business logic
- `/db` - Database connection and migrations
- `/router` - API routes
- `/scripts` - Database scripts and utilities

### Troubleshooting

#### Database Connection Issues

If you encounter database connection issues, verify:

1. MySQL service is running
2. Database credentials in `.env` are correct
3. Database `journal_db` exists

#### Server Won't Start

Check for:

1. Port conflicts - another service might be using port 3000
2. Environment variables - ensure `.env` file is properly configured
3. Go modules - run `go mod tidy` to clean up dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details. 