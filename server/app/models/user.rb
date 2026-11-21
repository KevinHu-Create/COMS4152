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

  # Passwords are stored as bcrypt hashes in the existing password_hash
  # column. has_secure_password provides #password=, #authenticate and the
  # presence / 72-byte checks.
  alias_attribute :password_digest, :password_hash
  has_secure_password
  validates :password, length: { minimum: 6 }, allow_nil: true

  # Replaces any password still stored in plain text (from before passwords
  # were hashed) with its bcrypt hash. Safe to run more than once.
  def self.hash_plaintext_passwords!
    where.not("password_hash LIKE ?", "$2%").find_each do |user|
      user.update_column(:password_hash, BCrypt::Password.create(user.password_hash))
    end
  end
end
