-- Fictional COMS4152 demo data. Keep in sync with server/db/seeds.rb.
PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

INSERT INTO users (user_id, name, email, password_hash, global_role)
VALUES
(1, 'Demo Instructor', 'instructor@example.com', 'DemoPass123!', 'instructor'),
(2, 'Demo Student 1', 'student1@example.com', 'DemoPass123!', 'student'),
(3, 'Demo Student 2', 'student2@example.com', 'DemoPass123!', 'student'),
(4, 'Demo TA', 'ta@example.com', 'DemoPass123!', 'ta'),
(5, 'Demo Student 3', 'student3@example.com', 'DemoPass123!', 'student'),
(6, 'Demo Student 4', 'student4@example.com', 'DemoPass123!', 'student');

INSERT INTO courses (course_id, course_code, term, section, title, instructor_id)
VALUES
(1, 'COMS4152', 'Fall 2026', '001', 'COMS4152 Project', 1),
(2, 'COMS4152', 'Fall 2026', '002', 'COMS4152 Demo Section', 1);

INSERT INTO course_memberships (membership_id, course_id, user_id, role_in_course)
VALUES
(1, 1, 1, 'instructor'),
(2, 1, 4, 'ta'),
(3, 1, 2, 'student'),
(4, 1, 3, 'student'),
(5, 1, 5, 'student'),
(6, 1, 6, 'student');

INSERT INTO presentations (presentation_id, course_id, title, description, presentation_date, start_time, end_time, location)
VALUES
(1, 1, 'REST API Basics', 'Introduction to REST API design principles', '2026-11-09', '10:00', '10:10', 'Demo Room 101'),
(2, 1, 'OAuth Authentication', 'Understanding authentication flows for modern web apps', '2026-11-09', '10:15', '10:25', 'Demo Room 101'),
(3, 1, 'Database Indexing', 'How indexes improve query performance', '2026-11-16', '10:00', '10:10', 'Demo Room 101');

INSERT INTO presentation_presenters (presentation_id, user_id)
VALUES
(1, 2),
(2, 3),
(3, 5);

INSERT INTO evaluations (evaluation_id, presentation_id, evaluator_id, clarity_score, organization_score, delivery_score, overall_score, comments)
VALUES
(1, 1, 3, 5, 4, 5, 5, 'Very clear explanation! Presentation was well-structured.'),
(2, 1, 5, 4, 4, 4, 4, 'Good pacing and examples, but could add visual diagrams.'),
(3, 2, 2, 5, 5, 5, 5, 'Excellent explanation of OAuth flow and security implications!'),
(4, 2, 6, 4, 3, 4, 4, 'Good content but the slides were a bit text-heavy.'),
(5, 3, 2, 5, 4, 5, 5, 'Solid introduction to indexing, well demonstrated.'),
(6, 3, 3, 4, 4, 4, 4, 'Good, but would like to see more examples of composite indexes.');

COMMIT;
