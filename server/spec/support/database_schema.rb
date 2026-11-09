# The app has no Rails migrations: its schema lives in ../schema.sql
# (the same file the dev auto-seed initializer uses). Rebuild the test
# database from that file once per run so tests always match it.
module TestDatabaseSchema
  SCHEMA_PATH = Rails.root.join("..", "schema.sql")

  def self.load!
    conn = ActiveRecord::Base.connection
    conn.execute("PRAGMA foreign_keys = OFF")
    conn.tables.each { |t| conn.execute("DROP TABLE IF EXISTS #{conn.quote_table_name(t)}") }
    File.read(SCHEMA_PATH).split(";").map(&:strip).reject(&:empty?).each do |statement|
      conn.execute(statement)
    end
    conn.execute("PRAGMA foreign_keys = ON")
    ActiveRecord::Base.descendants.each(&:reset_column_information)
  end
end

TestDatabaseSchema.load!
