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
    When I open the evaluation form for "My Project Demo"
    Then I should see "This is your presentation, so you cannot evaluate it."
    And there should be no evaluation form

  Scenario: A student cannot evaluate the same presentation twice
    Given I am signed in as a student
    And I have already evaluated "Introduction to AI"
    When I open the evaluation form for "Introduction to AI"
    Then I should see "You have already evaluated this presentation."
    And there should be no evaluation form

  Scenario: A presentation cannot be evaluated before it happens
    Given I am signed in as a student
    And "Final Demo Day" is scheduled for next week
    When I open the evaluation form for "Final Demo Day"
    Then I should see "This presentation has not happened yet."
    And there should be no evaluation form

  Scenario: Every category needs a score
    Given I am signed in as a student
    And I am viewing the evaluation form for "Introduction to AI"
    When I select the following scores:
      | Category                     | Score |
      | Clarity of explanation       | 4     |
      | Organization of presentation | 5     |
    And I click "Submit Evaluation"
    Then I should not see "Thank you! Your evaluation has been recorded."
    And no evaluation should have been saved
