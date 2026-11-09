# Production image for Heroku (container stack): builds the React client,
# then runs the Rails API, which also serves the built client from public/.

# --- 1. Build the React client --------------------------------------
FROM node:22-slim AS client
WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
# Same origin as the API in production
RUN VITE_API_BASE_URL=/api/v1 npm run build

# --- 2. Install gems -------------------------------------------------
FROM ruby:3.3.3-slim AS gems
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends build-essential libpq-dev libyaml-dev pkg-config git && \
    rm -rf /var/lib/apt/lists/*
ENV BUNDLE_DEPLOYMENT=1 BUNDLE_WITHOUT="development:test" BUNDLE_PATH=/usr/local/bundle
WORKDIR /app
COPY server/Gemfile server/Gemfile.lock server/.ruby-version ./
RUN bundle install && rm -rf /usr/local/bundle/ruby/*/cache

# --- 3. Runtime ------------------------------------------------------
FROM ruby:3.3.3-slim
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends libpq5 libyaml-0-2 tzdata curl && \
    rm -rf /var/lib/apt/lists/*
ENV RAILS_ENV=production RAILS_LOG_TO_STDOUT=1 \
    BUNDLE_DEPLOYMENT=1 BUNDLE_WITHOUT="development:test" BUNDLE_PATH=/usr/local/bundle
WORKDIR /app
COPY --from=gems /usr/local/bundle /usr/local/bundle
COPY server/ ./
COPY --from=client /client/dist/ ./public/
RUN mkdir -p tmp/pids log storage && \
    useradd --create-home rails && chown -R rails:rails tmp log storage
USER rails

# Heroku sets $PORT; config/puma.rb binds to it.
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
