require "rails_helper"

RSpec.describe Presentation, type: :model do
  subject { build(:presentation) }

  describe "associations" do
    it { is_expected.to belong_to(:course) }
    it { is_expected.to have_many(:presentation_presenters).dependent(:destroy) }
    it { is_expected.to have_many(:presenters).through(:presentation_presenters) }
    it { is_expected.to have_many(:evaluations).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:presentation_date) }

    it "is valid with only a title, date and course" do
      expect(build(:presentation, description: nil, start_time: nil, end_time: nil, location: nil)).to be_valid
    end
  end

  describe "#presenter?" do
    let(:presenter) { create(:user) }
    let(:audience) { create(:user) }
    let(:presentation) { create(:presentation, presenters: [presenter]) }

    it "is true for a presenter" do
      expect(presentation.presenter?(presenter)).to be true
    end

    it "is false for someone in the audience" do
      expect(presentation.presenter?(audience)).to be false
    end

    it "supports group presentations with several presenters" do
      partner = create(:user)
      group = create(:presentation, presenters: [presenter, partner])
      expect(group.presenters).to contain_exactly(presenter, partner)
    end
  end

  describe "#average_score" do
    let(:presentation) { create(:presentation) }

    it "is nil when there are no evaluations" do
      expect(presentation.average_score).to be_nil
    end

    it "averages the overall scores, rounded to two decimals" do
      [5, 4, 4].each { |score| create(:evaluation, presentation: presentation, overall_score: score) }
      expect(presentation.average_score).to eq(4.33)
    end
  end

  it "deletes its evaluations and presenter links when destroyed" do
    presentation = create(:presentation, presenters: [create(:user)])
    create(:evaluation, presentation: presentation)

    expect { presentation.destroy }
      .to change(Evaluation, :count).by(-1)
      .and change(PresentationPresenter, :count).by(-1)
  end
end
