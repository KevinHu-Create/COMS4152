require "rails_helper"

RSpec.describe Evaluation, type: :model do
  subject { build(:evaluation) }

  describe "associations" do
    it { is_expected.to belong_to(:presentation) }
    it { is_expected.to belong_to(:evaluator).class_name("User") }
  end

  describe "score validations" do
    %i[clarity_score organization_score delivery_score overall_score].each do |field|
      context field.to_s do
        it { is_expected.to validate_presence_of(field) }

        it "accepts the lowest score (1) and the highest score (5)" do
          expect(build(:evaluation, field => 1)).to be_valid
          expect(build(:evaluation, field => 5)).to be_valid
        end

        it "rejects 0" do
          expect(build(:evaluation, field => 0)).not_to be_valid
        end

        it "rejects 6" do
          expect(build(:evaluation, field => 6)).not_to be_valid
        end
      end
    end

    it "allows comments to be left blank" do
      expect(build(:evaluation, comments: nil)).to be_valid
    end
  end

  describe "one evaluation per person per presentation" do
    let(:evaluator) { create(:user) }
    let(:presentation) { create(:presentation) }

    before { create(:evaluation, presentation: presentation, evaluator: evaluator) }

    it "rejects a second evaluation by the same person" do
      duplicate = build(:evaluation, presentation: presentation, evaluator: evaluator)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:evaluator_id]).to include("has already submitted an evaluation")
    end

    it "allows the same person to evaluate a different presentation" do
      expect(build(:evaluation, evaluator: evaluator)).to be_valid
    end
  end

  describe "timing" do
    it "allows evaluating a presentation held today" do
      expect(build(:evaluation, presentation: create(:presentation, presentation_date: Date.current))).to be_valid
    end

    it "allows evaluating a past presentation" do
      expect(build(:evaluation, presentation: create(:presentation, presentation_date: Date.current - 3))).to be_valid
    end

    it "does not allow evaluating a presentation that has not happened yet" do
      evaluation = build(:evaluation, presentation: create(:presentation, presentation_date: Date.current + 1))
      expect(evaluation).not_to be_valid
      expect(evaluation.errors[:base]).to include("This presentation has not happened yet")
    end
  end

  describe "self-evaluation" do
    let(:presenter) { create(:user) }
    let(:presentation) { create(:presentation, presenters: [presenter]) }

    it "does not let a presenter evaluate their own presentation" do
      evaluation = build(:evaluation, presentation: presentation, evaluator: presenter)
      expect(evaluation).not_to be_valid
      expect(evaluation.errors[:base]).to include("You cannot evaluate your own presentation")
    end

    it "lets someone else evaluate the presentation" do
      expect(build(:evaluation, presentation: presentation, evaluator: create(:user))).to be_valid
    end
  end
end
