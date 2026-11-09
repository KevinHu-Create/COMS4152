class Api::V1::EvaluationsController < ApplicationController
  before_action :set_presentation, only: [:index, :create]

  # GET /api/v1/presentations/:presentation_id/evaluations
  def index
    unless admin_or_instructor?
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    evaluations = @presentation.evaluations.includes(:evaluator)

    render json: evaluations.map { |e| evaluation_response(e, include_evaluator: true) }
  end

  # POST /api/v1/presentations/:presentation_id/evaluations
  def create
    evaluation = @presentation.evaluations.build(evaluation_params)
    evaluation.evaluator_id = current_user.user_id

    if evaluation.save
      render json: evaluation_response(evaluation), status: :created
    else
      render json: { errors: evaluation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/pending_evaluations
  def pending
    course_ids = current_user.courses.pluck(:course_id)
    evaluated_ids = current_user.evaluations.pluck(:presentation_id)
    own_presentation_ids = current_user.presentations.pluck(:presentation_id)

    pending_presentations = Presentation
      .where(course_id: course_ids)
      .where.not(presentation_id: evaluated_ids + own_presentation_ids)
      .where('presentation_date <= ?', Date.today)
      .includes(:presenters)

    render json: pending_presentations.map { |p|
      {
        id: p.presentation_id,
        title: p.title,
        date: p.presentation_date,
        presenters: p.presenters.map(&:name)
      }
    }
  end

  private

  def set_presentation
    @presentation = Presentation.find(params[:presentation_id])
  end

  def evaluation_params
    params.permit(:clarity_score, :organization_score, :delivery_score, :overall_score, :comments)
  end

  def evaluation_response(e, include_evaluator: false)
    response = {
      id: e.evaluation_id,
      clarity: e.clarity_score,
      organization: e.organization_score,
      delivery: e.delivery_score,
      overall: e.overall_score,
      comments: e.comments,
      submittedAt: e.submitted_at
    }
    if include_evaluator
      response[:evaluator] = { id: e.evaluator.user_id, name: e.evaluator.name }
    end
    response
  end
end
