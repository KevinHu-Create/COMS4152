require "rails_helper"

RSpec.describe "Evaluations API", type: :request do
  let(:instructor) { create(:user, :instructor) }
  let(:presenter) { create(:user) }
  let(:student) { create(:user, name: "Alice") }
  let(:course) { create(:course, instructor: instructor) }
  let(:presentation) { create(:presentation, course: course, presenters: [presenter]) }
  let(:scores) { { clarity_score: 5, organization_score: 4, delivery_score: 4, overall_score: 5, comments: "Nice work" } }

  describe "POST /api/v1/presentations/:id/evaluations" do
    it "records a student's evaluation" do
      expect {
        post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
             params: scores, headers: auth_headers(student)
      }.to change(Evaluation, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json).to include("clarity" => 5, "organization" => 4, "delivery" => 4, "overall" => 5,
                              "comments" => "Nice work")
      expect(Evaluation.last.evaluator).to eq(student)
    end

    it "does not reveal the evaluator in the response" do
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
           params: scores, headers: auth_headers(student)
      expect(json).not_to have_key("evaluator")
    end

    it "ignores an evaluator_id sent by the client" do
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
           params: scores.merge(evaluator_id: instructor.user_id), headers: auth_headers(student)
      expect(Evaluation.last.evaluator).to eq(student)
    end

    it "stops a presenter from evaluating their own presentation" do
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
           params: scores, headers: auth_headers(presenter)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("You cannot evaluate your own presentation")
    end

    it "stops a second evaluation from the same person" do
      create(:evaluation, presentation: presentation, evaluator: student)
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
           params: scores, headers: auth_headers(student)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Evaluator has already submitted an evaluation")
    end

    it "rejects scores outside 1 to 5" do
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
           params: scores.merge(clarity_score: 9), headers: auth_headers(student)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects an evaluation with a missing score" do
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations",
           params: scores.except(:delivery_score), headers: auth_headers(student)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Delivery score can't be blank")
    end

    it "requires login" do
      post "/api/v1/presentations/#{presentation.presentation_id}/evaluations", params: scores
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 404 for a missing presentation" do
      post "/api/v1/presentations/999999/evaluations", params: scores, headers: auth_headers(student)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /api/v1/presentations/:id/evaluations" do
    before { create(:evaluation, presentation: presentation, evaluator: student) }

    it "lets an instructor see evaluations with evaluator names" do
      get "/api/v1/presentations/#{presentation.presentation_id}/evaluations", headers: auth_headers(instructor)

      expect(response).to have_http_status(:ok)
      expect(json.size).to eq(1)
      expect(json.first["evaluator"]).to eq("id" => student.user_id, "name" => "Alice")
    end

    it "forbids students from listing evaluations" do
      get "/api/v1/presentations/#{presentation.presentation_id}/evaluations", headers: auth_headers(student)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /api/v1/pending_evaluations" do
    before { create(:course_membership, course: course, user: student) }

    it "lists past and current presentations in the student's courses that still need an evaluation" do
      today = create(:presentation, course: course, title: "Today", presentation_date: Date.today, presenters: [presenter])
      past = create(:presentation, course: course, title: "Last week", presentation_date: Date.today - 7)

      get "/api/v1/pending_evaluations", headers: auth_headers(student)

      expect(response).to have_http_status(:ok)
      expect(json.map { |p| p["id"] }).to contain_exactly(today.presentation_id, past.presentation_id)
      expect(json.find { |p| p["id"] == today.presentation_id }["presenters"]).to eq([presenter.name])
    end

    it "leaves out presentations that are already evaluated, in the future, the user's own, or in other courses" do
      evaluated = create(:presentation, course: course)
      create(:evaluation, presentation: evaluated, evaluator: student)
      create(:presentation, course: course, presentation_date: Date.today + 3)
      create(:presentation, course: course, presenters: [student])
      create(:presentation) # another course

      get "/api/v1/pending_evaluations", headers: auth_headers(student)

      expect(json).to eq([])
    end
  end
end
