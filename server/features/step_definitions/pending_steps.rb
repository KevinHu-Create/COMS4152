Given("{string} was presented today") do |title|
  presentation_titled(title, date: Date.current)
end

Given("{string} was presented last week") do |title|
  presentation_titled(title, date: Date.current - 7)
end

Given("{string} is scheduled for next week") do |title|
  presentation_titled(title, date: Date.current + 7)
end

def pending_section
  find("section[aria-labelledby='pending-heading']")
end

Then("{string} should be waiting for my evaluation") do |title|
  expect(pending_section).to have_css("li", text: title)
end

Then("{string} should not be waiting for my evaluation") do |title|
  expect(pending_section).to have_no_css("li", text: title)
end

When("I click {string} for the waiting presentation {string}") do |button, title|
  pending_section.find("li", text: title).click_on(button)
end

Then("there should be no evaluation form") do
  expect(page).to have_no_button("Submit Evaluation")
  expect(page).to have_no_css("select")
end
