module ScenarioHelpers
  PASSWORD = "Password123!"

  # The frontend currently always works with course 1.
  def course
    @course ||= Course.find_by(course_id: 1) ||
                create(:course, course_id: 1, title: "Engineering SaaS", instructor: instructor_account)
  end

  def instructor_account
    @instructor_account ||= create(:user, :instructor, name: "Professor Smith",
                                                       email: "smith@example.com", password_hash: PASSWORD)
  end

  # Finds or creates a student called +name+ who is enrolled in the course.
  def student_named(name)
    @people ||= {}
    @people[name] ||= begin
      user = create(:user, name: name, email: "#{name.parameterize}@example.com", password_hash: PASSWORD)
      create(:course_membership, course: course, user: user, role_in_course: "student")
      user
    end
  end

  def presentation_titled(title, presenters: [student_named("Bob Lee")], date: Date.new(2026, 11, 20))
    Presentation.find_by(title: title) ||
      create(:presentation, course: course, title: title, presentation_date: date, presenters: presenters)
  end

  def sign_in_as(user)
    visit "/login"
    fill_in "Email", with: user.email
    fill_in "Password", with: PASSWORD
    click_button "Sign In"
    expect(page).to have_content("Presentation Events")
    @current_user = user
  end

  def field_after_label(label, tag)
    find(:xpath, "//label[starts-with(normalize-space(), #{xpath_literal(label)})]/following-sibling::#{tag}[1]")
  end

  # Value shown next to a heading like "Clarity" or "Total evaluations".
  def value_below(label)
    find(:xpath, "//p[normalize-space()=#{xpath_literal(label)}]/following-sibling::p[1]").text.strip
  end

  def xpath_literal(text)
    text.include?("'") ? %("#{text}") : "'#{text}'"
  end

  def expected_average(presentation, column)
    format("%.1f", presentation.evaluations.average(column).to_f)
  end
end

World(ScenarioHelpers)

# Like the seeded app, every scenario starts with the course in place.
Before do
  course
end
