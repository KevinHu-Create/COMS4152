Given("a presentation titled {string} exists") do |title|
  @presentation = presentation_titled(title)
end

Given("{word} is a student in the course") do |name|
  student_named(name)
  visit "/events" # reload so the event form lists the new student
  expect(page).to have_content("Presentation Events")
end

Then("I should see its date and presenter") do
  card = find("h2", text: @presentation.title).ancestor("div.border")
  expect(card).to have_content("Date: #{@presentation.presentation_date.iso8601}")
  expect(card).to have_content("Presenter: #{@presentation.presenters.map(&:name).join(', ')}")
end

When("I enter {string} as the event title") do |title|
  field_after_label("Event Title", "input").set(title)
end

When("I select {string} as the date") do |date|
  # Date pickers can't be typed into reliably; set the value the way React expects.
  input = field_after_label("Date", "input")
  page.execute_script(<<~JS, input, date)
    const [el, value] = arguments;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  JS
end

When("I select {word} as the presenter") do |name|
  check name
end

Then("I should see {string} in the event list") do |title|
  expect(page).to have_no_content("Create New Event")
  expect(page).to have_css("h2", text: title)
end

Then("{word} should be listed as its presenter") do |name|
  presentation = Presentation.last
  card = find("h2", text: presentation.title).ancestor("div.border")
  expect(card).to have_content("Presenter: #{name}")
  expect(presentation.presenters.map(&:name)).to eq([name])
end

Then("I should still see the {string} form") do |heading|
  expect(page).to have_css("h3", text: heading)
end

Then("no presentation should have been created") do
  expect(Presentation.count).to eq(0)
end
