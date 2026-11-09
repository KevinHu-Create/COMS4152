class ApplicationController < ActionController::API
  before_action :authenticate_user!

  private

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last

    if token.present?
      begin
        decoded = Base64.decode64(token)
        user_id, email = decoded.split(':')
        @current_user = User.find_by(user_id: user_id, email: email)
      rescue
        @current_user = nil
      end
    end

    render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  def admin_or_instructor?
    current_user.global_role.in?(%w[admin instructor ta])
  end
end
