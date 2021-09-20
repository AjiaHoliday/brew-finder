const searchBrew = document.getElementById("searchBrew");
const searchBtn = document.getElementById("searchBtn");
const brewColl = document.getElementById("brew-name-sub");
const mapEl = document.getElementById("map");
const clearFavs = document.getElementById("clearFavs");
const recentItems = document.getElementsByClassName("historyItem");
const clearRecents = document.getElementById("clearRecents");

var favoriteSaves;
var recentSearches;

let brewCoordArr = [];
let currentLocation= [];

function getLocation() {
    
    if (navigator.geolocation) {
    
        navigator.geolocation.getCurrentPosition(showPosition);
    }
};

function showPosition(position) {
    
    let location = {
    
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }

  currentLocation.push(location);
  currentMap();
};

// Search Button Event
searchBtn.addEventListener("click", (e) => {
    formSubmit(e);
});

document.addEventListener("keypress", (e) => {
    
    if (e.key === "Enter") {
        formSubmit(e);
    }
});

//Get Value of Search Bar
function formSubmit(e) {
    
    localStorage.setItem('currentCity', JSON.stringify(searchBrew.value.toUpperCase()));
    
    let city = searchBrew.value.split(' ').join('_');
    
    if (!city) {
        enterCityError();
    } else {
        
        getBrew(city);
    } 
}

function getBrew(city) {
    
    let brewApi = "https://api.openbrewerydb.org/breweries?by_city=" + city +"&per_page=3" +"&by_type=brewpub&sort=id:desc&sort=phone:asc";
    
    fetch(brewApi).then((response)=>{
        
        if (response.ok){
            
            response.json().then(function(brews) {
                
                if (brews.length === 0) {
                   
                    enterCityError(city);
                    searchBrew.value= "";
                } else {
                    searchFunction();
                    displayBrew(brews);
                    searchBrew.value= "";
                }
            })
        }
    })
}

function enterCityError() {
    
    var modal = document.querySelector('.modal');
    modal.classList.add('is-active');
        
    modal.querySelector('.modal-background').addEventListener('click', function(e) {
        
        e.preventDefault();
        modal.classList.remove('is-active');
    })

    modal.querySelector('.modal-close').addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.remove('is-active');
    })
}

//display brew list 
function displayBrew (brews){

    brewColl.innerText = "";
    let brewLoc = document.createElement("h2");
    brewLoc.innerHTML = brews[0].city + " Breweries";
    brewColl.appendChild(brewLoc);
    brewCoordArr = [];
    
    for(var i=0; i<brews.length; i++){
        
        let brew = brews[i];
        let locations = {
        
            lat: brew.latitude,
            lng: brew.longitude
        }
        
        let brewCard=document.createElement("div");
        brewCard.setAttribute("class","brewD control box ml-auto mr-auto pl-2 has-icons-right");
        
        let brewInfo = document.createElement("div");
        brewInfo.setAttribute("class", "brew-description block pl-6");
        brewInfo.innerHTML = brew.name + "<br>" + brew.street + "<br>" + brew.city + ", " + brew.state;
        brewCard.appendChild(brewInfo);

        var faveBrewAdd = document.createElement("span");
        faveBrewAdd.setAttribute("class", "icon is-right");
        faveBrewAdd.innerHTML = "<ion-icon name='add-circle-outline' size='small' class='addFaveBtn"+[i]+" icon is-right mx-auto my-auto'></ion-icon>";
        brewCard.appendChild(faveBrewAdd);

        brewColl.appendChild(brewCard);
        
        if (locations.lat != null){
        
            brewCoordArr.push(locations);
        }
    }

    saveFavorite();
    brewMap();
}

// localstorage for favorites
function saveFavorite () {
    let favorites = document.querySelectorAll(".brew-description");
    favoriteSaves = JSON.parse(localStorage.getItem("favorites")) || [];  
    // listener for the click to add to favorites
     favorites.forEach(favorites => { favorites.addEventListener("click", function(event){
    
        // on click of context will start the adding process to local
        let collectFavs = event.target.innerHTML.split("<br>");
        // pushes the context into the array
        favoriteSaves = favoriteSaves || [];
        favoriteSaves.push(collectFavs);
        // saves the clicked section to localstorage
        localStorage.setItem("favorites", JSON.stringify(favoriteSaves));
        

        

        //function to paste favorites
        pasteFavorites();
    
        });
    });
};

