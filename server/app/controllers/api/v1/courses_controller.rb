class Api::V1::CoursesController < ApplicationController
  before_action :set_course, only: [:show, :members, :add_member, :remove_member]
  before_action :require_member!, only: [:show, :members]
  before_action :require_staff!, only: [:add_member, :remove_member]

  # GET /api/v1/courses
  # Courses the user teaches or is enrolled in (admins see every course).
  def index
    courses =
      if current_user.global_role == 'admin'
        Course.all
      else
        Course.where(course_id: current_user.course_memberships.select(:course_id))
              .or(Course.where(instructor_id: current_user.user_id))
      end

    render json: courses.includes(:instructor).order(:course_code, :section).map { |c| course_response(c) }
  end

  # GET /api/v1/courses/:id
  def show
    render json: course_response(@course)
  end

  # POST /api/v1/courses
  def create
    return forbidden! unless current_user.global_role.in?(%w[instructor admin])

    course = Course.new(course_params)
    course.instructor_id = current_user.user_id

    if course.save
      CourseMembership.create!(course: course, user: current_user, role_in_course: 'instructor')
      render json: course_response(course), status: :created
    else
      render json: { errors: course.errors.full_messages }, status: :unprocessable_content
    end
  end

  # GET /api/v1/courses/:id/members
  def members
    memberships = @course.course_memberships.includes(:user).sort_by { |m| [ROLE_ORDER.index(m.role_in_course), m.user.name] }

    render json: memberships.map { |m|
      { id: m.user.user_id, name: m.user.name, email: m.user.email, role: m.role_in_course }
    }
  end

  # POST /api/v1/courses/:id/members
  def add_member
    user = User.where('LOWER(email) = ?', params[:email].to_s.strip.downcase).first
    return render json: { error: 'No user with that email' }, status: :not_found unless user

    role = params[:role].presence || 'student'
    unless role.in?(%w[student ta])
      return render json: { errors: ['Role must be student or ta'] }, status: :unprocessable_content
    end

    membership = @course.course_memberships.new(user: user, role_in_course: role)

    if membership.save
      render json: { message: 'Member added', user: { id: user.user_id, name: user.name, email: user.email, role: role } },
             status: :created
    else
      errors = membership.errors.of_kind?(:user_id, :taken) ? ["#{user.name} is already in this course"] : membership.errors.full_messages
      render json: { errors: errors }, status: :unprocessable_content
    end
  end

  # DELETE /api/v1/courses/:id/members/:user_id
  def remove_member
    if @course.instructor_id.to_s == params[:user_id].to_s
      return render json: { errors: ['The course instructor cannot be removed'] }, status: :unprocessable_content
    end

    membership = @course.course_memberships.find_by(user_id: params[:user_id])

    if membership&.destroy
      head :no_content
    else
      render json: { error: 'Member not found' }, status: :not_found
    end
  end

  private

  ROLE_ORDER = %w[instructor ta student].freeze

  def set_course
    @course = Course.find(params[:id])
  end

  def require_member!
    forbidden!('You are not a member of this course') unless @course.member?(current_user)
  end

  def require_staff!
    forbidden! unless @course.staff?(current_user)
  end

  def course_params
    params.permit(:course_code, :term, :section, :title)
  end

  def course_response(course)
    {
      id: course.course_id,
      course_code: course.course_code,
      term: course.term,
      section: course.section,
      title: course.title,
      instructor: { id: course.instructor.user_id, name: course.instructor.name },
      my_role: course.role_for(current_user)
    }
  end
end
