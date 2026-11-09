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
