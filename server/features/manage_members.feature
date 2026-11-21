Feature: Manage course members
  As an instructor
  I want to add and remove the people in my course
  So that only my students can see and evaluate the course's presentations

  Scenario: Add a student by email
    Given I am signed in as an instructor
    And "Jordan Lee" has an account with the email "jordan@example.com"
    When I click "Manage Members"
    And I fill in "Email" with "jordan@example.com"
    And I click "Add Member"
    Then I should see "Jordan Lee was added to the course."
    And "Jordan Lee" should be listed as "Student"

  Scenario: Add a teaching assistant
    Given I am signed in as an instructor
    And "Jordan Lee" has an account with the email "jordan@example.com"
    When I click "Manage Members"
    And I fill in "Email" with "jordan@example.com"
    And I select "TA" from "Role"
    And I click "Add Member"
    Then "Jordan Lee" should be listed as "TA"

  Scenario: Add an email that has no account
    Given I am signed in as an instructor
    When I click "Manage Members"
    And I fill in "Email" with "ghost@example.com"
    And I click "Add Member"
    Then I should see "No user with that email"

  Scenario: Add someone who is already in the course
    Given I am signed in as an instructor
    And Alice is a student in the course
    When I click "Manage Members"
    And I fill in "Email" with "alice@example.com"
    And I click "Add Member"
    Then I should see "Alice is already in this course"

  Scenario: Remove a student
    Given I am signed in as an instructor
    And Alice is a student in the course
    When I click "Manage Members"
    And I remove "Alice" from the course
    Then I should see "Alice was removed from the course."
    And "Alice" should not be listed as a member

  Scenario: Change my mind about removing a student
    Given I am signed in as an instructor
    And Alice is a student in the course
    When I click "Manage Members"
    And I start removing "Alice" but cancel
    Then "Alice" should be listed as "Student"

  Scenario: Students can see who is in the course but cannot change it
    Given I am signed in as a student
    When I open the members page for the course
    Then "Professor Smith" should be listed as "Instructor"
    And I should not see "Add Member"
    And I should not see "Remove"

  Scenario: People outside the course cannot see its events or evaluate them
    Given "Jordan Lee" has an account with the email "jordan@example.com"
    And a presentation titled "Introduction to AI" exists
    And I am signed in as "jordan@example.com"
    When I open the evaluation form for "Introduction to AI"
    Then I should see "You are not a member of this course"
    And I should not see "Submit Evaluation"
