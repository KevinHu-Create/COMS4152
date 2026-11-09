Feature: User login
  As a registered user
  I want to sign in to my account
  So that I can access the presentation evaluation system

  Scenario: Log in with valid credentials
    Given I have a registered account
    And I am on the login page
    When I enter my correct email and password
    And I click "Sign In"
    Then I should see the "Presentation Events" page

  Scenario: Log in with the wrong password
    Given I have a registered account
    And I am on the login page
    When I enter my email with the password "not-my-password"
    And I click "Sign In"
    Then I should see "Invalid email or password"
    And I should still be on the login page

  Scenario: Visiting the event list without signing in
    When I visit the presentation events page
    Then I should still be on the login page
