Feature: Edit and delete presentation events
  As an instructor
  I want to change or remove presentation events
  So that the schedule stays correct when plans change

  Scenario: Change an event's title and location
    Given I am signed in as an instructor
    And a presentation titled "Introduction to AI" exists
    When I click "Edit" for "Introduction to AI"
    And I fill in "Event Title" with "Intro to Machine Learning"
    And I fill in "Location" with "Online"
    And I click "Save Changes"
    Then I should see "Intro to Machine Learning" in the event list
    And the card for "Intro to Machine Learning" should show "Online"
    And I should not see "Introduction to AI"

  Scenario: Change who presents
    Given I am signed in as an instructor
    And Alice is a student in the course
    And a presentation titled "Introduction to AI" exists
    When I click "Edit" for "Introduction to AI"
    And I uncheck "Bob Lee"
    And I check "Alice"
    And I click "Save Changes"
    Then the card for "Introduction to AI" should show "Presented by Alice"

  Scenario: Times must be in the right order
    Given I am signed in as an instructor
    And a presentation titled "Introduction to AI" exists
    When I click "Edit" for "Introduction to AI"
    And I set the "Start Time" field to "15:00"
    And I set the "End Time" field to "14:00"
    And I click "Save Changes"
    Then I should see "End time must be after the start time"
    And the presentation "Introduction to AI" should be unchanged

  Scenario: Delete an event
    Given I am signed in as an instructor
    And a presentation titled "Introduction to AI" exists
    When I click "Edit" for "Introduction to AI"
    And I delete the event and confirm
    Then I should see "No presentations yet."
    And the presentation "Introduction to AI" should no longer exist

  Scenario: Change my mind about deleting an event
    Given I am signed in as an instructor
    And a presentation titled "Introduction to AI" exists
    When I click "Edit" for "Introduction to AI"
    And I delete the event but cancel
    Then I should still be on the edit page for "Introduction to AI"

  Scenario: Students cannot edit events
    Given I am signed in as a student
    And a presentation titled "Introduction to AI" exists
    When I visit the presentation events page
    Then I should not see "Edit"
    When I open the edit page for "Introduction to AI"
    Then I should see "Only the course's instructors and TAs can edit events."
