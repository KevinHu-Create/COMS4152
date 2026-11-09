class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:login, :signup]

  def signup
    user = User.new(
      name: params[:name],
      email: params[:email],
      password_hash: params[:password],
      global_role: params[:role] || 'student'
    )

    if user.save
      render json: { user: user_response(user), token: generate_token(user) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      render json: { user: user_response(user), token: generate_token(user) }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def me
    render json: { user: user_response(current_user) }
  end

  private

  def user_response(user)
    {
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.global_role
    }
  end

  def generate_token(user)
    Base64.encode64("#{user.user_id}:#{user.email}").strip
  end
end
