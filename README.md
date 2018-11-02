Requirements:

1. nobels.html allows you to select a start year, an end year, a country of birth and a category. Start year defaults to 1901 and end year defaults to 2018 - there is no option to remove this information. Both country of birth and prize category default to all. Submit button provided.

2. Clicking the submit will update the display based on the criteria in a table. A radio button appears and allows you to filter the results based on female, male or all.

3. When a row is clicked, a row below appears with a list that includes more detailed information on the laureate - year of birth, year of death, city of birth, motivation and affiliation.

4. Styling has been used on the file. Error handling has been included:

  * If the end year is before the start year, nothing will be returned. No option to enter nothing
  * There is a try and catch statment around loading the JSON file that will show an error, if there is an issue with the JSON file. 
  * Error shown if there is a 404 status, 500 status or any status that is not 200
  * If the first name is undefined, the information is assumed to be bad and not included as all winners have a first name even companies
  * For the drop down menus, any information that is undefined is not included.
  * In the more information lists, if the birth year, death year or birth city is undefined it is not included. If the motivation or affiliations is undefined, No information available is returned.
  
Other notes:

  * Comments added to js file to make it easier if I need to reuse the information again.
  * Javascript added to seperate file for clarity. Brackets is showing [linting](https://en.wikipedia.org/wiki/Lint_%28software%29) errors as it is expecting ECMA script version 5 and I am using some ECMA script features from versions 6 and 7 which is supported in all modern browers. A .eslintrc file is included to reduce the errors shown.