class Api::V1::PresentationsController < ApplicationController
  before_action :set_presentation, only: [:show, :update, :destroy, :feedback, :stats]
  before_action :require_staff!, only: [:create, :update, :destroy]

  # GET /api/v1/courses/:course_id/presentations
  def index
    course = Course.find(params[:course_id])
    presentations = course.presentations.includes(:presenters)

    render json: presentations.map { |p| presentation_response(p) }
  end

  # GET /api/v1/presentations/:id
  def show
    render json: presentation_response(@presentation)
  end

  # POST /api/v1/courses/:course_id/presentations
  def create
    course = Course.find(params[:course_id])
    presentation = course.presentations.build(presentation_params)

    if presentation.save
      if params[:presenter_ids].present?
        params[:presenter_ids].each do |user_id|
          PresentationPresenter.create(presentation_id: presentation.presentation_id, user_id: user_id)
        end
      end

      render json: presentation_response(presentation), status: :created
    else
      render json: { errors: presentation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/presentations/:id
  def update
    if @presentation.update(presentation_params)
      render json: presentation_response(@presentation)
    else
      render json: { errors: @presentation.errors.full_messages }, status: :unprocessable_entity
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
    unless admin_or_instructor?
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

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

  def require_staff!
    render json: { error: 'Not authorized' }, status: :forbidden unless admin_or_instructor?
  end

  def set_presentation
    @presentation = Presentation.find(params[:id])
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
      presenter: presentation.presenters.map(&:name).join(', ')
    }
  end
end
