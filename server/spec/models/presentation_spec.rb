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

  describe "times" do
    it "accepts a start and end time in HH:MM" do
      expect(build(:presentation, start_time: "09:05", end_time: "09:20")).to be_valid
    end

    it "allows the times to be left out" do
      expect(build(:presentation, start_time: nil, end_time: nil)).to be_valid
      expect(build(:presentation, start_time: "", end_time: "")).to be_valid
    end

    it "rejects a time that is not HH:MM" do
      presentation = build(:presentation, start_time: "9am")
      expect(presentation).not_to be_valid
      expect(presentation.errors[:start_time]).to include("must look like 14:30")
    end

    it "rejects an hour past 23" do
      expect(build(:presentation, end_time: "24:00")).not_to be_valid
    end

    it "requires the end time to be after the start time" do
      presentation = build(:presentation, start_time: "10:00", end_time: "10:00")
      expect(presentation).not_to be_valid
      expect(presentation.errors[:end_time]).to include("must be after the start time")
    end

    it "only compares times that are both valid" do
      presentation = build(:presentation, start_time: "bad", end_time: "09:00")
      presentation.valid?
      expect(presentation.errors[:end_time]).to be_empty
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

  describe "#upcoming?" do
    it "is true for a future date" do
      expect(build(:presentation, presentation_date: Date.current + 1)).to be_upcoming
    end

    it "is false for today and past dates" do
      expect(build(:presentation, presentation_date: Date.current)).not_to be_upcoming
      expect(build(:presentation, presentation_date: Date.current - 1)).not_to be_upcoming
    end

    it "is false without a date" do
      expect(build(:presentation, presentation_date: nil)).not_to be_upcoming
    end
  end

  describe ".pending_for" do
    let(:student) { create(:user) }
    let(:course) { create(:course) }

    before { create(:course_membership, course: course, user: student) }

    it "lists held presentations in the student's courses, oldest first" do
      today = create(:presentation, course: course, presentation_date: Date.current)
      last_week = create(:presentation, course: course, presentation_date: Date.current - 7)
      expect(described_class.pending_for(student)).to eq([last_week, today])
    end

    it "orders presentations on the same day by start time" do
      late = create(:presentation, course: course, start_time: "11:00", end_time: nil)
      early = create(:presentation, course: course, start_time: "09:00", end_time: nil)
      expect(described_class.pending_for(student)).to eq([early, late])
    end

    it "leaves out evaluated, own, future and other-course presentations" do
      evaluated = create(:presentation, course: course)
      create(:evaluation, presentation: evaluated, evaluator: student)
      create(:presentation, course: course, presenters: [student])
      create(:presentation, course: course, presentation_date: Date.current + 1)
      create(:presentation)

      expect(described_class.pending_for(student)).to be_empty
    end

    it "can be limited to one course" do
      other_course = create(:course)
      create(:course_membership, course: other_course, user: student)
      here = create(:presentation, course: course)
      create(:presentation, course: other_course)

      expect(described_class.pending_for(student, course_id: course.course_id)).to eq([here])
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
