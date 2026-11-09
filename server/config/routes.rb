Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/docs'
  mount Rswag::Api::Engine => '/docs'
  namespace :api do
    namespace :v1 do
      post '/signup', to: 'auth#signup'
      post '/login', to: 'auth#login'
      get '/me', to: 'auth#me'

      resources :courses, only: [:index, :show, :create] do
        get 'members', on: :member
        post 'members', to: 'courses#add_member', on: :member
        delete 'members/:user_id', to: 'courses#remove_member', on: :member

        resources :presentations, only: [:index, :create], shallow: true
      end

      resources :presentations, only: [:show, :update, :destroy] do
        get 'feedback', on: :member
        get 'stats', on: :member
        resources :evaluations, only: [:index, :create]
      end

      get '/my_presentations', to: 'presentations#my_presentations'
      get '/pending_evaluations', to: 'evaluations#pending'
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
