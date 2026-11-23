require "rails_helper"

RSpec.describe "Presentations API", type: :request do
  let(:instructor) { create(:user, :instructor) }
  let(:presenter) { create(:user, name: "Kevin") }
  let(:student) { create(:user, name: "Alice") }
  let(:course) { create(:course, instructor: instructor) }
  let(:presentation) { create(:presentation, course: course, title: "Team Demo", presenters: [presenter]) }
  let(:outsider) { create(:user, name: "Not Enrolled") }

  before do
    create(:course_membership, course: course, user: instructor, role_in_course: "instructor")
    create(:course_membership, course: course, user: presenter)
    create(:course_membership, course: course, user: student)
  end

  def course_ta
    create(:user, :ta).tap { |ta| create(:course_membership, course: course, user: ta, role_in_course: "ta") }
  end

  describe "GET /api/v1/courses/:course_id/presentations" do
    it "lists the course's presentations with presenter names" do
      presentation
      create(:presentation) # belongs to another course

      get "/api/v1/courses/#{course.course_id}/presentations", headers: auth_headers(student)

      expect(response).to have_http_status(:ok)
      expect(json.size).to eq(1)
      expect(json.first).to include("title" => "Team Demo", "presenter" => "Kevin")
    end

    it "tells each user how every event relates to them" do
      presentation
      evaluated = create(:presentation, course: course, title: "Already Evaluated")
      create(:evaluation, presentation: evaluated, evaluator: student)
      create(:presentation, course: course, title: "Next Week", presentation_date: Date.current + 7)

      get "/api/v1/courses/#{course.course_id}/presentations", headers: auth_headers(student)
      flags = json.to_h { |p| [p["title"], p.slice("isMine", "evaluatedByMe", "upcoming")] }

      expect(flags["Team Demo"]).to eq("isMine" => false, "evaluatedByMe" => false, "upcoming" => false)
      expect(flags["Already Evaluated"]).to eq("isMine" => false, "evaluatedByMe" => true, "upcoming" => false)
      expect(flags["Next Week"]).to eq("isMine" => false, "evaluatedByMe" => false, "upcoming" => true)

      get "/api/v1/courses/#{course.course_id}/presentations", headers: auth_headers(presenter)
      expect(json.find { |p| p["title"] == "Team Demo" }["isMine"]).to be true
    end

    it "hides the course's presentations from users who are not enrolled" do
      get "/api/v1/courses/#{course.course_id}/presentations", headers: auth_headers(outsider)
      expect(response).to have_http_status(:forbidden)
      expect(json["error"]).to eq("You are not a member of this course")
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

    it "is hidden from users who are not enrolled" do
      get "/api/v1/presentations/#{presentation.presentation_id}", headers: auth_headers(outsider)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/courses/:course_id/presentations" do
    let(:partner) { create(:user, name: "Sarah").tap { |u| create(:course_membership, course: course, user: u) } }
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
      expect(json["presenters"]).to contain_exactly({ "id" => presenter.user_id, "name" => "Kevin" },
                                                    { "id" => partner.user_id, "name" => "Sarah" })
      expect(json["courseId"]).to eq(course.course_id)
    end

    it "refuses presenters who are not in the course and saves nothing" do
      expect {
        post "/api/v1/courses/#{course.course_id}/presentations",
             params: params.merge(presenter_ids: [presenter.user_id, outsider.user_id]), headers: auth_headers(instructor)
      }.not_to change(Presentation, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to include("Presenters must be members of this course")
      expect(PresentationPresenter.count).to eq(0)
    end

    it "rejects an end time before the start time" do
      post "/api/v1/courses/#{course.course_id}/presentations",
           params: params.merge(start_time: "14:00", end_time: "13:30"), headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to include("End time must be after the start time")
    end

    it "lets a TA create a presentation without presenters" do
      post "/api/v1/courses/#{course.course_id}/presentations",
           params: params.except(:presenter_ids), headers: auth_headers(course_ta)
      expect(response).to have_http_status(:created)
      expect(json["presenter"]).to eq("")
    end

    it "rejects a presentation without a date" do
      post "/api/v1/courses/#{course.course_id}/presentations",
           params: params.except(:presentation_date), headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to include("Presentation date can't be blank")
    end

    it "forbids an instructor who does not teach this course" do
      post "/api/v1/courses/#{course.course_id}/presentations",
           params: params, headers: auth_headers(create(:user, :instructor))
      expect(response).to have_http_status(:forbidden)
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

    it "replaces the presenters" do
      newcomer = create(:user, name: "Sarah")
      create(:course_membership, course: course, user: newcomer)

      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { presenter_ids: [newcomer.user_id] }, headers: auth_headers(instructor), as: :json

      expect(response).to have_http_status(:ok)
      expect(presentation.reload.presenters).to contain_exactly(newcomer)
      expect(json["presenter"]).to eq("Sarah")
    end

    it "removes every presenter when given an empty list" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { presenter_ids: [] }, headers: auth_headers(instructor), as: :json
      expect(presentation.reload.presenters).to be_empty
    end

    it "keeps the presenters when presenter_ids is not sent" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { location: "Online" }, headers: auth_headers(instructor), as: :json
      expect(presentation.reload.presenters).to contain_exactly(presenter)
    end

    it "keeps the old details when the new presenters are invalid" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { title: "Changed", presenter_ids: [outsider.user_id] }, headers: auth_headers(instructor), as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(presentation.reload.title).to eq("Team Demo")
      expect(presentation.presenters).to contain_exactly(presenter)
    end

    it "updates the time and description" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { start_time: "09:00", end_time: "09:20", description: "Updated agenda" },
            headers: auth_headers(instructor), as: :json
      expect(presentation.reload).to have_attributes(start_time: "09:00", end_time: "09:20", description: "Updated agenda")
    end

    it "rejects a blank title" do
      patch "/api/v1/presentations/#{presentation.presentation_id}",
            params: { title: "" }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_content)
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

      it "lets a TA of the course view stats" do
        get "/api/v1/presentations/#{presentation.presentation_id}/stats", headers: auth_headers(course_ta)
        expect(response).to have_http_status(:ok)
      end

      it "forbids an instructor of a different course from viewing stats" do
        get "/api/v1/presentations/#{presentation.presentation_id}/stats",
            headers: auth_headers(create(:user, :instructor))
        expect(response).to have_http_status(:forbidden)
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
