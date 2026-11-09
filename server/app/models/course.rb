class Course < ApplicationRecord
  self.primary_key = 'course_id'

  belongs_to :instructor, class_name: 'User', foreign_key: 'instructor_id'

  has_many :course_memberships, foreign_key: 'course_id', dependent: :destroy
  has_many :members, through: :course_memberships, source: :user

  has_many :presentations, foreign_key: 'course_id', dependent: :destroy

  validates :course_code, :term, :title, presence: true
end
