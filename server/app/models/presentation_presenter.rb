class PresentationPresenter < ApplicationRecord
  self.primary_key = [:presentation_id, :user_id]

  belongs_to :presentation, foreign_key: 'presentation_id'
  belongs_to :user, foreign_key: 'user_id'
end
