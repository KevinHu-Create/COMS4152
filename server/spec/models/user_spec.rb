require "rails_helper"

RSpec.describe User, type: :model do
  subject { build(:user) }

  describe "associations" do
    it { is_expected.to have_many(:course_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:courses).through(:course_memberships) }
    it { is_expected.to have_many(:instructed_courses).class_name("Course") }
    it { is_expected.to have_many(:presentation_presenters).dependent(:destroy) }
    it { is_expected.to have_many(:presentations).through(:presentation_presenters) }
    it { is_expected.to have_many(:evaluations).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:email) }

    it "is valid with the factory defaults" do
      expect(subject).to be_valid
    end

    it "rejects a duplicate email" do
      create(:user, email: "taken@example.com")
      user = build(:user, email: "taken@example.com")
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("has already been taken")
    end

    %w[instructor ta student admin].each do |role|
      it "accepts the #{role} role" do
        expect(build(:user, global_role: role)).to be_valid
      end
    end

    it "rejects an unknown role" do
      user = build(:user, global_role: "superuser")
      expect(user).not_to be_valid
      expect(user.errors[:global_role]).to be_present
    end
  end

  describe "#authenticate" do
    let(:user) { build(:user, password_hash: "secret-pass") }

    it "returns true for the right password" do
      expect(user.authenticate("secret-pass")).to be true
    end

    it "returns false for a wrong password" do
      expect(user.authenticate("wrong")).to be false
    end

    it "returns false for a blank password" do
      expect(user.authenticate(nil)).to be false
    end
  end

  describe "course and presentation relationships" do
    let(:user) { create(:user) }
    let(:course) { create(:course) }

    it "lists the courses the user is enrolled in" do
      create(:course_membership, user: user, course: course)
      expect(user.courses).to contain_exactly(course)
    end

    it "lists the presentations the user presents" do
      presentation = create(:presentation, presenters: [user])
      expect(user.presentations).to contain_exactly(presentation)
    end

    it "removes the user's memberships when the user is destroyed" do
      create(:course_membership, user: user, course: course)
      expect { user.destroy }.to change(CourseMembership, :count).by(-1)
    end
  end
end
