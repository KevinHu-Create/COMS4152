require "rails_helper"
require Rails.root.join("lib/static_cache_headers").to_s

RSpec.describe StaticCacheHeaders do
  def call(path, status: 200, cache_control: "no-cache")
    downstream = ->(_env) { [status, { "cache-control" => cache_control }, ["body"]] }
    described_class.new(downstream).call(Rack::MockRequest.env_for(path))
  end

  it "caches fingerprinted assets for a year" do
    _status, headers, = call("/assets/index-BjUa_kku.js")
    expect(headers["cache-control"]).to eq("public, max-age=31536000, immutable")
  end

  it "replaces a Cache-Control header written with different capitalisation" do
    downstream = ->(_env) { [200, { "Cache-Control" => "no-cache" }, ["body"]] }
    _status, headers, = described_class.new(downstream).call(Rack::MockRequest.env_for("/assets/app.js"))
    expect(headers.keys.grep(/\Acache-control\z/i)).to eq(["cache-control"])
    expect(headers["cache-control"]).to eq("public, max-age=31536000, immutable")
  end

  it "leaves index.html to be revalidated on every visit" do
    _status, headers, = call("/index.html")
    expect(headers["cache-control"]).to eq("no-cache")
  end

  it "leaves the site root alone" do
    _status, headers, = call("/")
    expect(headers["cache-control"]).to eq("no-cache")
  end

  it "does not cache a missing asset" do
    _status, headers, = call("/assets/missing.js", status: 404)
    expect(headers["cache-control"]).to eq("no-cache")
  end

  it "passes the status and body through unchanged" do
    status, _headers, body = call("/assets/app.css")
    expect(status).to eq(200)
    expect(body).to eq(["body"])
  end
end
