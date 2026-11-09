Feature: User sign up
  As a new student
  I want to create an account
  So that I can take part in presentation evaluations

  Scenario: Create a new account
    Given I am on the login page
    When I click "Don't have an account? Sign up"
    And I fill in "Full Name" with "Taylor Kim"
    And I fill in "Email" with "taylor@example.com"
    And I fill in "Password" with "Password123!"
    And I click "Create Account"
    Then I should see the "Presentation Events" page
    And I should see "Welcome, Taylor Kim (student)"

  Scenario: Sign up with an email that is already registered
    Given I have a registered account
    And I am on the login page
    When I click "Don't have an account? Sign up"
    And I fill in "Full Name" with "Someone Else"
    And I fill in "Email" with my email
    And I fill in "Password" with "Password123!"
    And I click "Create Account"
    Then I should see "Email has already been taken"
