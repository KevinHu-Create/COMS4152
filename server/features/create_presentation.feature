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

  Scenario: Create an event with a time and a location
    Given I am signed in as an instructor
    When I click "+ Create Event"
    And I enter "Introduction to AI" as the event title
    And I select "2026-11-20" as the date
    And I set the "Start Time" field to "10:00"
    And I set the "End Time" field to "10:15"
    And I set the "Location" field to "Mudd 833"
    And I click "Create"
    Then I should see "Introduction to AI" in the event list
    And the card for "Introduction to AI" should show "10:00 – 10:15"
    And the card for "Introduction to AI" should show "Mudd 833"

  Scenario: An event cannot end before it starts
    Given I am signed in as an instructor
    When I click "+ Create Event"
    And I enter "Introduction to AI" as the event title
    And I select "2026-11-20" as the date
    And I set the "Start Time" field to "11:00"
    And I set the "End Time" field to "10:30"
    And I click "Create"
    Then I should see "End time must be after the start time"
    And no presentation should have been created

  Scenario: An event needs a title
    Given I am signed in as an instructor
    When I click "+ Create Event"
    And I select "2026-11-20" as the date
    And I click "Create"
    Then I should see "Please enter a title and a date."
    And I should still see the "Create New Event" form
    And no presentation should have been created
