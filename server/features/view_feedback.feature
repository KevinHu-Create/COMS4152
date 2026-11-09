Feature: View anonymous feedback
  As a presenter
  I want to view scores and anonymous comments for my presentation
  So that I can improve my presentation skills

  Scenario: View feedback for my presentation
    Given I am signed in as a presenter
    And my presentation has received an evaluation
    And the evaluation includes the comment "Helpful examples."
    When I click "My Feedback"
    Then I should see my presentation title
    And I should see the average score for each evaluation category
    And I should see "Helpful examples."
    But I should not see the evaluator's name

  Scenario: No feedback yet
    Given I am signed in as a student
    When I click "My Feedback"
    Then I should see "You don't have any feedback yet."
