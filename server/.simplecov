# Shared SimpleCov settings for RSpec (spec/spec_helper.rb) and Cucumber
# (features/support/env.rb). Both suites write to coverage/ and SimpleCov
# merges their results, so after running both (bin/test) coverage/index.html
# shows the combined coverage.
SimpleCov.configure do
  enable_coverage :branch
  skip "/spec/"
  skip "/features/"
  merge_timeout 3600
end
