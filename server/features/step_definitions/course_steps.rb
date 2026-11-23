Given("I am also enrolled in {string} titled {string}") do |code, title|
  other = create(:course, course_code: code, title: title, term: "Fall 2026", section: "001")
  create(:course_membership, course: other, user: @me)
end

Given("{string} is scheduled in {string}") do |title, code|
  create(:presentation, course: Course.find_by!(course_code: code), title: title)
end

When("I choose the course {string}") do |code|
  find("#course-select").find("option", text: /\A#{Regexp.escape(code)}/).select_option
end

Then("the selected course should be {string}") do |label|
  expect(page).to have_select("Course", selected: label)
end

Given("{string} has an account with the email {string}") do |name, email|
  create(:user, name: name, email: email, password: ScenarioHelpers::PASSWORD)
end

Given("I am signed in as {string}") do |email|
  @me = User.find_by!(email: email)
  sign_in_as(@me)
end

When("I select {string} from {string}") do |option, field|
  select option, from: field
end

When("I open the members page for the course") do
  visit "/courses/#{course.course_id}/members"
end

When("I open the evaluation form for {string}") do |title|
  visit "/evaluation/#{Presentation.find_by!(title: title).presentation_id}"
end

When("I remove {string} from the course") do |name|
  accept_confirm("Remove #{name} from this course?") do
    find("tbody tr", text: name).click_on("Remove")
  end
end

When("I start removing {string} but cancel") do |name|
  dismiss_confirm("Remove #{name} from this course?") do
    find("tbody tr", text: name).click_on("Remove")
  end
end

Then("{string} should be listed as {string}") do |name, role|
  row = find("tbody tr", text: name)
  expect(row).to have_css("td", exact_text: role)
end

Then("{string} should not be listed as a member") do |name|
  expect(page).to have_no_css("tbody tr", text: name)
end
