# COMS4152 Presentation Evaluation System

A web application for classroom presentation evaluations for the COMS4152 project. Instructors can create presentation events, students can submit evaluations, and presenters can view anonymous feedback.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Ruby on Rails 7.1 
- **Database:** SQLite3

## Features

### Core Features
- User authentication (login/signup)
- Create presentation events with presenter selection
- Submit evaluations with 4 scoring categories (Clarity, Organization, Delivery, Overall)
- View anonymous feedback as a presenter
- Admin/Instructor view of all evaluation results and statistics

### Additional Features
- Role-based access control (instructor, ta, student)
- Self-evaluation prevention (cannot evaluate your own presentation)
- Auto-seeding database on first startup
- Swagger API documentation

## Quick Start

### Prerequisites
- Ruby 3.3.x
- Node.js 18+
- SQLite3

### 1. Start Backend Server

```bash
cd server
bundle install
rails server -p 3000
```

The database will be automatically created and seeded on first startup.

### 2. Start Frontend Server

```bash
cd client
npm install
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **API Documentation:** http://localhost:3000/docs

## Test Accounts

These fictional accounts are for local demos. All use the password `DemoPass123!`.

| Role | Email | Password |
|------|-------|----------|
| Instructor | instructor@example.com | DemoPass123! |
| TA | ta@example.com | DemoPass123! |
| Student | student1@example.com | DemoPass123! |
| Student | student2@example.com | DemoPass123! |
| Student | student3@example.com | DemoPass123! |
| Student | student4@example.com | DemoPass123! |

The Rails seeds (`server/db/seeds.rb`), SQL seeds (`seed.sql`), and bundled sample database (`database.db`) contain the same demo records. The sample courses use `COMS4152`, the term `Fall 2026`, and generic room names. The backend creates its own database at `server/storage/development.sqlite3` on first startup.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/login | User login |
| POST | /api/v1/signup | User registration |
| GET | /api/v1/me | Get current user info |
| GET | /api/v1/courses | List all courses |
| GET | /api/v1/courses/:id/members | Get course members |
| GET | /api/v1/courses/:id/presentations | List presentations |
| POST | /api/v1/courses/:id/presentations | Create presentation |
| GET | /api/v1/presentations/:id | Get presentation details |
| GET | /api/v1/presentations/:id/stats | Get evaluation statistics (admin) |
| POST | /api/v1/presentations/:id/evaluations | Submit evaluation |
| GET | /api/v1/my_presentations | Get presenter's own feedback |

## Project Structure

```
COMS4152/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.ts          # API client functions
│   │   └── App.tsx         # Main app with routing
│   └── package.json
├── server/                 # Rails backend
│   ├── app/
│   │   ├── controllers/    # API controllers
│   │   └── models/         # ActiveRecord models
│   ├── config/
│   │   └── routes.rb       # API routes
│   ├── db/
│   │   └── seeds.rb        # Seed data
│   └── swagger/            # API documentation
├── schema.sql              # Database schema
└── README.md
```

## Database Reset

To reset the database with fresh seed data:

```bash
cd server
rm -f storage/development.sqlite3*
rails server -p 3000
```

The server will automatically recreate and seed the database.
