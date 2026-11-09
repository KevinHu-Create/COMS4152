class Presentation < ApplicationRecord
  self.primary_key = 'presentation_id'

  belongs_to :course, foreign_key: 'course_id'

  has_many :presentation_presenters, foreign_key: 'presentation_id', dependent: :destroy
  has_many :presenters, through: :presentation_presenters, source: :user

  has_many :evaluations, foreign_key: 'presentation_id', dependent: :destroy

  validates :title, :presentation_date, presence: true

  def average_score
    evaluations.average(:overall_score)&.round(2)
  end

  def presenter?(user)
    presenters.include?(user)
  end
end
