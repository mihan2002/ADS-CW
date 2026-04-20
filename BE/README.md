# MVC Project

A TypeScript-based MVC (Model-View-Controller) application built with Express.js.

## Project Structure

```
src/
├── controllers/     # Business logic and request handlers
├── models/          # Data models and database logic
├── routes/          # API route definitions
├── middleware/      # Custom middleware functions
├── views/           # HTML templates and static views
├── utils/           # Utility functions
├── app.ts           # Express app configuration
└── index.ts         # Server entry point

dist/               # Compiled JavaScript files
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build TypeScript:

```bash
npm run build
```

## Development

Run the development server with auto-reload:

```bash
npm run dev
```

## Production

Build and start:

```bash
npm run build
npm start
```

## API Endpoints

### Users

- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
  - Body: `{ "name": "John", "email": "john@example.com" }`
- **PUT** `/api/users/:id` - Update user
  - Body: `{ "name": "John", "email": "john@example.com" }`
- **DELETE** `/api/users/:id` - Delete user

## Technologies

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Node.js** - Runtime environment

## Architecture

This project follows the MVC pattern:

- **Model** - `User` class handles data and business logic
- **View** - HTML and JSON responses
- **Controller** - `UserController` handles requests and responses

## Scripts

- `npm run dev` - Start development server (ts-node)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm test` - Run tests (not configured)

## Environment Variables

Create a `.env` file for environment-specific configuration:

```
PORT=3000
NODE_ENV=development
```

## License

ISC
