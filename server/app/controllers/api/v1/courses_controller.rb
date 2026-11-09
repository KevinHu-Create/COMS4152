class Api::V1::CoursesController < ApplicationController
  before_action :set_course, only: [:show, :members, :add_member, :remove_member]

  # GET /api/v1/courses
  def index
    courses = current_user.courses.includes(:instructor)

    render json: courses.map { |c| course_response(c) }
  end

  # GET /api/v1/courses/:id
  def show
    render json: course_response(@course)
  end

  # POST /api/v1/courses
  def create
    unless current_user.global_role.in?(%w[instructor admin])
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    course = Course.new(course_params)
    course.instructor_id = current_user.user_id

    if course.save
      CourseMembership.create(
        course_id: course.course_id,
        user_id: current_user.user_id,
        role_in_course: 'instructor'
      )

      render json: course_response(course), status: :created
    else
      render json: { errors: course.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/courses/:id/members
  def members
    render json: @course.course_memberships.includes(:user).map { |m|
      {
        id: m.user.user_id,
        name: m.user.name,
        email: m.user.email,
        role: m.role_in_course
      }
    }
  end

  # POST /api/v1/courses/:id/members
  def add_member
    unless admin_or_instructor?
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    user = User.find_by(email: params[:email])

    unless user
      return render json: { error: 'User not found' }, status: :not_found
    end

    membership = CourseMembership.new(
      course_id: @course.course_id,
      user_id: user.user_id,
      role_in_course: params[:role] || 'student'
    )

    if membership.save
      render json: { message: 'Member added', user: { id: user.user_id, name: user.name } }, status: :created
    else
      render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/courses/:id/members/:user_id
  def remove_member
    unless admin_or_instructor?
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    membership = @course.course_memberships.find_by(user_id: params[:user_id])

    if membership&.destroy
      head :no_content
    else
      render json: { error: 'Member not found' }, status: :not_found
    end
  end

  private

  def set_course
    @course = Course.find(params[:id])
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
      instructor: { id: course.instructor.user_id, name: course.instructor.name }
    }
  end
end
