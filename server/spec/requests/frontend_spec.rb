require "rails_helper"

RSpec.describe "React app pages", type: :request do
  context "when the frontend has been built" do
    let(:public_dir) { Pathname(Dir.mktmpdir) }

    before do
      public_dir.join("index.html").write("<div id=\"root\"></div>")
      allow(Rails).to receive(:public_path).and_return(public_dir)
    end

    after { FileUtils.rm_rf(public_dir) }

    it "serves index.html at the root" do
      get "/", headers: { "Accept" => "text/html" }
      expect(response).to have_http_status(:ok)
      expect(response.body).to include('<div id="root">')
      expect(response.headers["Cache-Control"]).to eq("no-cache")
    end

    it "serves index.html for client-side routes so links and refreshes work" do
      get "/evaluation/3", headers: { "Accept" => "text/html" }
      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
    end

    it "does not swallow unknown API paths" do
      get "/api/v1/does-not-exist", headers: { "Accept" => "text/html" }
      expect(response).to have_http_status(:not_found)
      expect(response.body).not_to include('<div id="root">')
    end
  end

  it "returns 404 when the frontend has not been built" do
    allow(Rails).to receive(:public_path).and_return(Pathname(Dir.mktmpdir))
    get "/events", headers: { "Accept" => "text/html" }
    expect(response).to have_http_status(:not_found)
  end
end
