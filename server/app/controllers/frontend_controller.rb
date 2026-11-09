# Serves the built React app's index.html for client-side routes such as
# /events or /evaluation/3, so they work on refresh and as direct links.
class FrontendController < ActionController::API
  def index
    page = Rails.public_path.join("index.html")
    return head(:not_found) unless page.exist?

    response.headers["Cache-Control"] = "no-cache"
    send_file page, type: "text/html", disposition: "inline"
  end
end
