class Evaluation < ApplicationRecord
  self.primary_key = 'evaluation_id'

  belongs_to :presentation, foreign_key: 'presentation_id'
  belongs_to :evaluator, class_name: 'User', foreign_key: 'evaluator_id'

  validates :clarity_score, :organization_score, :delivery_score, :overall_score,
            presence: true, inclusion: { in: 1..5 }
  validates :evaluator_id, uniqueness: { scope: :presentation_id, message: "has already submitted an evaluation" }

  validate :cannot_evaluate_own_presentation

  private

  def cannot_evaluate_own_presentation
    if presentation&.presenter?(evaluator)
      errors.add(:base, "You cannot evaluate your own presentation")
    end
  end
end
