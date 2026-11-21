# Long-term caching for the fingerprinted files Vite puts under /assets/
# (e.g. index-BjUa_kku.js): their names change whenever their content does,
# so browsers can keep them for a year.
#
# Every other file in public/, above all index.html, is served with
# "no-cache" (config.public_file_server.headers in production.rb), so
# browsers check for a new version after each deploy.
class StaticCacheHeaders
  ASSET_PREFIX = "/assets/".freeze
  LONG_CACHE = "public, max-age=31536000, immutable".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)
    if status.to_i == 200 && env["PATH_INFO"].to_s.start_with?(ASSET_PREFIX)
      headers["cache-control"] = LONG_CACHE
    end
    [status, headers, body]
  end
end
