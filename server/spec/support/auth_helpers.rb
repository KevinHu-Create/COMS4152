# Builds the same token the API issues on login (Base64 of "id:email").
module AuthHelpers
  def auth_headers(user)
    token = Base64.strict_encode64("#{user.user_id}:#{user.email}")
    { "Authorization" => "Bearer #{token}" }
  end

  def json
    JSON.parse(response.body)
  end
end
