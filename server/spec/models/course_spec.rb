require "rails_helper"

RSpec.describe Course, type: :model do
  subject { build(:course) }

  describe "associations" do
    it { is_expected.to belong_to(:instructor).class_name("User") }
    it { is_expected.to have_many(:course_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:members).through(:course_memberships) }
    it { is_expected.to have_many(:presentations).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:course_code) }
    it { is_expected.to validate_presence_of(:term) }
    it { is_expected.to validate_presence_of(:title) }

    it "is valid without a section" do
      expect(build(:course, section: nil)).to be_valid
    end

    it "is invalid without an instructor" do
      expect(build(:course, instructor: nil)).not_to be_valid
    end
  end

  describe "roles" do
    let(:instructor) { create(:user, :instructor) }
    let(:course) { create(:course, instructor: instructor) }
    let(:student) { create(:user).tap { |u| create(:course_membership, course: course, user: u) } }
    let(:ta) { create(:user, :ta).tap { |u| create(:course_membership, course: course, user: u, role_in_course: "ta") } }
    let(:outsider) { create(:user) }
    let(:admin) { create(:user, :admin) }

    it "knows each user's role" do
      expect(course.role_for(instructor)).to eq("instructor")
      expect(course.role_for(ta)).to eq("ta")
      expect(course.role_for(student)).to eq("student")
      expect(course.role_for(admin)).to eq("admin")
      expect(course.role_for(outsider)).to be_nil
      expect(course.role_for(nil)).to be_nil
    end

    it "treats instructors, TAs and admins as staff" do
      expect([instructor, ta, admin].map { |u| course.staff?(u) }).to all(be true)
      expect(course.staff?(student)).to be false
      expect(course.staff?(outsider)).to be false
    end

    it "treats everyone enrolled as a member" do
      expect([instructor, ta, student, admin].map { |u| course.member?(u) }).to all(be true)
      expect(course.member?(outsider)).to be false
    end

    it "does not give a global instructor any role in someone else's course" do
      expect(course.role_for(create(:user, :instructor))).to be_nil
    end
  end

  describe "members" do
    let(:course) { create(:course) }

    it "returns every enrolled user" do
      students = create_list(:user, 2)
      students.each { |s| create(:course_membership, course: course, user: s) }
      expect(course.members).to match_array(students)
    end

    it "deletes its memberships and presentations when destroyed" do
      create(:course_membership, course: course)
      create(:presentation, course: course)

      expect { course.destroy }
        .to change(CourseMembership, :count).by(-1)
        .and change(Presentation, :count).by(-1)
    end
  end
end
