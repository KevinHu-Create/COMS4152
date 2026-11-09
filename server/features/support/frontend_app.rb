# Builds the React client (../client) and serves it next to the Rails API,
# the same way it is served in production: one origin, "/api/*" goes to
# Rails and every other path falls back to the single-page app.
module FrontendApp
  CLIENT_DIR = Rails.root.join("..", "client")
  BUILD_DIR = Rails.root.join("tmp", "cucumber_client")

  def self.build!
    return if ENV["SKIP_CLIENT_BUILD"] && BUILD_DIR.join("index.html").exist?

    vite = CLIENT_DIR.join("node_modules", ".bin", "vite")
    abort "Frontend dependencies missing: run `npm install` in client/ first." unless vite.exist?

    ok = system({ "VITE_API_BASE_URL" => "/api/v1" },
                vite.to_s, "build", "--outDir", BUILD_DIR.to_s, "--emptyOutDir", "--logLevel", "warn",
                chdir: CLIENT_DIR.to_s)
    abort "Frontend build failed." unless ok
  end

  def self.rack_app
    static = Rack::Files.new(BUILD_DIR.to_s)
    index_html = BUILD_DIR.join("index.html").read

    lambda do |env|
      path = env["PATH_INFO"]
      if path.start_with?("/api/")
        Rails.application.call(env)
      elsif path.start_with?("/assets/") || path.match?(%r{\A/[\w.-]+\.\w+\z})
        static.call(env)
      else
        [200, { "content-type" => "text/html" }, [index_html]]
      end
    end
  end
end
