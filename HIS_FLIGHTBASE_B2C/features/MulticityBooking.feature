Feature: Flight BASE UI Sanity - Multicity Booking

    # Scenario Outline drives only the Multicity flight (search) variations.

    Scenario Outline: User completes a Multicity flight booking with varying search inputs
        Given the user launches the Flight BASE application
        Then the Top Page should display header, product tabs, and search form
        Then the “Flight” tab should be selected by default in Japanese
        When the user selects Multicity Trip with 3 flight segments
            | segment | departure1   | destination1   | departure2   | destination2   | departure3   | destination3   |
            | 1       | <departure1> | <destination1> | <departure2> | <destination2> | <departure3> | <destination3> |

        And the user selects seat class <seatClass> with adult <adultPassengerCount> child <childPassengerCount> infant <infantPassengerCount>
        And the user clicks on Search for flights
        Then the search results for the 3-segment trip with selected passengers and seat class should be displayed

        Examples:
            | departure1   | destination1 | departure2   | destination2         | departure3           | destination3 | seatClass | adultPassengerCount | childPassengerCount | infantPassengerCount |
            | 東京国際空港  | スィノプ空港  | スィノプ空港   | ニノイアキノ国際空港   | ニノイアキノ国際空港   | 成田国際空港 | ECONOMY    | 2                   | 1                   | 1                    |
