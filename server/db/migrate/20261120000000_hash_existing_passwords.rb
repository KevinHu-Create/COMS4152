# Existing databases (Heroku) stored passwords in plain text. Hash them in
# place; the column keeps its name and now really holds a bcrypt hash.
class HashExistingPasswords < ActiveRecord::Migration[7.1]
  def up
    User.reset_column_information
    User.hash_plaintext_passwords!
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
