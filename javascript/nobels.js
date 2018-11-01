//Defining the constant all avoids having to use this throughout
const ALL = "All"

//Function to allow the JSON file to be used when the request has been sent, response returned and browser has downloaded the response content and the status is okay. Used try and catch to handle an error if there is an issue with the JSON file - used information from https://www.w3schools.com/js/js_errors.asp. 

function loadNobelWinners() {
 var xmlhttp = new XMLHttpRequest()
 var url = "nobelWinners.json"

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      try {        
        window.laureates = JSON.parse(xmlhttp.responseText).laureates.filter(laureate => laureate.firstname !== undefined) 
      } 
      catch(err) {
        document.getElementById("error").innerHTML = `${err}`
      }
        displayYearRange(window.laureates)
        displayCategories(window.laureates)
        displayCountries(window.laureates)
      }
  }
  xmlhttp.open("GET", url, true)
  xmlhttp.send()
}

//Function defined above called

loadNobelWinners()

//Function to capitalise the first letter of string. From https://dzone.com/articles/how-to-capitalize-the-first-letter-of-a-string-in  

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function formatDate(date) {
  return date.split('-').reverse().join('-')
}

//Function to display categories, similar for year range and countries. Laureates array is passed through the function displayCategories which defines the variable categories. The reduce() method executes a reducer function (that you provide) on each member of the array resulting in a single output value (From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce). In this case the reduce on laureates takes an accumulator (a new set tht starts with all) and a function which takes prizes and reduces each prize to it's category and adds it to an accumlulator. This is passed to the outer function and added to the new set.

function displayCategories(laureates) {
  var categories = laureates.reduce((acc, laureate) => {
    return laureate.prizes.reduce((categoryAcc, prize) => {
      if (prize.category !== undefined){
        return categoryAcc.add(prize.category)
      } else {
        return categoryAcc
      }
    }, acc)
  }, new Set([ALL]))

  //Function to create a options under the dropdown from each category found above. This is added to the categories html and the first letter of each capitalised.
  
  var options = "";
  Array.from(categories).sort().forEach(category => {
      options += "<option>" + capitalizeFirstLetter(category) + "</option>"
  })  

  document.getElementById("categories").innerHTML = options
}

function displayCountries(laureates) {
  var countries = laureates.reduce((acc,laureate) => {
    if (laureate.bornCountry !== undefined){
      return acc.add(laureate.bornCountry)}
    else {
      return acc
    }
  } , new Set([ALL]))
                                   
  var options = "";
  Array.from(countries).sort().forEach(bornCountry => {
      options += "<option>" + capitalizeFirstLetter(bornCountry) + "</option>"
  })  

  document.getElementById("bornCountry").innerHTML = options
}

function displayYearRange(laureates) {
  var startYear = laureates.reduce((acc, laureate) => {
    return laureate.prizes.reduce((startAcc, prize) => {
      if (prize.year !== undefined){
        return startAcc.add(prize.year)
      } else {
        return startAcc
      }
    },acc)
  }, new Set([]))


  var startOptions = ""
  Array.from(startYear).sort().forEach(startYear => {
    startOptions += "<option>" + startYear +"</option>"
  })

  document.getElementById("startYear").innerHTML = startOptions
  
  var endYear = laureates.reduce((acc, laureate) => {
    return laureate.prizes.reduce((endAcc, prize) => {
      if (prize.year !== undefined){
        return endAcc.add(prize.year)
      } else {
        return endAcc
      }
    }, acc)
  }, new Set([]))
  
  var endOptions = ""
  Array.from(endYear).sort().reverse().forEach(endYear => {
    endOptions += "<option>" + endYear +"</option>"
  })

  document.getElementById("endYear").innerHTML = endOptions
  
}

//This function gets the values of the criteria back from the selections.

