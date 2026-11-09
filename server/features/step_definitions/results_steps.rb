CATEGORY_COLUMNS = {
  "Clarity" => :clarity_score,
  "Organization" => :organization_score,
  "Delivery" => :delivery_score,
  "Overall" => :overall_score
}.freeze

# --- Presenter feedback ------------------------------------------------

Given("my presentation has received an evaluation") do
  @presentation = presentation_titled("Final Project Demo", presenters: [@me])
  @evaluator = student_named("Michael Lee")
  @evaluation = create(:evaluation, presentation: @presentation, evaluator: @evaluator,
                                    clarity_score: 5, organization_score: 4, delivery_score: 3,
                                    overall_score: 4, comments: nil)
end

Given("the evaluation includes the comment {string}") do |comment|
  @evaluation.update!(comments: comment)
end

Then("I should see my presentation title") do
  expect(page).to have_css("h2", text: @presentation.title)
end

Then("I should not see the evaluator's name") do
  expect(page).to have_no_content(@evaluator.name)
end

# --- Instructor results ------------------------------------------------

Given("{string} has received evaluations") do |title|
  @presentation = presentation_titled(title)
  create(:evaluation, presentation: @presentation, evaluator: student_named("Alice Johnson"),
                      clarity_score: 5, organization_score: 4, delivery_score: 4, overall_score: 5,
                      comments: "Great pacing")
  create(:evaluation, presentation: @presentation, evaluator: student_named("Sarah Kim"),
                      clarity_score: 3, organization_score: 4, delivery_score: 2, overall_score: 3,
                      comments: nil)
end

When("I click {string} for {string}") do |button, title|
  visit "/events" # pick up presentations created after signing in
  find("h2", text: title).ancestor("div.border").click_on(button)
end

When("I open the results page for {string}") do |title|
  visit "/admin/results/#{Presentation.find_by!(title: title).presentation_id}"
end

Then("I should see the total number of evaluations") do
  expect(page).to have_content("Admin Results - #{@presentation.title}")
  expect(value_below("Total evaluations")).to eq(@presentation.evaluations.count.to_s)
end

Then("I should see the average score for each evaluation category") do
  CATEGORY_COLUMNS.each do |label, column|
    expect(value_below(label)).to eq(expected_average(@presentation, column))
  end
end

Then("I should see the individual evaluations") do
  expect(page).to have_content("Individual Evaluations")
  @presentation.evaluations.each do |evaluation|
    row = find("tbody tr", text: evaluation.evaluator.name)
    expect(row).to have_css("td", text: evaluation.overall_score.to_s)
    expect(row).to have_content(evaluation.comments || "-")
  end
end
