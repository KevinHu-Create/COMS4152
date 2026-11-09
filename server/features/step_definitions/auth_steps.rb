Given("I have a registered account") do
  @me = student_named("Alice Johnson")
end

Given("I am on the login page") do
  visit "/login"
end

Given("I am signed in as a student") do
  @me = student_named("Alice Johnson")
  sign_in_as(@me)
end

Given("I am signed in as a presenter") do
  @me = student_named("Kevin Hu")
  sign_in_as(@me)
end

Given("I am signed in as an instructor") do
  course # make sure the course exists before the event list loads
  @me = instructor_account
  sign_in_as(@me)
end

When("I enter my correct email and password") do
  fill_in "Email", with: @me.email
  fill_in "Password", with: ScenarioHelpers::PASSWORD
end

When("I enter my email with the password {string}") do |password|
  fill_in "Email", with: @me.email
  fill_in "Password", with: password
end

When("I fill in {string} with my email") do |field|
  fill_in field, with: @me.email
end

Then("I should still be on the login page") do
  expect(page).to have_current_path("/login")
  expect(page).to have_button("Sign In")
end
