# Rails version of ../schema.sql, used to create the production (PostgreSQL)
# database with `rails db:prepare`. Keep the two files in sync.
ActiveRecord::Schema[7.1].define(version: 2026_11_09_000000) do
  create_table "users", primary_key: "user_id", force: :cascade do |t|
    t.text "name", null: false
    t.text "email", null: false
    t.text "password_hash", null: false
    t.text "global_role", null: false
    t.index ["email"], unique: true
    t.check_constraint "global_role IN ('instructor', 'ta', 'student', 'admin')", name: "users_global_role_check"
  end

  create_table "courses", primary_key: "course_id", force: :cascade do |t|
    t.text "course_code", null: false
    t.text "term", null: false
    t.text "section"
    t.text "title", null: false
    t.bigint "instructor_id", null: false
  end

  create_table "course_memberships", primary_key: "membership_id", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.bigint "user_id", null: false
    t.text "role_in_course", null: false
    t.index ["course_id", "user_id"], unique: true
    t.check_constraint "role_in_course IN ('instructor', 'ta', 'student')", name: "course_memberships_role_check"
  end

  create_table "presentations", primary_key: "presentation_id", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.text "title", null: false
    t.text "description"
    t.date "presentation_date", null: false
    t.text "start_time"
    t.text "end_time"
    t.text "location"
  end

  create_table "presentation_presenters", primary_key: ["presentation_id", "user_id"], force: :cascade do |t|
    t.bigint "presentation_id", null: false
    t.bigint "user_id", null: false
  end

  create_table "evaluations", primary_key: "evaluation_id", force: :cascade do |t|
    t.bigint "presentation_id", null: false
    t.bigint "evaluator_id", null: false
    t.datetime "submitted_at", null: false, default: -> { "CURRENT_TIMESTAMP" }
    t.integer "clarity_score"
    t.integer "organization_score"
    t.integer "delivery_score"
    t.integer "overall_score", null: false
    t.text "comments"
    t.index ["presentation_id", "evaluator_id"], unique: true
  end

  add_foreign_key "courses", "users", column: "instructor_id", primary_key: "user_id"
  add_foreign_key "course_memberships", "courses", column: "course_id", primary_key: "course_id"
  add_foreign_key "course_memberships", "users", column: "user_id", primary_key: "user_id"
  add_foreign_key "presentations", "courses", column: "course_id", primary_key: "course_id"
  add_foreign_key "presentation_presenters", "presentations", column: "presentation_id", primary_key: "presentation_id"
  add_foreign_key "presentation_presenters", "users", column: "user_id", primary_key: "user_id"
  add_foreign_key "evaluations", "presentations", column: "presentation_id", primary_key: "presentation_id"
  add_foreign_key "evaluations", "users", column: "evaluator_id", primary_key: "user_id"
end
