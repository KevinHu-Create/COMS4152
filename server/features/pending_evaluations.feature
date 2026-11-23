Feature: Presentations waiting for my evaluation
  As a student
  I want to see which presentations I still need to evaluate
  So that I do not forget to give my classmates feedback

  Scenario: See presentations waiting for my evaluation
    Given I am signed in as a student
    And "Introduction to AI" was presented today
    And "Database Design" was presented last week
    And "Final Demo Day" is scheduled for next week
    When I visit the presentation events page
    Then "Introduction to AI" should be waiting for my evaluation
    And "Database Design" should be waiting for my evaluation
    And "Final Demo Day" should not be waiting for my evaluation
    And the card for "Final Demo Day" should show "Upcoming"

  Scenario: An evaluated presentation leaves the list
    Given I am signed in as a student
    And "Introduction to AI" was presented today
    When I visit the presentation events page
    And I click "Evaluate" for the waiting presentation "Introduction to AI"
    And I give every category a score of 4
    And I click "Submit Evaluation"
    Then I should see "Thank you! Your evaluation has been recorded."
    When I visit the presentation events page
    Then I should see "You're all caught up!"
    And the card for "Introduction to AI" should show "Evaluated"

  Scenario: My own presentation is not waiting for me
    Given I am signed in as a student
    And I am a presenter for "My Project Demo"
    When I visit the presentation events page
    Then "My Project Demo" should not be waiting for my evaluation
    And the card for "My Project Demo" should show "Your presentation"

  Scenario: Only the selected course's presentations are listed
    Given I am signed in as a student
    And I am also enrolled in "COMS4995" titled "Topics in Software Engineering"
    And "Final Demo Day" is scheduled in "COMS4995"
    And "Introduction to AI" was presented today
    When I visit the presentation events page
    Then "Introduction to AI" should be waiting for my evaluation
    And "Final Demo Day" should not be waiting for my evaluation
    When I choose the course "COMS4995"
    Then "Final Demo Day" should be waiting for my evaluation

  Scenario: Instructors do not get a to-do list
    Given I am signed in as an instructor
    And "Introduction to AI" was presented today
    When I visit the presentation events page
    Then I should not see "Waiting for your evaluation"
