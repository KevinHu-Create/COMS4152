Feature: View evaluation results
  As an instructor
  I want to view evaluation results for a presentation
  So that I can assess the presentation's performance

  Scenario: View results for an evaluated presentation
    Given I am signed in as an instructor
    And "Introduction to AI" has received evaluations
    When I click "View Results" for "Introduction to AI"
    Then I should see the total number of evaluations
    And I should see the average score for each evaluation category
    And I should see the individual evaluations

  Scenario: View results before anyone has evaluated
    Given I am signed in as an instructor
    And a presentation titled "Introduction to AI" exists
    When I click "View Results" for "Introduction to AI"
    Then I should see "No evaluations submitted yet for this event."

  Scenario: Students cannot open the results page
    Given I am signed in as a student
    And a presentation titled "Introduction to AI" exists
    When I open the results page for "Introduction to AI"
    Then I should see "Not authorized"
