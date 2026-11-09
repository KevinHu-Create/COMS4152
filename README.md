# COMS4152 Presentation Evaluation System

A web application for classroom presentation evaluations for the COMS4152 project. Instructors can create presentation events, students can submit evaluations, and presenters can view anonymous feedback.

## Team Members

| Name | UNI |
|------|-----|
| Dan Lin | dl3762 |
| Kaizhuo Hu | kh3482 |
| Xuhang Yuan | xy2757 |
| Jiajun Chen | jc6949 |

## Links

- **GitHub:** https://github.com/KevinHu-Create/COMS4152
- **Heroku:** _coming soon_

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
- Ruby 3.3.3 (see `server/.ruby-version`; e.g. `rbenv install 3.3.3`)
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

## Running the Tests

### User stories (Cucumber)

The user stories in `server/features/` run end to end: Cucumber builds the React client, serves it together with the Rails API, and drives it in headless Chrome (Capybara and Cuprite).

Requirements: Google Chrome installed, and the frontend dependencies installed once with `cd client && npm install`.

```bash
cd server
bundle install
bundle exec cucumber
```

- `HEADLESS=false bundle exec cucumber` opens a visible Chrome window so you can watch the scenarios.
- `SKIP_CLIENT_BUILD=1 bundle exec cucumber` reuses the last frontend build, which is faster when only Ruby code changed.
- The coverage report is written to `server/coverage/cucumber/index.html`.

| Feature | Scenarios |
|---------|-----------|
| `user_login.feature` | Log in; wrong password; event list requires login |
| `user_signup.feature` | Create an account; email already registered |
| `view_presentation.feature` | See an event with its date and presenter; empty list; students cannot manage events |
| `create_presentation.feature` | Instructor creates an event with a presenter; title is required |
| `submit_evaluation.feature` | Submit scores and comment; cannot evaluate own presentation; cannot evaluate twice |
| `view_feedback.feature` | Presenter sees averages and anonymous comments; no feedback yet |
| `view_result.feature` | Instructor sees totals, averages and each evaluation; no evaluations yet; students are refused |

### Unit and API tests (RSpec)

The backend is tested with **RSpec** (model specs and API request specs), with **SimpleCov** for coverage.

```bash
cd server
bundle exec rspec
```

- The test database (`server/storage/test.sqlite3`) is rebuilt from `schema.sql` on every run, so no setup is needed. It never touches the development database.
- After a run, open `server/coverage/index.html` to see the coverage report. The run fails if line coverage drops below 80%.
- Run one file with `bundle exec rspec spec/requests/evaluations_spec.rb`.

| Spec | What it covers |
|------|----------------|
| `spec/models/*_spec.rb` | Validations (score range 1 to 5, required fields, unique email and enrollment, one evaluation per person), no self-evaluation, associations and dependent deletes, `average_score`, `presenter?`, `authenticate` |
| `spec/requests/auth_spec.rb` | Signup, login, `/me`, missing or forged tokens |
| `spec/requests/courses_spec.rb` | Listing and creating courses, adding and removing members, role checks |
| `spec/requests/presentations_spec.rb` | Presentation CRUD (staff only), anonymous presenter feedback, instructor stats, `my_presentations` |
| `spec/requests/evaluations_spec.rb` | Submitting evaluations (self, duplicate and out-of-range cases rejected), staff-only listing, pending evaluations |

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
│   ├── features/           # Cucumber user stories and step definitions
│   ├── spec/               # RSpec tests (models/, requests/, factories/)
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
