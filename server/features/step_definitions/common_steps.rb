# Generic navigation and page-content steps shared by every feature.

When("I click {string}") do |text|
  click_on text
end

When("I fill in {string} with {string}") do |field, value|
  fill_in field, with: value
end

When("I visit the presentation events page") do
  visit "/events"
end

Then("I should see {string}") do |text|
  expect(page).to have_content(text)
end

Then("I should not see {string}") do |text|
  expect(page).to have_no_content(text)
end

Then("I should see the {string} page") do |heading|
  expect(page).to have_css("h1", text: heading)
  expect(page).to have_current_path("/events")
end
