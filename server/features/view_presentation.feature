Feature: View presentation events
  As a student
  I want to view available presentation events
  So that I can choose a presentation to evaluate

  Scenario: View an existing presentation
    Given I am signed in as a student
    And a presentation titled "Introduction to AI" exists
    When I visit the presentation events page
    Then I should see "Introduction to AI"
    And I should see its date and presenter

  Scenario: No presentations have been scheduled
    Given I am signed in as a student
    When I visit the presentation events page
    Then I should see "No presentations yet."

  Scenario: Students cannot manage events
    Given I am signed in as a student
    And a presentation titled "Introduction to AI" exists
    When I visit the presentation events page
    Then I should not see "+ Create Event"
    And I should not see "View Results"
