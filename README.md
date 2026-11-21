# COMS4152 Presentation Evaluation System

A web application for classroom presentation evaluations for the COMS4152 project. Instructors run courses and schedule presentation events, students evaluate their classmates' presentations, and presenters read anonymous feedback.

## Team Members

| Name | UNI |
|------|-----|
| Dan Lin | dl3762 |
| Kaizhuo Hu | kh3482 |
| Xuhang Yuan | xy2757 |
| Jiajun Chen | jc6949 |

## Links

- **GitHub:** https://github.com/KevinHu-Create/COMS4152
- **Heroku:** https://coms4152-presentation-eval-aa337b06126f.herokuapp.com

  Sign in with any of the demo accounts listed under [Test Accounts](#test-accounts).

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Ruby on Rails 7.1
- **Database:** SQLite3 locally, PostgreSQL on Heroku

## Features

### Iteration 1
- Sign up and log in
- Create presentation events and choose the presenters
- Submit an evaluation with four scores (Clarity, Organization, Delivery, Overall) and a comment
- Presenters see their averages and anonymous comments
- Instructors see every evaluation with the evaluator's name, plus averages

### Iteration 2
- **Multiple courses:** switch between your courses on the event list; instructors create new courses.
- **Course members:** instructors and TAs add people by email (as student or TA) and remove them. Everyone in the course can see the roster.
- **Edit and delete events:** change the title, date, start/end time, location, description and presenters, or delete the event after a confirmation.
- **Waiting for your evaluation:** students see which held presentations they still need to evaluate. Event cards are tagged *Your presentation*, *Evaluated* or *Upcoming*.
- **Secure passwords:** passwords are stored as bcrypt hashes (at least 6 characters).

### Rules the app enforces
- Permissions are per course. Only members see a course and its events. Only the course's instructor, its TAs and admins manage events and members and see named results.
- Only enrolled students evaluate, once per presentation, never their own, and not before the presentation date.
- Event end time must be after its start time. Presenters must be members of the course.
- Swagger API documentation at `/docs`

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

The demo data comes from the Rails seeds (`server/db/seeds.rb`), which the backend loads into `server/storage/development.sqlite3` on first startup. `seed.sql` and `database.db` in the repository root are older reference copies and are not used by the app. If your local database was created before passwords were hashed, the server hashes the old passwords on startup, so the demo logins keep working.

## API Endpoints

All endpoints except signup and login need the `Authorization: Bearer <token>` header returned by login.

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | /api/v1/signup | anyone | Create an account |
| POST | /api/v1/login | anyone | Log in |
| GET | /api/v1/me | signed in | Current user |
| GET | /api/v1/courses | signed in | Your courses, each with `my_role` |
| POST | /api/v1/courses | instructor, admin | Create a course |
| GET | /api/v1/courses/:id | course members | Course details |
| GET | /api/v1/courses/:id/members | course members | Roster |
| POST | /api/v1/courses/:id/members | course staff | Add a member by email (`role`: student or ta) |
| DELETE | /api/v1/courses/:id/members/:user_id | course staff | Remove a member |
| GET | /api/v1/courses/:id/presentations | course members | Events, with `isMine`, `evaluatedByMe`, `upcoming` |
| POST | /api/v1/courses/:id/presentations | course staff | Create an event |
| GET | /api/v1/presentations/:id | course members | Event details |
| PATCH | /api/v1/presentations/:id | course staff | Update an event (`presenter_ids` replaces presenters) |
| DELETE | /api/v1/presentations/:id | course staff | Delete an event |
| GET | /api/v1/presentations/:id/stats | course staff | Every evaluation with names, and averages |
| GET | /api/v1/presentations/:id/feedback | presenters | Anonymous averages and comments |
| GET | /api/v1/presentations/:id/evaluations | course staff | Evaluations with evaluator |
| POST | /api/v1/presentations/:id/evaluations | enrolled students | Submit an evaluation |
| GET | /api/v1/pending_evaluations | signed in | Presentations you still need to evaluate (`course_id` optional) |
| GET | /api/v1/my_presentations | signed in | Feedback on your own presentations |

Course staff means the course's instructor, its TAs, and admins.

## Running the Tests

Requirements: Ruby 3.3.3, Google Chrome (for Cucumber), and the frontend dependencies installed once with `cd client && npm install`.

```bash
cd server
bundle install
bin/test
```

`bin/test` runs RSpec and then Cucumber. Both write to `server/coverage/`, and SimpleCov merges them, so **`server/coverage/index.html` shows the combined RSpec + Cucumber coverage** (shared settings are in `server/.simplecov`). You can also run either suite alone with `bundle exec rspec` or `bundle exec cucumber`.

Current results: **206 RSpec examples and 49 Cucumber scenarios (11 features, 316 steps), all passing; combined line coverage 99.6%, branch coverage 98.9%.**

### User stories (Cucumber)

The user stories in `server/features/` run end to end: Cucumber builds the React client, serves it together with the Rails API, and drives it in headless Chrome (Capybara and Cuprite).

- `HEADLESS=false bundle exec cucumber` opens a visible Chrome window so you can watch the scenarios.
- `SKIP_CLIENT_BUILD=1 bundle exec cucumber` reuses the last frontend build, which is faster when only Ruby code changed.

| Feature | Scenarios |
|---------|-----------|
| `user_login.feature` | Log in; wrong password; event list requires login |
| `user_signup.feature` | Create an account; email already registered; password too short; password stored encrypted |
| `view_presentation.feature` | See an event with its date and presenter; empty list; students cannot manage events |
| `create_presentation.feature` | Create an event with a presenter; with time and location; end before start rejected; title required |
| `edit_presentation.feature` | Change title and location; change presenters; times out of order; delete; cancel delete; students cannot edit |
| `manage_courses.feature` | Create a course; title required; switch courses; remembers the chosen course; students cannot create courses; new accounts start without courses |
| `manage_members.feature` | Add a student; add a TA; unknown email; already a member; remove; cancel removal; students see the roster read-only; outsiders cannot see or evaluate events |
| `submit_evaluation.feature` | Submit scores and comment; own presentation; already evaluated; not held yet; every category required |
| `pending_evaluations.feature` | Waiting list; evaluated presentations leave it; own presentations excluded; per course; none for instructors |
| `view_feedback.feature` | Presenter sees averages and anonymous comments; no feedback yet |
| `view_result.feature` | Instructor sees totals, averages and each evaluation; no evaluations yet; students are refused |

### Unit and API tests (RSpec)

- The test database (`server/storage/test.sqlite3`) is rebuilt from `schema.sql` on every run, so no setup is needed. It never touches the development database.
- The run fails if line coverage drops below 80%.
- Run one file with `bundle exec rspec spec/requests/evaluations_spec.rb`.

| Spec | What it covers |
|------|----------------|
| `spec/models/user_spec.rb` | Validations, bcrypt password hashing and minimum length, upgrading old plain-text passwords |
| `spec/models/course_spec.rb` | Validations, per-course roles (`role_for`, `member?`, `staff?`), dependent deletes |
| `spec/models/presentation_spec.rb` | Validations, HH:MM times and end after start, `upcoming?`, `pending_for`, `presenter?`, `average_score` |
| `spec/models/evaluation_spec.rb` | Score range 1 to 5, one evaluation per person, no self-evaluation, no evaluation before the presentation date |
| `spec/models/course_membership_spec.rb`, `presentation_presenter_spec.rb` | Roles in a course, unique enrollment, associations |
| `spec/requests/auth_spec.rb` | Signup (password rules, never storing or returning the password), login, `/me`, missing or forged tokens |
| `spec/requests/courses_spec.rb` | Course list with `my_role`, creating courses, members-only access, adding and removing members, staff-only changes |
| `spec/requests/presentations_spec.rb` | Event CRUD for course staff, presenter changes in one transaction, per-user flags, anonymous feedback, stats |
| `spec/requests/evaluations_spec.rb` | Submitting evaluations (enrollment, self, duplicate, future and out-of-range cases), staff-only listing, pending evaluations |
| `spec/requests/frontend_spec.rb` | Serving the React app for client-side routes |

## Project Structure

```
COMS4152/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React pages (event list, courses, evaluation, results)
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
│   ├── bin/test            # Runs RSpec + Cucumber with combined coverage
│   ├── features/           # Cucumber user stories and step definitions
│   ├── spec/               # RSpec tests (models/, requests/, factories/)
│   └── swagger/            # API documentation
├── schema.sql              # Database schema
└── README.md
```

## Deployment (Heroku)

The app is deployed as a single Heroku app on the **container stack**. The root `Dockerfile` builds the React client with `VITE_API_BASE_URL=/api/v1` and copies it into the Rails app's `public/`, so Rails serves both the API and the frontend from the same origin. `heroku.yml` runs `rails db:prepare` in the release phase, which creates the PostgreSQL tables from `server/db/schema.rb` and loads the demo seeds on the first deploy.

First-time setup (already done for the app above):

```bash
heroku create <app-name> --stack container
heroku addons:create heroku-postgresql:essential-0
heroku config:set SECRET_KEY_BASE=$(openssl rand -hex 64)
git push heroku main
```

To redeploy after changes are merged into `main`:

```bash
git push heroku main
```

`server/db/schema.rb` (used on Heroku) mirrors `schema.sql` (used locally), so keep the two in sync when the schema changes. Data changes for the existing Heroku database go in `server/db/migrate/` (for example, hashing the old plain-text passwords); `rails db:prepare` runs them on the next deploy.

## Database Reset

To reset the database with fresh seed data:

```bash
cd server
rm -f storage/development.sqlite3*
rails server -p 3000
```

The server will automatically recreate and seed the database.
