# COMP3123 Assignment 1 — Employee Management API

**Student:** Mukhtar Ali
**Student Number:** 101578443

A REST API built with Node.js, Express, and MongoDB. Users can register,
log in, and manage their own employees. JWT authentication and ownership
checks protect employee data.

## Technologies

- Node.js and Express
- MongoDB Atlas and Mongoose
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- express-validator for input validation
- Helmet for HTTP security headers
- express-rate-limit for authentication rate limiting
- dotenv for local environment configuration

## Project Structure

```text
config/
  db.js
controllers/
  userController.js
  employeeController.js
middleware/
  authMiddleware.js
  authLimiter.js
  employeeOwnership.js
  errorHandler.js
  requestLogger.js
models/
  User.js
  Employee.js
routes/
  userRoutes.js
  employeeRoutes.js
utils/
  logger.js
validators/
  userValidator.js
  employeeValidator.js
logs/
  app.log
.env.example
.gitignore
package.json
package-lock.json
server.js
README.md
```

The application creates `logs/app.log` locally. Generated logs and the
actual `.env` file are excluded from Git.

## Installation

1. Clone this repository using its GitHub URL.
2. Open a terminal inside the project folder.
3. Install dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env`.
5. Enter your MongoDB connection string and JWT secret.
6. Ensure your MongoDB Atlas cluster is running and its network access
   settings allow the application to connect.
7. Start the application:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

The default local address is:

```text
http://localhost:8081
```

This project uses MongoDB Atlas, so a local MongoDB server is not required.
The database name is `comp3123_assignment1`.

## Environment Variables

Example configuration:

```env
PORT=8081
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
```

| Variable | Purpose |
|---|---|
| PORT | Local server port |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret used to sign and verify JWTs |

Generate a random JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit the actual `.env` file, database credentials, or JWT secret.

## API Endpoints

Employee endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Success | Purpose |
|---|---|---|---|
| POST | /api/v1/user/signup | 201 | Register a user |
| POST | /api/v1/user/login | 200 | Log in and receive a JWT |
| GET | /api/v1/emp/employees | 200 | List the current user's employees |
| POST | /api/v1/emp/employees | 201 | Create an employee |
| GET | /api/v1/emp/employees/:eid | 200 | Retrieve an owned employee |
| PUT | /api/v1/emp/employees/:eid | 200 | Update an owned employee |
| DELETE | /api/v1/emp/employees?eid=:eid | 204 | Delete an owned employee |
| GET | /health | 200 | Check that the server is running |

A successful DELETE response has no response body.

## Authentication

### Signup

```json
{
  "username": "testuser_a",
  "email": "testuser_a@example.com",
  "password": "DemoPass123!"
}
```

Usernames and emails must be unique. Passwords must contain at least
eight characters, an uppercase letter, a lowercase letter, and a number.
Passwords must not exceed 72 UTF-8 bytes.

Passwords are hashed with bcrypt before storage. Neither passwords nor
password hashes are returned in API responses.

### Login

Login accepts either username and password:

```json
{
  "username": "testuser_a",
  "password": "DemoPass123!"
}
```

Or email and password:

```json
{
  "email": "testuser_a@example.com",
  "password": "DemoPass123!"
}
```

Provide one identifier, not both.

Successful login returns a JWT valid for one hour. In Postman, select
Authorization → Bearer Token and paste the returned token.

The API verifies the token and checks that its user still exists.
Missing, invalid, and expired tokens return 401.

## Employee Requests

Example employee body:

```json
{
  "first_name": "Alex",
  "last_name": "Morgan",
  "email": "alex.morgan@example.com",
  "position": "Software Developer",
  "salary": 65000,
  "date_of_joining": "2026-10-01",
  "department": "Engineering"
}
```

POST and PUT require all seven fields. Salary must be a positive JSON
number. The joining date must be a valid date in YYYY-MM-DD format.

Clients must not submit a `user` field. The server assigns ownership
from the authenticated user's identity.

## Ownership and Authorization

Each employee contains a `user` ObjectId referencing its creator.

- List queries return only the authenticated user's employees.
- Ownership middleware checks access to individual employees.
- Existing employees belonging to another user return 403.
- Nonexistent employees return 404.
- Controllers also filter reads, updates, and deletions by owner.
- Clients cannot change employee ownership through the API.

## Security

### Helmet

Helmet adds security headers, including Content-Security-Policy,
X-Content-Type-Options, and X-Frame-Options.

### Rate Limiting

Signup and login each allow five requests per IP address per
15-minute window. Each endpoint has its own counter. Successful and
unsuccessful requests both count.

Requests exceeding the limit return 429 with a JSON error.

The current limiter uses in-memory storage. Counters reset when the
process restarts and are not shared between separate Vercel instances.
A shared store is needed for a consistent deployment-wide limit.

### Validation and Error Handling

The API validates required fields, lengths, email addresses, salary,
dates, employee IDs, and unexpected input.

Errors use JSON responses:

| Status | Meaning |
|---|---|
| 400 | Invalid input, ID format, or malformed JSON |
| 401 | Invalid credentials or missing/invalid/expired JWT |
| 403 | Employee belongs to another user |
| 404 | Employee or route does not exist |
| 409 | Username or email already exists |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

Internal error details and stack traces are not returned to clients.

## Logging

Local logs are appended to `logs/app.log` as timestamped JSON entries.

Logging includes:

- Server startup
- Request method, path, status, and duration
- Successful and failed login attempts
- Validation failures
- Authentication failures
- Ownership authorization failures
- Centralized request errors

Passwords, JWTs, JWT secrets, and database credentials are not logged.

On Vercel, the logger writes to the console for platform log collection.
Local logging evidence is included with the submission screenshots.

## Health Check

```text
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Employee API is running"
}
```

This endpoint confirms that the HTTP application is operational.
It does not perform a database connectivity check.

## Testing with Postman

Import the submitted Postman collection and start the API.

1. Register test users.
2. Log in and copy fresh tokens.
3. Use Bearer tokens for employee endpoints.
4. Test successful CRUD operations.
5. Test validation failures and duplicate users.
6. Test missing, invalid, and expired tokens.
7. Test rate limiting on signup and login.
8. Create employees for two users.
9. Verify each user sees only their own employees.
10. Verify cross-user GET, PUT, and DELETE requests return 403.
11. Check response headers, health-check output, and local logs.

Use current employee IDs from creation responses when testing.

### Non-sensitive Test Accounts

These credentials are for assignment testing only:

| User | Username | Password |
|---|---|---|
| A | testuser_a | DemoPass123! |
| B | testuser_b | DemoPass123! |

These are application accounts, not MongoDB database credentials.

## Deployment

The project is prepared for deployment to Vercel through GitHub.

Configure `MONGODB_URI` and `JWT_SECRET` in the Vercel project's
environment variables. Ensure MongoDB Atlas permits connections from
the deployment environment.

`server.js` exports the Express application for Vercel and starts a
local listener when run directly with Node.js.

The deployed API URL will be added after deployment is verified.