Feature: Flight BASE UI Sanity - End-to-End Flow

  # Scenario Outline drives only the flight (search) variations.
  # Other data (login, passengers, payment) comes from shared testData/common dataset.

  Scenario Outline: User completes a flight booking with varying search inputs
    Given the user launches the Flight BASE application
    Then the Top Page should display header, product tabs, and search form
    Then the “Flight” tab should be selected by default in Japanese
    When the user selects Round Trip with flight search data <departureAirport> to <destinationAirport> carrier <carrier> seat class <seatClass> adult <adultPassengerCount> child <childPassengerCount>
    Then the search form fields should be visible and user should be redirected to results
    Then outbound flights should be displayed
    When the user selects an outbound flight
    Then the outbound flight selection page should load
    When the user selects a return flight
    Then the return flight selection page should load
    Then flight listings and itinerary details should be displayed
    When the user clicks “View Plan”
    Then booking plans should be shown in grid format
    When the user clicks “Book with this Plan”
    Then the Passenger Info page should load
    Then Login and Register buttons should be visible for non-logged-in users
    Then “Applicant Information” section should be visible for logged-in users
    Then user should be able to enter mandatory passenger details
    When the user proceeds to select additional services
    Then Option Selection Page should load with breadcrumb
    Then the user selects additional checked baggage options
    Then HISWeb Set Insurance section should be visible
    When the user clicks “Proceed to Confirm Input Contents”
    Then Input Confirmation Page should load and display passenger details
    Then “Proceed to Payment” button should be active and clickable
    When the user enters payment details and proceeds
    Then HIS Reservation Number should be displayed

    Examples:
      | departureAirport | destinationAirport   | carrier | seatClass | adultPassengerCount | childPassengerCount |
      | 成田国際空港      | ブリスベン空港       | JQ      | ECONOMY  | 1                   | 1                  |
      | 東京国際空港     | ロサンゼルス国際空港 | 1A      | ECONOMY   | 1                   | 1                   |


