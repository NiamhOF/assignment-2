//Defining the constant all avoids having to use this throughout
const ALL = "All"

//Function to load the JSON file through a HTTP request. Used try and catch to handle an error if there is an issue with the JSON file - used information from https://www.w3schools.com/js/js_errors.asp. 

function loadNobelWinners() {
 var xmlhttp = new XMLHttpRequest()
 var url = "nobelWinners.json"

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        try {
          // Put this on the global window object so it can be resused when filtering by gender
          window.laureates = JSON.parse(xmlhttp.responseText).laureates.filter(laureate => laureate.firstname !== undefined) 
        } 
        catch(err) {
          document.getElementById("error").innerHTML = `Error parsing JSON laureates: ${err}`
          document.getElementById("criteria").innerHTML = ``
        }
        displayYearRange(window.laureates)
        displayCategories(window.laureates)
        displayCountries(window.laureates)
      } else if (xmlhttp.status == 404) {
          document.getElementById("error").innerHTML =`Nobel laureates json file not found`
          document.getElementById("criteria").innerHTML = ``
      } else if (xmlhttp.status == 500) {
          document.getElementById("error").innerHTML =`Fatal server error when retrieving Nobel laureates json file`
          document.getElementById("criteria").innerHTML = ``
      } else if (xmlhttp.status != 200) {
          document.getElementById("error").innerHTML =`Something went wrong ReadyState: ${xmlhttp.readyState}   Status: ${xmlhttp.status}`
          document.getElementById("criteria").innerHTML = ``
      }
  }
  xmlhttp.open("GET", url, true)
  xmlhttp.send()
}

//Function to capitalise the first letter of string. From https://dzone.com/articles/how-to-capitalize-the-first-letter-of-a-string-in  

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function extractYear(date) {
  return date.split('-')[0]
}

//The reduce() method executes a reducer function (that you provide) on each member of the array resulting in a single output value (From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce). In this case the reduce on laureates takes an accumulator (a new set tht starts with all) and a function which takes prizes and reduces each prize to it's category and adds it to an accumlulator. This is passed to the outer function and added to the new set.

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

  //Function to create options under the dropdown from each unique category found above. This is added to the categories html and the first letter of each category is capitalised.
  
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

function submitCriteria(laureates, gender) {
  const category = document.getElementById("categories").value
  const country = document.getElementById("bornCountry").value
  const startYear = document.getElementById("startYear").value
  const endYear = document.getElementById("endYear").value

  //The filter() method creates a new array with all elements that pass the test implemented by the provided function - from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  
  const filteredByCountries = laureates.filter(laureate => {
    return country === ALL || laureate.bornCountry !== undefined && laureate.bornCountry.toLowerCase() === country.toLowerCase()
  })
  
  //Define the constant filteredByAll which takes the filteredByCountries constant and filters it by the selected year range and on the selected category or all.
  
  const filteredByAll = filteredByCountries.filter(laureate => laureate.prizes.some(prize => {
    var isStartYear = parseInt(prize.year) >= parseInt(startYear)
    var isEndYear = parseInt(prize.year) <= parseInt(endYear)
    var isInRange = isStartYear && isEndYear
    var isAll = (category === ALL)
    return isInRange && (isAll || prize.category === category.toLowerCase())
  }))
  
  
  const filteredLaureates = removeOtherCategories(filteredByAll, category)
  
  // Put this on the global window object so it can be resused when displaying detailed info about a Laureate
  window.filteredLaureates = filteredLaureates
  
  const header = '<table><tr><th>Firstname</th><th>Surname</th><th>Category</th><th>Year</th></tr>'
  var id = -1
  const laureatesHtml = filteredLaureates.reduce((acc, laureate) => {
    id = id + 1
    return `${acc}<tr id="${id}" onclick="displayDetailedInfo(${id})">
    <td>${laureate.firstname}</td>
    <td>${laureate.surname || ""}</td>
    <td>${capitalizeFirstLetter(htmlForCategoryCell(laureate.prizes))}</td>
    <td>${htmlForYearCell(laureate.prizes)}</td>
    </tr>
    <tr><td class="hiddenRow" id="${id}-extra" colspan="4" style="height:0px"></td></tr>` 
  }, header) + "</table>"
  
  document.getElementById("filterNobels").innerHTML = laureatesHtml
  
  displayGenderToggle(gender)
  
}

function displayDetailedInfo(id) {
  const laureate = window.filteredLaureates[id]
  const tableRowExtra = document.getElementById(`${id}-extra`)
  const display = tableRowExtra.innerHTML.length === 0
  const birthString = laureate.born === '0000-00-00' ? '' : `<li id="infotitle"><b>Year of Birth</b>: ${extractYear(laureate.born)}</li>`
  const deathString = laureate.died === '0000-00-00' ? '' : `<li id="infotitle"><b>Year of Death:</b> ${extractYear(laureate.died)}</li>`
  const bornString = laureate.bornCity === undefined ? '' : `<li id="infotitle"><b>City of Birth:</b> ${capitalizeFirstLetter(laureate.bornCity)}</li>`
  if (display) {
    tableRowExtra.innerHTML = `<ul>
    ${birthString}
    ${deathString}
    ${bornString}
    <li id="infotitle"><b>Motivation:</b> ${htmlForMotivation(laureate.prizes) || "No Information Available"}</li>
    <li id="infotitle"><b>Affiliations:</b> ${htmlForAffiliation(laureate.prizes)  || "No Information Available"}</li>
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
    <p><b>Filter list by gender</b></p>
    <input type="radio" id="all" name="gender" onchange="genderfilter(this, ALL)"    value="All"  ${allChecked}><span class="check"></span>All
    <input type="radio" id="female" name="gender" onchange="genderfilter(this, 'female')" value="female" ${femaleChecked}><span class="check"></span>Female
    <input type="radio" id="male" name="gender" onchange="genderfilter(this, 'male')"   value="male"   ${maleChecked}><span class="check"></span>Male`
}

//Function that takes the selction from the radio buttons and filters the results of submitCriteria based on the selected gender.
  
function genderfilter(checkbox, gender) {
  if(checkbox.checked === true){  
    const filteredByGender = window.laureates.filter(laureate => gender === ALL || laureate.gender === gender)
    submitCriteria(filteredByGender, gender)
  }
}



// Entrypoint into javascript program. 
// This will execute a callback function to display the selection inteface after loading laureates JSON successfully.
loadNobelWinners()
