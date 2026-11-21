require "rails_helper"

RSpec.describe "Courses API", type: :request do
  let(:instructor) { create(:user, :instructor, name: "Prof. Smith") }
  let(:student) { create(:user) }
  let(:course) { create(:course, instructor: instructor) }

  let(:outsider) { create(:user, name: "Not Enrolled") }

  before do
    create(:course_membership, course: course, user: instructor, role_in_course: "instructor")
    create(:course_membership, course: course, user: student, role_in_course: "student")
  end

  def course_ta
    create(:user, :ta).tap { |ta| create(:course_membership, course: course, user: ta, role_in_course: "ta") }
  end

  describe "GET /api/v1/courses" do
    it "lists only the courses the user belongs to" do
      create(:course, title: "Some other course")

      get "/api/v1/courses", headers: auth_headers(student)

      expect(response).to have_http_status(:ok)
      expect(json.map { |c| c["id"] }).to eq([course.course_id])
      expect(json.first["instructor"]).to eq("id" => instructor.user_id, "name" => "Prof. Smith")
    end

    it "tells the user their role in each course" do
      get "/api/v1/courses", headers: auth_headers(student)
      expect(json.first["my_role"]).to eq("student")

      get "/api/v1/courses", headers: auth_headers(instructor)
      expect(json.first["my_role"]).to eq("instructor")
    end

    it "includes courses the user teaches even without a membership row" do
      taught = create(:course, instructor: instructor, title: "Taught only")
      get "/api/v1/courses", headers: auth_headers(instructor)
      expect(json.map { |c| c["id"] }).to contain_exactly(course.course_id, taught.course_id)
    end

    it "shows every course to an admin" do
      other = create(:course)
      get "/api/v1/courses", headers: auth_headers(create(:user, :admin))
      expect(json.map { |c| c["id"] }).to contain_exactly(course.course_id, other.course_id)
      expect(json.map { |c| c["my_role"] }.uniq).to eq(["admin"])
    end

    it "is empty for a user who has not joined any course" do
      get "/api/v1/courses", headers: auth_headers(outsider)
      expect(json).to eq([])
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

    it "is hidden from users who are not enrolled" do
      get "/api/v1/courses/#{course.course_id}", headers: auth_headers(outsider)
      expect(response).to have_http_status(:forbidden)
      expect(json["error"]).to eq("You are not a member of this course")
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
      expect(response).to have_http_status(:unprocessable_content)
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

    it "lists the instructor first, then TAs, then students" do
      ta = course_ta
      get "/api/v1/courses/#{course.course_id}/members", headers: auth_headers(student)
      expect(json.map { |m| m["id"] }).to eq([instructor.user_id, ta.user_id, student.user_id])
    end

    it "is hidden from users who are not enrolled" do
      get "/api/v1/courses/#{course.course_id}/members", headers: auth_headers(outsider)
      expect(response).to have_http_status(:forbidden)
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
           params: { email: "newcomer@example.com", role: "ta" }, headers: auth_headers(course_ta)
      expect(response).to have_http_status(:created)
      expect(course.course_memberships.find_by(user_id: newcomer.user_id).role_in_course).to eq("ta")
    end

    it "returns 404 when no user has that email" do
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "ghost@example.com" }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("No user with that email")
    end

    it "matches the email regardless of case and surrounding spaces" do
      newcomer
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "  NewComer@Example.com " }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:created)
    end

    it "refuses to add someone who is already a member" do
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: student.email }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to eq(["#{student.name} is already in this course"])
    end

    it "only adds students or TAs" do
      newcomer
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "newcomer@example.com", role: "instructor" }, headers: auth_headers(instructor)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to eq(["Role must be student or ta"])
    end

    it "forbids an instructor who does not teach the course" do
      newcomer
      post "/api/v1/courses/#{course.course_id}/members",
           params: { email: "newcomer@example.com" }, headers: auth_headers(create(:user, :instructor))
      expect(response).to have_http_status(:forbidden)
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

    it "lets a TA of the course remove a student" do
      delete "/api/v1/courses/#{course.course_id}/members/#{student.user_id}", headers: auth_headers(course_ta)
      expect(response).to have_http_status(:no_content)
    end

    it "never removes the course's instructor" do
      delete "/api/v1/courses/#{course.course_id}/members/#{instructor.user_id}", headers: auth_headers(course_ta)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to eq(["The course instructor cannot be removed"])
      expect(course.member?(instructor)).to be true
    end

    it "forbids students from removing members" do
      delete "/api/v1/courses/#{course.course_id}/members/#{instructor.user_id}", headers: auth_headers(student)
      expect(response).to have_http_status(:forbidden)
      expect(course.course_memberships.count).to eq(2)
    end
  end
end
