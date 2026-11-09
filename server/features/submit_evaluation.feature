Feature: Submit a presentation evaluation
  As a student
  I want to submit scores and comments for a presentation
  So that I can give the presenter useful feedback

  Scenario: Submit an evaluation successfully
    Given I am signed in as a student
    And I am viewing the evaluation form for "Introduction to AI"
    And I am not a presenter for this presentation
    And I have not evaluated this presentation before
    When I select the following scores:
      | Category                     | Score |
      | Clarity of explanation       | 4     |
      | Organization of presentation | 5     |
      | Delivery & engagement        | 4     |
      | Overall quality              | 4     |
    And I enter "Clear explanations and helpful examples." as my comment
    And I click "Submit Evaluation"
    Then I should see "Thank you! Your evaluation has been recorded."
    And my evaluation should be saved with an overall score of 4

  Scenario: A presenter cannot evaluate their own presentation
    Given I am signed in as a student
    And I am a presenter for "My Project Demo"
    And I am viewing the evaluation form for "My Project Demo"
    When I give every category a score of 5
    And I click "Submit Evaluation"
    Then I should see "You cannot evaluate your own presentation"
    And no evaluation should have been saved

  Scenario: A student cannot evaluate the same presentation twice
    Given I am signed in as a student
    And I have already evaluated "Introduction to AI"
    And I am viewing the evaluation form for "Introduction to AI"
    When I give every category a score of 3
    And I click "Submit Evaluation"
    Then I should see "Evaluator has already submitted an evaluation"
