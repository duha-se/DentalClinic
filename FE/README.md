# Dental Clinic Management System

A full-stack web application for managing a dental clinic, including appointment scheduling, user management, services, and invoices.

## Tech Stack
- **Backend**: Node.js, Express, MySQL, JWT, bcryptjs
- **Frontend**: React, Material-UI, Axios
- **Database**: MySQL
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest & Supertest

## Running with Docker

```bash
docker-compose up --build
```

This will start the MySQL database, backend API on port 5001, and frontend on port 3000.

## Running Locally

### Backend
```bash
cd BE
npm install
npm run dev
```

### Frontend
```bash
cd FE
npm install
npm start
```

## Running Tests

### Backend Tests
```bash
cd BE
npm test
```

## Environment Variables

Create a `.env` file in the `BE` directory with the following variables:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=dental_clinic
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Important Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)
- `GET /api/auth/overview` - Get user overview (authenticated)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/category/:category` - Get services by category

### Appointments
- `GET /api/appointments` - Get user appointments (authenticated)
- `POST /api/appointments` - Create new appointment (authenticated)
- `PUT /api/appointments/:id` - Update appointment (authenticated)
- `DELETE /api/appointments/:id` - Cancel appointment (authenticated)

### Invoices
- `GET /api/invoices/my-invoices` - Get user invoices (authenticated)
- `GET /api/invoices/:id` - Get invoice by ID (authenticated)

### Health Check
- `GET /health` - Health check
- `GET /api/version` - API version