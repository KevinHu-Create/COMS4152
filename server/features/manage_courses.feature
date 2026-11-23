Feature: Manage courses
  As an instructor
  I want to create courses and switch between them
  So that each class I teach has its own presentation events

  Scenario: Create a new course
    Given I am signed in as an instructor
    When I click "+ New Course"
    And I fill in "Course Code" with "COMS4995"
    And I fill in "Term" with "Spring 2027"
    And I fill in "Section (optional)" with "002"
    And I fill in "Course Title" with "Topics in Software Engineering"
    And I click "Create Course"
    Then I should see the "Presentation Events" page
    And the selected course should be "COMS4995-002: Topics in Software Engineering (Spring 2027)"
    And I should see "No presentations yet."

  Scenario: A course needs a title
    Given I am signed in as an instructor
    When I click "+ New Course"
    And I fill in "Course Code" with "COMS4995"
    And I fill in "Term" with "Spring 2027"
    And I click "Create Course"
    Then I should see "Title can't be blank"

  Scenario: Switch between my courses
    Given I am signed in as a student
    And I am also enrolled in "COMS4995" titled "Topics in Software Engineering"
    And "Final Demo Day" is scheduled in "COMS4995"
    And a presentation titled "Introduction to AI" exists
    When I visit the presentation events page
    And I choose the course "COMS4995"
    Then I should see "Final Demo Day"
    And I should not see "Introduction to AI"

  Scenario: The event list remembers the course I picked
    Given I am signed in as a student
    And I am also enrolled in "COMS4995" titled "Topics in Software Engineering"
    When I visit the presentation events page
    And I choose the course "COMS4995"
    And I visit the presentation events page
    Then the selected course should be "COMS4995-001: Topics in Software Engineering (Fall 2026)"

  Scenario: Students cannot create courses or manage members
    Given I am signed in as a student
    When I visit the presentation events page
    Then I should not see "+ New Course"
    And I should not see "Manage Members"

  Scenario: A new account starts without courses
    Given I am on the login page
    When I click "Don't have an account? Sign up"
    And I fill in "Full Name" with "Taylor Kim"
    And I fill in "Email" with "taylor@example.com"
    And I fill in "Password" with "Password123!"
    And I click "Create Account"
    Then I should see "You are not enrolled in any course yet. Ask your instructor to add you."
