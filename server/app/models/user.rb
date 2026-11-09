class User < ApplicationRecord
  self.primary_key = 'user_id'

  has_many :course_memberships, foreign_key: 'user_id', dependent: :destroy
  has_many :courses, through: :course_memberships

  has_many :instructed_courses, class_name: 'Course', foreign_key: 'instructor_id'

  has_many :presentation_presenters, foreign_key: 'user_id', dependent: :destroy
  has_many :presentations, through: :presentation_presenters

  has_many :evaluations, foreign_key: 'evaluator_id', dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :global_role, inclusion: { in: %w[instructor ta student admin] }

  def authenticate(password)
    password_hash == password
  end
end
