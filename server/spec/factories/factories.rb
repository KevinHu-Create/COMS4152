FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "Student #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password_hash { "password123" }
    global_role { "student" }

    trait(:instructor) { global_role { "instructor" } }
    trait(:ta)         { global_role { "ta" } }
    trait(:admin)      { global_role { "admin" } }
  end

  factory :course do
    course_code { "COMS4152" }
    term { "Fall 2026" }
    section { "001" }
    sequence(:title) { |n| "Engineering Software-as-a-Service #{n}" }
    association :instructor, factory: [:user, :instructor]
  end

  factory :course_membership do
    course
    user
    role_in_course { "student" }
  end

  factory :presentation do
    course
    sequence(:title) { |n| "Presentation #{n}" }
    description { "Iteration demo" }
    presentation_date { Date.today }
    start_time { "10:00" }
    end_time { "10:15" }
    location { "Room 101" }

    transient do
      presenters { [] }
    end

    after(:create) do |presentation, ctx|
      ctx.presenters.each do |user|
        create(:presentation_presenter, presentation: presentation, user: user)
      end
      presentation.presenters.reset
    end
  end

  factory :presentation_presenter do
    presentation
    user
  end

  factory :evaluation do
    presentation
    association :evaluator, factory: :user
    clarity_score { 4 }
    organization_score { 4 }
    delivery_score { 3 }
    overall_score { 4 }
    comments { "Clear and well organized." }
  end
end