function submitCriteria(laureates, gender) {
  const category = document.getElementById("categories").value
  const country = document.getElementById("bornCountry").value
  const startYear = document.getElementById("startYear").value
  const endYear = document.getElementById("endYear").value
  
  //Define the constant filteredbycountries which has the value from the function laureate where country has the value all or the country is not undefined and the bornCountry in the Json file is the same as that defined in submitCriteria for categories
  //The filter() method creates a new array with all elements that pass the test implemented by the provided function - from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  
  const filteredByCountries = laureates.filter(laureate => {
    return country === ALL || laureate.bornCountry !== undefined && laureate.bornCountry.toLowerCase() === country.toLowerCase()
  })
  
  //Define the constant filteredByYears which gets all years that range from greater than or equal to the chosen start year and less than of equal to the chosen end year. 
  
  const filteredByYears = filteredByCountries.filter(laureate => laureate.prizes.some(prize => {
    var isStartYear = parseInt(prize.year) >= parseInt(startYear)
    var isEndYear = parseInt(prize.year) <= parseInt(endYear)
    var isInRange = isStartYear && isEndYear
    var isAll = (category === ALL)
    return isInRange && (isAll || prize.category === category.toLowerCase())
  }))
  
  
  //Creates template - fill in values
  
  const filteredLaureates = removeOtherCategories(filteredByYears, category)
  window.filteredLaureates = filteredLaureates
  const header = '<table><tr><th>Firstname</th><th>Surname</th><th>Category</th><th>Year</th></tr>'
  var id = -1
  const laureatesHtml = filteredLaureates.reduce((acc, laureate) => {
    id = id + 1
    return `${acc}<tr id="${id}" onclick="displayDetailedInfo(${id})">
    <td>${laureate.firstname}</td>
    <td>${laureate.surname || ""}</td>
    <td>${htmlForCategoryCell(laureate.prizes)}</td>
    <td>${htmlForYearCell(laureate.prizes)}</td>
    </tr>
    <tr><td id="${id}-extra" colspan="4"></td></tr>` 
  }, header) + "</table>"
  
  document.getElementById("filterNobels").innerHTML = laureatesHtml
  
  displayGenderToggle(gender)
  
}

function displayDetailedInfo(id) {
  const laureate = window.filteredLaureates[id]
  const tableRowExtra = document.getElementById(`${id}-extra`)
  const display = tableRowExtra.innerHTML.length === 0
  const birthString = laureate.born === '0000-00-00' ? '' : `<li id="infotitle">Date of Birth: ${formatDate(laureate.born)}</li>`
  const deathString = laureate.died === '0000-00-00' ? '' : `<li id="infotitle">Date of Death: ${formatDate(laureate.died)}</li>`
  const bornString = laureate.bornCity === undefined ? '' : `<li id="infotitle">City of Birth: ${capitalizeFirstLetter(laureate.bornCity)}</li>`
  if (display) {
    tableRowExtra.innerHTML = `<ul>
    ${birthString}
    ${deathString}
    ${bornString}
    <li id="infotitle">Motivation: ${htmlForMotivation(laureate.prizes) || "No Information Available"}</li>
    <li id="infotitle">Affiliations: ${htmlForAffiliation(laureate.prizes)  || "No Information Available"}</li>
    </ul>`
  } else {
    tableRowExtra.innerHTML = ``
  }
}

//The map() method creates a new array with the results of calling a provided function on every element in the calling array.

function htmlForCategoryCell(prizes) {
  return prizes.map(prize => prize.category).join(", ")
}
  
function htmlForYearCell(prizes) {
  return prizes.map(prize => prize.year).join(", ")
}

//The flatMap() method first maps each element using a mapping function, then flattens the result into a new array. It is identical to a map followed by a flat of depth 1, but flatMap is often quite useful, as merging both into one method is slightly more efficient. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap

function htmlForMotivation(prizes) {
  return prizes.flatMap(prize => {
    if (prize.motivation === undefined) {
        return []
      } else {
        return [prize.motivation]
      }
    }).join(" & <br>")
}  

function htmlForAffiliation(prizes) {
  return prizes
    .flatMap(prize => prize.affiliations.reduce((acc, affiliation) => {
      if (Array.isArray(affiliation)) {
        return acc 
      } else {
        acc.push(`${affiliation.city} ${affiliation.country} ${affiliation.name}`)
        return acc
      }
    },[])).join(" & <br>")
} 

function removeOtherCategories(laureates, category) {
  return laureates.map(laureate => {
    const filteredPrizes = laureate.prizes.filter(prize => category === ALL || prize.category === category.toLowerCase())
    
    return Object.assign({},laureate, {prizes: filteredPrizes})
  })
}
  
function displayGenderToggle(gender) {
  var divGenderToggle = document.getElementById('gendertoggle')
  var maleChecked = ''
  var femaleChecked = ''
  var allChecked = ''
  
  if (gender === 'male') {
    maleChecked='checked="checked"' 
  } else if (gender === 'female') {
    femaleChecked='checked="checked"' 
  } else {
    allChecked = 'checked="checked"'
  }
 
// https://stackoverflow.com/questions/5592345/how-to-select-a-radio-button-by-default used for help with radio buttons
  
  divGenderToggle.innerHTML = `
    <input type="radio" name="gender" onchange="genderfilter(this, 'female')" value="female" ${femaleChecked}>Female<br>
    <input type="radio" name="gender" onchange="genderfilter(this, 'male')"   value="male"   ${maleChecked}  >Male<br>
    <input type="radio" name="gender" onchange="genderfilter(this, ALL)"    value="All"    ${allChecked}   >All<br>`
}
  
  
function genderfilter(checkbox, gender) {
  if(checkbox.checked === true){  
    const filteredByGender = window.laureates.filter(laureate => gender === ALL || laureate.gender === gender)
    submitCriteria(filteredByGender, gender)
  }
}
