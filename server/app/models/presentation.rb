class Presentation < ApplicationRecord
  self.primary_key = 'presentation_id'

  belongs_to :course, foreign_key: 'course_id'

  has_many :presentation_presenters, foreign_key: 'presentation_id', dependent: :destroy
  has_many :presenters, through: :presentation_presenters, source: :user

  has_many :evaluations, foreign_key: 'presentation_id', dependent: :destroy

  TIME_FORMAT = /\A([01]\d|2[0-3]):[0-5]\d\z/

  validates :title, :presentation_date, presence: true
  validates :start_time, :end_time, format: { with: TIME_FORMAT, message: "must look like 14:30" }, allow_blank: true
  validate :end_time_after_start_time

  def average_score
    evaluations.average(:overall_score)&.round(2)
  end

  def presenter?(user)
    presenters.include?(user)
  end

  private

  # Times are stored as "HH:MM" text, so string comparison orders them.
  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?
    return unless start_time.match?(TIME_FORMAT) && end_time.match?(TIME_FORMAT)

    errors.add(:end_time, "must be after the start time") if end_time <= start_time
  end
end
