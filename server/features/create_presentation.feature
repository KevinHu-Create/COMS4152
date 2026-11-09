Feature: Create a presentation event
  As an instructor
  I want to create a presentation event
  So that students can submit evaluations for it

  Scenario: Create an event with a presenter
    Given I am signed in as an instructor
    And Alice is a student in the course
    When I click "+ Create Event"
    And I enter "Introduction to AI" as the event title
    And I select "2026-11-20" as the date
    And I select Alice as the presenter
    And I click "Create"
    Then I should see "Introduction to AI" in the event list
    And Alice should be listed as its presenter

  Scenario: An event needs a title
    Given I am signed in as an instructor
    When I click "+ Create Event"
    And I select "2026-11-20" as the date
    And I click "Create"
    Then I should still see the "Create New Event" form
    And no presentation should have been created
