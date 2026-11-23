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

  def upcoming?
    presentation_date.present? && presentation_date > Date.current
  end

  # Presentations the user should still evaluate: in one of their courses,
  # already held (today or earlier), not their own, not yet evaluated.
  def self.pending_for(user, course_id: nil)
    scope = where(course_id: user.course_memberships.select(:course_id))
            .where.not(presentation_id: user.evaluations.select(:presentation_id))
            .where.not(presentation_id: user.presentation_presenters.select(:presentation_id))
            .where("presentation_date <= ?", Date.current)
    scope = scope.where(course_id: course_id) if course_id.present?
    scope.order(:presentation_date, :start_time)
  end

  private

  # Times are stored as "HH:MM" text, so string comparison orders them.
  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?
    return unless start_time.match?(TIME_FORMAT) && end_time.match?(TIME_FORMAT)

    errors.add(:end_time, "must be after the start time") if end_time <= start_time
  end
end
