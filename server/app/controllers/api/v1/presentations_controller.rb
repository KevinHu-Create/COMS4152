class Api::V1::PresentationsController < ApplicationController
  before_action :set_presentation, only: [:show, :update, :destroy, :feedback, :stats]
  before_action :set_course_from_params, only: [:index, :create]
  before_action :require_member!, only: [:index, :show]
  before_action :require_staff!, only: [:create, :update, :destroy, :stats]

  # GET /api/v1/courses/:course_id/presentations
  def index
    presentations = @course.presentations.includes(:presenters).order(:presentation_date, :start_time)

    render json: presentations.map { |p| presentation_response(p) }
  end

  # GET /api/v1/presentations/:id
  def show
    render json: presentation_response(@presentation)
  end

  # POST /api/v1/courses/:course_id/presentations
  def create
    presentation = @course.presentations.build

    if save_with_presenters(presentation)
      render json: presentation_response(presentation), status: :created
    else
      render json: { errors: presentation.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /api/v1/presentations/:id
  # Send presenter_ids to replace the presenters ([] removes them all).
  def update
    if save_with_presenters(@presentation)
      render json: presentation_response(@presentation)
    else
      render json: { errors: @presentation.errors.full_messages }, status: :unprocessable_content
    end
  end

  # DELETE /api/v1/presentations/:id
  def destroy
    @presentation.destroy
    head :no_content
  end

  # GET /api/v1/presentations/:id/feedback
  def feedback
    unless @presentation.presenter?(current_user)
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    evals = @presentation.evaluations
    render json: {
      presentation: presentation_response(@presentation),
      avgClarity: average(evals, :clarity_score),
      avgOrganization: average(evals, :organization_score),
      avgDelivery: average(evals, :delivery_score),
      avgOverall: average(evals, :overall_score),
      comments: evals.pluck(:comments).compact,
      evaluationCount: evals.count
    }
  end

  # GET /api/v1/presentations/:id/stats
  def stats
    evals = @presentation.evaluations.includes(:evaluator)
    render json: {
      presentation: presentation_response(@presentation),
      evaluations: evals.map { |e|
        {
          id: e.evaluation_id,
          evaluatorName: e.evaluator.name,
          clarity: e.clarity_score,
          organization: e.organization_score,
          delivery: e.delivery_score,
          overall: e.overall_score,
          comments: e.comments,
          submittedAt: e.submitted_at
        }
      },
      stats: {
        avgClarity: average(evals, :clarity_score),
        avgOrganization: average(evals, :organization_score),
        avgDelivery: average(evals, :delivery_score),
        avgOverall: average(evals, :overall_score),
        totalEvaluations: evals.count
      }
    }
  end

  # GET /api/v1/my_presentations
  def my_presentations
    presentations = current_user.presentations.includes(:evaluations, :course)

    render json: presentations.map { |p|
      evals = p.evaluations
      {
        id: p.presentation_id,
        title: p.title,
        date: p.presentation_date,
        course: p.course.course_code,
        avgClarity: average(evals, :clarity_score),
        avgOrganization: average(evals, :organization_score),
        avgDelivery: average(evals, :delivery_score),
        avgOverall: average(evals, :overall_score),
        comments: evals.pluck(:comments).compact,
        evaluationCount: evals.count
      }
    }
  end

  private

  # AVG() comes back as BigDecimal, which Rails serialises as a JSON string;
  # return a plain number so the frontend can format it.
  def average(evals, column)
    evals.average(column)&.to_f&.round(1)
  end

  # Looked up once per request so listing events does not query per event.
  def my_presentation_ids
    @my_presentation_ids ||= current_user.presentation_presenters.pluck(:presentation_id).to_set
  end

  def my_evaluated_ids
    @my_evaluated_ids ||= current_user.evaluations.pluck(:presentation_id).to_set
  end

  # Saves the attributes and presenters together, or neither.
  def save_with_presenters(presentation)
    saved = Presentation.transaction do
      presentation.assign_attributes(presentation_params)
      raise ActiveRecord::Rollback unless presentation.save && assign_presenters(presentation)

      true
    end
    presentation.presenters.reset
    saved
  end

  def assign_presenters(presentation)
    return true unless params.key?(:presenter_ids)

    ids = Array(params[:presenter_ids]).map(&:to_i).uniq
    enrolled = @course.course_memberships.where(user_id: ids).pluck(:user_id)
    if (ids - enrolled).any?
      presentation.errors.add(:base, 'Presenters must be members of this course')
      return false
    end

    presentation.presentation_presenters.where.not(user_id: ids).destroy_all
    (ids - presentation.presentation_presenters.pluck(:user_id)).each do |user_id|
      presentation.presentation_presenters.create!(user_id: user_id)
    end
    true
  end

  def set_presentation
    @presentation = Presentation.find(params[:id])
    @course = @presentation.course
  end

  def set_course_from_params
    @course = Course.find(params[:course_id])
  end

  def require_member!
    forbidden!('You are not a member of this course') unless @course.member?(current_user)
  end

  # Only the course's instructor, its TAs and admins manage events.
  def require_staff!
    forbidden! unless @course.staff?(current_user)
  end

  def presentation_params
    params.permit(:title, :description, :presentation_date, :start_time, :end_time, :location)
  end

  def presentation_response(presentation)
    {
      id: presentation.presentation_id,
      title: presentation.title,
      description: presentation.description,
      date: presentation.presentation_date,
      startTime: presentation.start_time,
      endTime: presentation.end_time,
      location: presentation.location,
      courseId: presentation.course_id,
      isMine: my_presentation_ids.include?(presentation.presentation_id),
      evaluatedByMe: my_evaluated_ids.include?(presentation.presentation_id),
      upcoming: presentation.upcoming?,
      presenter: presentation.presenters.map(&:name).join(', '),
      presenters: presentation.presenters.map { |u| { id: u.user_id, name: u.name } }
    }
  end
end
