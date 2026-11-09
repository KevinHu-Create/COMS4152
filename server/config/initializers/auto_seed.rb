# Auto create database and seed if empty
Rails.application.config.after_initialize do
  db_path = Rails.root.join('storage', 'development.sqlite3')
  schema_path = Rails.root.join('..', 'schema.sql')

  # Create database from schema if not exists
  unless File.exist?(db_path)
    puts "Database not found, creating from schema.sql..."
    FileUtils.mkdir_p(File.dirname(db_path))
    system("sqlite3 #{db_path} < #{schema_path}")
    puts "Database created!"
  end

  # Seed if users table is empty
  if ActiveRecord::Base.connection.table_exists?('users') && User.count == 0
    puts "Database is empty, running seeds..."
    Rails.application.load_seed
    puts "Seed data loaded!"
  end
rescue => e
  puts "Auto-seed skipped: #{e.message}"
end
