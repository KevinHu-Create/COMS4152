
User.create!([
  { user_id: 1, name: 'Demo Instructor', email: 'instructor@example.com', password_hash: 'DemoPass123!', global_role: 'instructor' },
  { user_id: 2, name: 'Demo Student 1', email: 'student1@example.com', password_hash: 'DemoPass123!', global_role: 'student' },
  { user_id: 3, name: 'Demo Student 2', email: 'student2@example.com', password_hash: 'DemoPass123!', global_role: 'student' },
  { user_id: 4, name: 'Demo TA', email: 'ta@example.com', password_hash: 'DemoPass123!', global_role: 'ta' },
  { user_id: 5, name: 'Demo Student 3', email: 'student3@example.com', password_hash: 'DemoPass123!', global_role: 'student' },
  { user_id: 6, name: 'Demo Student 4', email: 'student4@example.com', password_hash: 'DemoPass123!', global_role: 'student' }
])

Course.create!([
  {
    course_id: 1,
    course_code: 'COMS4152',
    term: 'Fall 2026',
    section: '001',
    title: 'COMS4152 Project',
    instructor_id: 1
  },
  {
    course_id: 2,
    course_code: 'COMS4152',
    term: 'Fall 2026',
    section: '002',
    title: 'COMS4152 Demo Section',
    instructor_id: 1
  }
])

CourseMembership.create!([
  { membership_id: 1, course_id: 1, user_id: 1, role_in_course: 'instructor' },
  { membership_id: 2, course_id: 1, user_id: 4, role_in_course: 'ta' },
  { membership_id: 3, course_id: 1, user_id: 2, role_in_course: 'student' },
  { membership_id: 4, course_id: 1, user_id: 3, role_in_course: 'student' },
  { membership_id: 5, course_id: 1, user_id: 5, role_in_course: 'student' },
  { membership_id: 6, course_id: 1, user_id: 6, role_in_course: 'student' }
])

Presentation.create!([
  {
    presentation_id: 1,
    course_id: 1,
    title: 'REST API Basics',
    description: 'Introduction to REST API design principles',
    presentation_date: '2026-11-09',
    start_time: '10:00',
    end_time: '10:10',
    location: 'Demo Room 101'
  },
  {
    presentation_id: 2,
    course_id: 1,
    title: 'OAuth Authentication',
    description: 'Understanding authentication flows for modern web apps',
    presentation_date: '2026-11-09',
    start_time: '10:15',
    end_time: '10:25',
    location: 'Demo Room 101'
  },
  {
    presentation_id: 3,
    course_id: 1,
    title: 'Database Indexing',
    description: 'How indexes improve query performance',
    presentation_date: '2026-11-16',
    start_time: '10:00',
    end_time: '10:10',
    location: 'Demo Room 101'
  }
])

PresentationPresenter.create!([
  { presentation_id: 1, user_id: 2 }, # Demo Student 1
  { presentation_id: 2, user_id: 3 }, # Demo Student 2
  { presentation_id: 3, user_id: 5 }  # Demo Student 3
])

Evaluation.create!([
  {
    evaluation_id: 1,
    presentation_id: 1,
    evaluator_id: 3,  # Demo Student 2 -> Demo Student 1
    clarity_score: 5,
    organization_score: 4,
    delivery_score: 5,
    overall_score: 5,
    comments: 'Very clear explanation! Presentation was well-structured.'
  },
  {
    evaluation_id: 2,
    presentation_id: 1,
    evaluator_id: 5,  # Demo Student 3 -> Demo Student 1
    clarity_score: 4,
    organization_score: 4,
    delivery_score: 4,
    overall_score: 4,
    comments: 'Good pacing and examples, but could add visual diagrams.'
  },
  {
    evaluation_id: 3,
    presentation_id: 2,
    evaluator_id: 2,  # Demo Student 1 -> Demo Student 2
    clarity_score: 5,
    organization_score: 5,
    delivery_score: 5,
    overall_score: 5,
    comments: 'Excellent explanation of OAuth flow and security implications!'
  },
  {
    evaluation_id: 4,
    presentation_id: 2,
    evaluator_id: 6,  # Demo Student 4 -> Demo Student 2
    clarity_score: 4,
    organization_score: 3,
    delivery_score: 4,
    overall_score: 4,
    comments: 'Good content but the slides were a bit text-heavy.'
  },
  {
    evaluation_id: 5,
    presentation_id: 3,
    evaluator_id: 2,  # Demo Student 1 -> Demo Student 3
    clarity_score: 5,
    organization_score: 4,
    delivery_score: 5,
    overall_score: 5,
    comments: 'Solid introduction to indexing, well demonstrated.'
  },
  {
    evaluation_id: 6,
    presentation_id: 3,
    evaluator_id: 3,  # Demo Student 2 -> Demo Student 3
    clarity_score: 4,
    organization_score: 4,
    delivery_score: 4,
    overall_score: 4,
    comments: 'Good, but would like to see more examples of composite indexes.'
  }
])

# The records above use explicit ids. PostgreSQL does not advance its id
# sequences for those, so move them past the seeded rows; otherwise the
# next signup would collide with user_id 1.
connection = ActiveRecord::Base.connection
if connection.adapter_name.match?(/postg/i)
  [User, Course, CourseMembership, Presentation, Evaluation].each do |model|
    connection.reset_pk_sequence!(model.table_name)
  end
end

puts "Seed data loaded successfully!"

