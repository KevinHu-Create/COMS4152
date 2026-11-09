require "rails_helper"

RSpec.describe PresentationPresenter, type: :model do
  it "links a user to a presentation" do
    user = create(:user)
    presentation = create(:presentation)
    link = described_class.create!(presentation: presentation, user: user)

    expect(link.presentation).to eq(presentation)
    expect(link.user).to eq(user)
  end

  it "requires a presentation and a user" do
    link = described_class.new
    expect(link).not_to be_valid
    expect(link.errors[:presentation]).to be_present
    expect(link.errors[:user]).to be_present
  end
end
