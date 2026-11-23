class Api::V1::EvaluationsController < ApplicationController
  before_action :set_presentation, only: [:index, :create]

  # GET /api/v1/presentations/:presentation_id/evaluations
  def index
    return forbidden! unless @presentation.course.staff?(current_user)

    evaluations = @presentation.evaluations.includes(:evaluator)

    render json: evaluations.map { |e| evaluation_response(e, include_evaluator: true) }
  end

  # POST /api/v1/presentations/:presentation_id/evaluations
  def create
    unless @presentation.course.member?(current_user)
      return forbidden!('You are not enrolled in this course')
    end

    evaluation = @presentation.evaluations.build(evaluation_params)
    evaluation.evaluator_id = current_user.user_id

    if evaluation.save
      render json: evaluation_response(evaluation), status: :created
    else
      render json: { errors: evaluation.errors.full_messages }, status: :unprocessable_content
    end
  end

  # GET /api/v1/pending_evaluations
  # Optional course_id limits the list to one course.
  def pending
    pending_presentations = Presentation.pending_for(current_user, course_id: params[:course_id])
                                        .includes(:presenters, :course)

    render json: pending_presentations.map { |p|
      {
        id: p.presentation_id,
        title: p.title,
        date: p.presentation_date,
        startTime: p.start_time,
        course: p.course.course_code,
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
