require "rails_helper"

RSpec.describe CourseMembership, type: :model do
  describe "associations" do
    subject { build(:course_membership) }

    it { is_expected.to belong_to(:course) }
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    %w[instructor ta student].each do |role|
      it "accepts the #{role} course role" do
        expect(build(:course_membership, role_in_course: role)).to be_valid
      end
    end

    it "rejects a role that is not allowed in a course" do
      membership = build(:course_membership, role_in_course: "admin")
      expect(membership).not_to be_valid
      expect(membership.errors[:role_in_course]).to be_present
    end

    it "does not allow the same user to join a course twice" do
      existing = create(:course_membership)
      duplicate = build(:course_membership, course: existing.course, user: existing.user)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to include("has already been taken")
    end

    it "allows the same user to join different courses" do
      existing = create(:course_membership)
      expect(build(:course_membership, user: existing.user)).to be_valid
    end
  end
end
