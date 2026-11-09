
CREATE TABLE users (
    user_id        INTEGER PRIMARY KEY,
    name           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    global_role    TEXT NOT NULL CHECK (global_role IN ('instructor', 'ta', 'student', 'admin'))
);

CREATE TABLE courses (
    course_id      INTEGER PRIMARY KEY,
    course_code    TEXT NOT NULL,
    term           TEXT NOT NULL,
    section        TEXT,
    title          TEXT NOT NULL,
    instructor_id  INTEGER NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(user_id)
);

CREATE TABLE course_memberships (
    membership_id  INTEGER PRIMARY KEY,
    course_id      INTEGER NOT NULL,
    user_id        INTEGER NOT NULL,
    role_in_course TEXT NOT NULL CHECK (role_in_course IN ('instructor', 'ta', 'student')),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (user_id)   REFERENCES users(user_id),
    UNIQUE (course_id, user_id)
);

CREATE TABLE presentations (
    presentation_id   INTEGER PRIMARY KEY,
    course_id         INTEGER NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT,
    presentation_date DATE NOT NULL,
    start_time        TEXT,
    end_time          TEXT,
    location          TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE presentation_presenters (
    presentation_id  INTEGER NOT NULL,
    user_id          INTEGER NOT NULL,
    PRIMARY KEY (presentation_id, user_id),
    FOREIGN KEY (presentation_id) REFERENCES presentations(presentation_id),
    FOREIGN KEY (user_id)         REFERENCES users(user_id)
);

CREATE TABLE evaluations (
    evaluation_id    INTEGER PRIMARY KEY,
    presentation_id  INTEGER NOT NULL,
    evaluator_id     INTEGER NOT NULL,
    submitted_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clarity_score    INTEGER,
    organization_score INTEGER,
    delivery_score   INTEGER,
    overall_score    INTEGER NOT NULL,
    comments         TEXT,
    FOREIGN KEY (presentation_id) REFERENCES presentations(presentation_id),
    FOREIGN KEY (evaluator_id)  REFERENCES users(user_id),
    UNIQUE (presentation_id, evaluator_id)
);
