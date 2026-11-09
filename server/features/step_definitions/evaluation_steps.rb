SCORE_CATEGORIES = [
  "Clarity of explanation",
  "Organization of presentation",
  "Delivery & engagement",
  "Overall quality"
].freeze

def choose_score(category, score)
  field_after_label(category, "select").find("option[value='#{score}']").select_option
end

Given("I am viewing the evaluation form for {string}") do |title|
  @presentation = presentation_titled(title)
  visit "/evaluation/#{@presentation.presentation_id}"
  expect(page).to have_css("h1", text: "Submit Evaluation")
  expect(page).to have_content("Event: #{title}")
end

Given("I am not a presenter for this presentation") do
  expect(@presentation.presenter?(@me)).to be false
end

Given("I have not evaluated this presentation before") do
  expect(Evaluation.exists?(presentation: @presentation, evaluator: @me)).to be false
end

Given("I am a presenter for {string}") do |title|
  @presentation = presentation_titled(title, presenters: [@me])
end

Given("I have already evaluated {string}") do |title|
  @presentation = presentation_titled(title)
  create(:evaluation, presentation: @presentation, evaluator: @me)
end

When("I select the following scores:") do |table|
  table.hashes.each { |row| choose_score(row["Category"], row["Score"]) }
end

When("I give every category a score of {int}") do |score|
  SCORE_CATEGORIES.each { |category| choose_score(category, score) }
end

When("I enter {string} as my comment") do |comment|
  find("textarea").set(comment)
end

Then("my evaluation should be saved with an overall score of {int}") do |score|
  evaluation = Evaluation.find_by!(presentation: @presentation, evaluator: @me)
  expect(evaluation.overall_score).to eq(score)
  expect(evaluation.comments).to eq("Clear explanations and helpful examples.")
end

Then("no evaluation should have been saved") do
  expect(@presentation.evaluations.count).to eq(0)
end
