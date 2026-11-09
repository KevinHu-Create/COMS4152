require "rails_helper"

RSpec.describe "Courses API", type: :request do
  let(:instructor) { create(:user, :instructor, name: "Prof. Smith") }
  let(:student) { create(:user) }
  let(:course) { create(:course, instructor: instructor) }

  before do
    create(:course_membership, course: course, user: instructor, role_in_course: "instructor")
    create(:course_membership, course: course, user: student, role_in_course: "student")
  end

  describe "GET /api/v1/courses" do
    it "lists only the courses the user belongs to" do
      create(:course, title: "Some other course")

      get "/api/v1/courses", headers: auth_headers(student)

      expect(response).to have_http_status(:ok)
      expect(json.map { |c| c["id"] }).to eq([course.course_id])
      expect(json.first["instructor"]).to eq("id" => instructor.user_id, "name" => "Prof. Smith")
    end

    it "requires login" do
      get "/api/v1/courses"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/courses/:id" do
    it "returns the course" do
      get "/api/v1/courses/#{course.course_id}", headers: auth_headers(student)
      expect(response).to have_http_status(:ok)
      expect(json).to include("course_code" => "COMS4152", "term" => "Fall 2026")
    end

    it "returns 404 for a course that does not exist" do
      get "/api/v1/courses/999999", headers: auth_headers(student)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/courses" do
    let(:params) { { course_code: "COMS4995", term: "Spring 2027", section: "002", title: "Topics in SE" } }

    it "lets an instructor create a course and enrolls them as its instructor" do
      expect { post "/api/v1/courses", params: params, headers: auth_headers(instructor) }
        .to change(Course, :count).by(1)

      expect(response).to have_http_status(:created)
      new_course = Course.find(json["id"])
      expect(new_course.instructor).to eq(instructor)
      expect(new_course.course_memberships.find_by(user_id: instructor.user_id).role_in_course).to eq("instructor")
    end

    it "lets an admin create a course" do
      post "/api/v1/courses", params: params, headers: auth_headers(create(:user, :admin))
      expect(response).to have_http_status(:created)
    end

    it "forbids students from creating courses" do
      expect { post "/api/v1/courses", params: params, headers: auth_headers(student) }
        .not_to change(Course, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it "forbids TAs from creating courses" do
      post "/api/v1/courses", params: params, headers: auth_headers(create(:user, :ta))
      expect(response).to have_http_status(:forbidden)
    end

    it "rejects a course without a title" do
      post "/api/v1/courses", params: params.except(:title), headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Title can't be blank")
    end
  end

  describe "GET /api/v1/courses/:id/members" do
    it "lists each member with their course role" do
      get "/api/v1/courses/#{course.course_id}/members", headers: auth_headers(student)

      expect(response).to have_http_status(:ok)
      expect(json.map { |m| [m["id"], m["role"]] }).to contain_exactly(
        [instructor.user_id, "instructor"], [student.user_id, "student"]
      )
    end
  end

  describe "POST /api/v1/courses/:id/members" do
    let(:newcomer) { create(:user, email: "newcomer@example.com") }

    it "lets an instructor add a member by email" do
      newcomer
      expect {
        post "/api/v1/courses/#{course.course_id}/members",
             params: { email: "newcomer@example.com" }, headers: auth_headers(instructor)
      }.to change(course.course_memberships, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["user"]["id"]).to eq(newcomer.user_id)
      expect(course.course_memberships.last.role_in_course).to eq("student")
    end

    it "lets a TA add a member with a specific role" do
      newcomer
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "newcomer@example.com", role: "ta" }, headers: auth_headers(create(:user, :ta))
      expect(response).to have_http_status(:created)
      expect(course.course_memberships.find_by(user_id: newcomer.user_id).role_in_course).to eq("ta")
    end

    it "returns 404 when no user has that email" do
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "ghost@example.com" }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("User not found")
    end

    it "refuses to add someone who is already a member" do
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: student.email }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "forbids students from adding members" do
      newcomer
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "newcomer@example.com" }, headers: auth_headers(student)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/courses/:id/members/:user_id" do
    it "lets an instructor remove a member" do
      expect {
        delete "/api/v1/courses/#{course.course_id}/members/#{student.user_id}", headers: auth_headers(instructor)
      }.to change(course.course_memberships, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 when the user is not in the course" do
      delete "/api/v1/courses/#{course.course_id}/members/#{create(:user).user_id}", headers: auth_headers(instructor)
      expect(response).to have_http_status(:not_found)
    end

    it "forbids students from removing members" do
      delete "/api/v1/courses/#{course.course_id}/members/#{instructor.user_id}", headers: auth_headers(student)
      expect(response).to have_http_status(:forbidden)
      expect(course.course_memberships.count).to eq(2)
    end
  end
end
