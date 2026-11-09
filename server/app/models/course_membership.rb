class CourseMembership < ApplicationRecord
  self.primary_key = 'membership_id'

  belongs_to :course, foreign_key: 'course_id'
  belongs_to :user, foreign_key: 'user_id'

  validates :role_in_course, inclusion: { in: %w[instructor ta student] }
  validates :user_id, uniqueness: { scope: :course_id }
end
