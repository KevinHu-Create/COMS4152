# Sets an input the way React expects. Works for time and text inputs, and
# for labels with or without a "for" attribute.
When("I set the {string} field to {string}") do |label, value|
  input = page.has_field?(label, wait: 0) ? find_field(label) : field_after_label(label, "input")
  page.execute_script(<<~JS, input, value)
    const [el, value] = arguments;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  JS
end

When("I check {string}") do |label|
  check label
end

When("I uncheck {string}") do |label|
  uncheck label
end

When("I open the edit page for {string}") do |title|
  visit "/event/edit/#{Presentation.find_by!(title: title).presentation_id}"
end

When("I delete the event and confirm") do
  accept_confirm { click_on "Delete Event" }
end

When("I delete the event but cancel") do
  dismiss_confirm { click_on "Delete Event" }
end

Then("the card for {string} should show {string}") do |title, text|
  card = find("h2", text: title).ancestor("div.border")
  expect(card).to have_content(text)
end

Then("the presentation {string} should be unchanged") do |title|
  presentation = Presentation.find_by!(title: title)
  expect(presentation.start_time).to eq("10:00")
  expect(presentation.end_time).to eq("10:15")
end

Then("the presentation {string} should no longer exist") do |title|
  expect(Presentation.exists?(title: title)).to be false
end

Then("I should still be on the edit page for {string}") do |title|
  expect(page).to have_css("h1", text: "Edit Event")
  expect(page).to have_field("Event Title", with: title)
  expect(Presentation.exists?(title: title)).to be true
end