function clearFavBox() {
    document.getElementById("fav").innerHTML = "";
}
function clearRecentBox() {
    document.getElementById("recents").innerHTML = ""
}
// paste our favorites from local to the page
let pasteFavorites = function(){
    clearFavBox();
    
    favoriteSaves = JSON.parse(localStorage.getItem("favorites"));


    $.each(removeDuplicates(favoriteSaves), function (index,value) {
        $('.fav').append("<div class='favItem column is-two-fifths py-4 mx-auto''><a href='http://maps.google.com/?q="+ value.slice(1,2)+"' target='_blank'>" + value.slice(0,1)+"<br>"+ value.slice(2,3)+ '<ion-icon name="navigate-outline"></ion-icon></a></div>');
    });
}

function searchFunction(){
    
    recentSearches = [];
    recentSearches.push($("#searchBrew").val().toUpperCase());
    $('#searchBrew').val("");
    $('.past-brews').text("");

    if (recentSearches) {
    
        var pastBrews = JSON.parse(window.localStorage.getItem("pastBrews"))||[];
        var newBrew = recentSearches;
    };
    
    // save to local storage
    pastBrews.push(newBrew);
    window.localStorage.setItem("pastBrews",JSON.stringify(pastBrews));

    loadRecentSearches();
}

var loadRecentSearches = function() {
    clearRecentBox()
    recentSearches = JSON.parse(window.localStorage.getItem("pastBrews"));
    
    $.each(removeDuplicates(recentSearches), function (value,index) {
    
        $('.past-brews').append("<li class='historyItem mb-3'>" + index + '</li>');
    });
}

function displayLastSearch () {
    
    let currentCity = searchBrew.value.toUpperCase();
    
    if(!localStorage.getItem('currentCity') || JSON.parse(localStorage.getItem('currentCity')).length === 0){
    
        window.localStorage.setItem('currentCity', JSON.stringify(currentCity));
        return;
    }

    let lastSearch = JSON.parse(localStorage.getItem('currentCity')).split(' ').join('_');
    getBrew(lastSearch);
}

function removeDuplicates(array){
    const result = [];
    const duplicatesIndices = [];

    // Loop through each item in the original array
    array.forEach((current, index) => {
    
        if (duplicatesIndices.includes(index)) return;
    
        result.push(current);
    
        // Loop through each other item on array after the current one
        for (let comparisonIndex = index + 1; comparisonIndex < array.length; comparisonIndex++) {
        
            const comparison = array[comparisonIndex];
            const currentKeys = Object.keys(current);
            const comparisonKeys = Object.keys(comparison);
            
            // Check number of keys in objects
            if (currentKeys.length !== comparisonKeys.length) continue;
            
            // Check key names
            const currentKeysString = currentKeys.sort().join("").toLowerCase();
            const comparisonKeysString = comparisonKeys.sort().join("").toLowerCase();
            if (currentKeysString !== comparisonKeysString) continue;
            
            // Check values
            let valuesEqual = true;
            for (let i = 0; i < currentKeys.length; i++) {
                const key = currentKeys[i];
                if ( current[key] !== comparison[key] ) {
                    valuesEqual = false;
                    break;
                }
            }
            if (valuesEqual) duplicatesIndices.push(comparisonIndex);
            
        } // end for loop

    }); // end array.forEach()
    return result;
};


//Map
function initMap() {

    map = new google.maps.Map(mapEl, {
      
        center: { lat: 37.773972, lng: -122.431297 },
        zoom: 11,
    });
};

function currentMap() {
    
    let currentLoc = { lat: +currentLocation[0].lat, lng: +currentLocation[0].lng }
    
    map = new google.maps.Map(mapEl, {
    
        center: currentLoc,
        zoom: 11,
    });

    let locationMark = new google.maps.Marker ({
    
        position: currentLoc,
        map: map,
    });
}

function brewMap() {
    
    let centerLoc = { lat : +brewCoordArr[0].lat, lng: +brewCoordArr[0].lng};

    map = new google.maps.Map(mapEl, {
    
        center: centerLoc,
        zoom: 10,
    }); 
    
    for(var i=0; i< brewCoordArr.length; i++){
        
        brew = { lat : +brewCoordArr[i].lat, lng: +brewCoordArr[i].lng
    }  
     
    let brewMark = new google.maps.Marker ({
    
        position: brew,
        map: map,
        });
    };
};


clearFavs.addEventListener("click", (e) => {
    favoriteSaves = [];
    localStorage.setItem("favorites", JSON.stringify(favoriteSaves));
    pasteFavorites();
})

clearRecents.addEventListener("click",(e) => {
    recentSearches = [];
    window.localStorage.setItem("pastBrews",JSON.stringify(recentSearches));
    loadRecentSearches();
})


$(document).on('click','.historyItem', function(evt) {
    var value = $(this).text();
    var input = $('#searchBrew');
    input.val(input.val() +value);
    // evt.preventDefault();
    formSubmit();
});

pasteFavorites();
displayLastSearch();
loadRecentSearches();

