require "rails_helper"

RSpec.describe "Presentations API", type: :request do
  let(:instructor) { create(:user, :instructor) }
  let(:presenter) { create(:user, name: "Kevin") }
  let(:student) { create(:user, name: "Alice") }
  let(:course) { create(:course, instructor: instructor) }
  let(:presentation) { create(:presentation, course: course, title: "Team Demo", presenters: [presenter]) }

  describe "GET /api/v1/courses/:course_id/presentations" do
    it "lists the course's presentations with presenter names" do
      presentation
      create(:presentation) # belongs to another course

      get "/api/v1/courses/#{course.course_id}/presentations", headers: auth_headers(student)

      expect(response).to have_http_status(:ok)
      expect(json.size).to eq(1)
      expect(json.first).to include("title" => "Team Demo", "presenter" => "Kevin")
    end
  end

  describe "GET /api/v1/presentations/:id" do
    it "returns the presentation details" do
      get "/api/v1/presentations/#{presentation.presentation_id}", headers: auth_headers(student)
      expect(response).to have_http_status(:ok)
      expect(json).to include("id" => presentation.presentation_id, "location" => "Room 101", "startTime" => "10:00")
    end

    it "returns 404 for a missing presentation" do
      get "/api/v1/presentations/999999", headers: auth_headers(student)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/courses/:course_id/presentations" do
    let(:partner) { create(:user, name: "Sarah") }
    let(:params) do
      { title: "Final Pitch", presentation_date: "2026-12-01", start_time: "14:00",
        location: "Mudd 535", presenter_ids: [presenter.user_id, partner.user_id] }
    end

    it "lets an instructor create a presentation with several presenters" do
      expect { post "/api/v1/courses/#{course.course_id}/presentations", params: params, headers: auth_headers(instructor) }
        .to change(Presentation, :count).by(1)

      expect(response).to have_http_status(:created)
      created = Presentation.find(json["id"])
      expect(created.presenters).to contain_exactly(presenter, partner)
      expect(created.presentation_date).to eq(Date.new(2026, 12, 1))
    end

    it "lets a TA create a presentation without presenters" do
      post "/api/v1/courses/#{course.course_id}/presentations",
           params: params.except(:presenter_ids), headers: auth_headers(create(:user, :ta))
      expect(response).to have_http_status(:created)
      expect(json["presenter"]).to eq("")
    end

    it "rejects a presentation without a date" do
      post "/api/v1/courses/#{course.course_id}/presentations",
           params: params.except(:presentation_date), headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Presentation date can't be blank")
    end

    it "forbids students from creating presentations" do
      expect { post "/api/v1/courses/#{course.course_id}/presentations", params: params, headers: auth_headers(student) }
        .not_to change(Presentation, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 404 for a course that does not exist" do
      post "/api/v1/courses/999999/presentations", params: params, headers: auth_headers(instructor)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /api/v1/presentations/:id" do
    it "lets an instructor update a presentation" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { title: "Renamed Demo", location: "Online" }, headers: auth_headers(instructor)

      expect(response).to have_http_status(:ok)
      expect(presentation.reload).to have_attributes(title: "Renamed Demo", location: "Online")
    end

    it "rejects a blank title" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { title: "" }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(presentation.reload.title).to eq("Team Demo")
    end

    it "forbids students from editing presentations" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { title: "Hacked" }, headers: auth_headers(student)
      expect(response).to have_http_status(:forbidden)
      expect(presentation.reload.title).to eq("Team Demo")
    end
  end

  describe "DELETE /api/v1/presentations/:id" do
    it "lets an instructor delete a presentation" do
      presentation
      expect { delete "/api/v1/presentations/#{presentation.presentation_id}", headers: auth_headers(instructor) }
        .to change(Presentation, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "forbids students from deleting presentations" do
      presentation
      expect { delete "/api/v1/presentations/#{presentation.presentation_id}", headers: auth_headers(student) }
        .not_to change(Presentation, :count)
      expect(response).to have_http_status(:forbidden)
    end
  end

  context "with submitted evaluations" do
    before do
      create(:evaluation, presentation: presentation, evaluator: student,
                          clarity_score: 5, organization_score: 4, delivery_score: 3, overall_score: 5,
                          comments: "Great slides")
      create(:evaluation, presentation: presentation, evaluator: create(:user, name: "Michael"),
                          clarity_score: 4, organization_score: 4, delivery_score: 4, overall_score: 4,
                          comments: nil)
    end

    describe "GET /api/v1/presentations/:id/feedback" do
      it "shows the presenter averaged, anonymous feedback" do
        get "/api/v1/presentations/#{presentation.presentation_id}/feedback", headers: auth_headers(presenter)

        expect(response).to have_http_status(:ok)
        expect(json).to include("avgClarity" => 4.5, "avgOrganization" => 4.0, "avgDelivery" => 3.5,
                                "avgOverall" => 4.5, "evaluationCount" => 2, "comments" => ["Great slides"])
        expect(response.body).not_to include("Alice")
        expect(response.body).not_to include("Michael")
      end

      it "hides the feedback from anyone who is not a presenter" do
        get "/api/v1/presentations/#{presentation.presentation_id}/feedback", headers: auth_headers(student)
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe "GET /api/v1/presentations/:id/stats" do
      it "shows instructors every evaluation with evaluator names" do
        get "/api/v1/presentations/#{presentation.presentation_id}/stats", headers: auth_headers(instructor)

        expect(response).to have_http_status(:ok)
        expect(json["evaluations"].map { |e| e["evaluatorName"] }).to contain_exactly("Alice", "Michael")
        expect(json["stats"]).to include("avgOverall" => 4.5, "totalEvaluations" => 2)
      end

      it "forbids students from viewing stats" do
        get "/api/v1/presentations/#{presentation.presentation_id}/stats", headers: auth_headers(student)
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe "GET /api/v1/my_presentations" do
      it "lists the user's own presentations with their scores" do
        get "/api/v1/my_presentations", headers: auth_headers(presenter)

        expect(response).to have_http_status(:ok)
        expect(json.size).to eq(1)
        expect(json.first).to include("title" => "Team Demo", "course" => "COMS4152",
                                      "avgOverall" => 4.5, "evaluationCount" => 2)
      end

      it "is empty for a user who has not presented" do
        get "/api/v1/my_presentations", headers: auth_headers(student)
        expect(json).to eq([])
      end
    end
  end

  describe "GET /api/v1/presentations/:id/stats with no evaluations" do
    it "returns empty stats" do
      get "/api/v1/presentations/#{presentation.presentation_id}/stats", headers: auth_headers(instructor)
      expect(json["evaluations"]).to eq([])
      expect(json["stats"]).to include("avgOverall" => nil, "totalEvaluations" => 0)
    end
  end
end
