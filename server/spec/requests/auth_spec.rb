require "rails_helper"

RSpec.describe "Authentication API", type: :request do
  describe "POST /api/v1/signup" do
    let(:params) { { name: "New Student", email: "new@example.com", password: "pass1234" } }

    it "creates a student account by default and returns a token" do
      expect { post "/api/v1/signup", params: params }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["user"]).to include("name" => "New Student", "email" => "new@example.com", "role" => "student")
      expect(json["token"]).to be_present
    end

    it "creates an account with the requested role" do
      post "/api/v1/signup", params: params.merge(role: "instructor")
      expect(json["user"]["role"]).to eq("instructor")
    end

    it "returns a token that can be used straight away" do
      post "/api/v1/signup", params: params
      get "/api/v1/me", headers: { "Authorization" => "Bearer #{json['token']}" }
      expect(response).to have_http_status(:ok)
      expect(json["user"]["email"]).to eq("new@example.com")
    end

    it "rejects a signup with missing fields" do
      expect { post "/api/v1/signup", params: { email: "x@example.com", password: "p" } }
        .not_to change(User, :count)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Name can't be blank")
    end

    it "rejects an email that is already registered" do
      create(:user, email: "new@example.com")
      post "/api/v1/signup", params: params
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Email has already been taken")
    end

    it "rejects an invalid role" do
      post "/api/v1/signup", params: params.merge(role: "hacker")
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/login" do
    let!(:user) { create(:user, email: "alice@example.com", password_hash: "right-pass") }

    it "logs in with the correct password" do
      post "/api/v1/login", params: { email: "alice@example.com", password: "right-pass" }
      expect(response).to have_http_status(:ok)
      expect(json["user"]["id"]).to eq(user.user_id)
      expect(json["token"]).to be_present
    end

    it "rejects a wrong password" do
      post "/api/v1/login", params: { email: "alice@example.com", password: "wrong" }
      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]).to eq("Invalid email or password")
    end

    it "rejects an unknown email" do
      post "/api/v1/login", params: { email: "nobody@example.com", password: "right-pass" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/me" do
    let(:user) { create(:user, :ta) }

    it "returns the signed-in user" do
      get "/api/v1/me", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json["user"]).to include("id" => user.user_id, "role" => "ta")
    end

    it "rejects a request without a token" do
      get "/api/v1/me"
      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]).to eq("Unauthorized")
    end

    it "rejects a forged token" do
      forged = Base64.strict_encode64("#{user.user_id}:someone-else@example.com")
      get "/api/v1/me", headers: { "Authorization" => "Bearer #{forged}" }
      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects a token for a user that no longer exists" do
      headers = auth_headers(user)
      user.destroy
      get "/api/v1/me", headers: headers
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
