# Coverage is merged with RSpec's into coverage/index.html (see .simplecov).
require "simplecov"
SimpleCov.command_name "Cucumber"
SimpleCov.start "rails"

# Cucumber runs the real React frontend in headless Chrome (via Cuprite)
# against this Rails API, so every scenario exercises the full stack.
require "cucumber/rails"
require "capybara/cuprite"
require_relative "../../spec/support/database_schema"
require_relative "frontend_app"

# --- Browser -----------------------------------------------------------
Capybara.register_driver(:cuprite) do |app|
  Capybara::Cuprite::Driver.new(
    app,
    window_size: [1280, 900],
    headless: ENV["HEADLESS"] != "false", # HEADLESS=false to watch the browser
    process_timeout: 30,
    timeout: 15,
    # GitHub Actions runners need Chrome's sandbox turned off.
    browser_options: ENV["CI"] ? { "no-sandbox" => nil, "disable-dev-shm-usage" => nil } : {}
  )
end
Capybara.default_driver = :cuprite
Capybara.javascript_driver = :cuprite
Capybara.server = :puma, { Silent: true }
Capybara.default_max_wait_time = 5

# --- Frontend ----------------------------------------------------------
FrontendApp.build!
Capybara.app = FrontendApp.rack_app

# --- Database ----------------------------------------------------------
# The browser talks to a server running in another thread, so scenarios
# cannot share a transaction; wipe the tables after each one instead.
Cucumber::Rails::Database.autorun_database_cleaner = false
DatabaseCleaner.strategy = :deletion

Before do
  DatabaseCleaner.start
end

After do
  ActiveRecord::Base.connection.disable_referential_integrity { DatabaseCleaner.clean }
end

World(FactoryBot::Syntax::Methods)
