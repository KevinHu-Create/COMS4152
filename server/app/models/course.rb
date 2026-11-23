class Course < ApplicationRecord
  self.primary_key = 'course_id'

  belongs_to :instructor, class_name: 'User', foreign_key: 'instructor_id'

  has_many :course_memberships, foreign_key: 'course_id', dependent: :destroy
  has_many :members, through: :course_memberships, source: :user

  has_many :presentations, foreign_key: 'course_id', dependent: :destroy

  validates :course_code, :term, :title, presence: true

  STAFF_ROLES = %w[admin instructor ta].freeze

  # The user's role in this course: "admin" (site admin), "instructor",
  # "ta", "student", or nil when the user is not part of the course.
  def role_for(user)
    return nil unless user
    return "admin" if user.global_role == "admin"
    return "instructor" if instructor_id == user.user_id

    course_memberships.find_by(user_id: user.user_id)&.role_in_course
  end

  def member?(user)
    role_for(user).present?
  end

  # Instructors, TAs and admins manage the course's events and members.
  def staff?(user)
    STAFF_ROLES.include?(role_for(user))
  end
end
