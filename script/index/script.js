"use strict"


/////////////////////////////////////////////////////
//             Globals vars:                      //
///////////////////////////////////////////////////

/*I dont like global variables so this was the best solution I could think of*/
/*Getting the map, it should be unique*/
const map = (() => {
    let map;
    return {
        getMap: () => map,
        setMap: (val) => {
            map = val;
        }
    }
})()
/*All parking spots, I used this function so I can easily reorder and then rerender them*/
const parking = (() => {
    let listName = ".js-park-list";
    let parking;
    const addParkToList = () => {
        clearList(listName)
        parking.forEach(addToList(listName))
    }
    return {
        clear: () => clearList(listName),
        getParking: () => parking,
        setParking: (list) => {
            parking = list;
            addParkToList();
        }
    }
})()


/////////////////////////////////////////////////////
//             API functions:                     //
///////////////////////////////////////////////////

/*Code for generating API calls*/
const doFetchRequest = async (url, headers, success, error) => await fetch(url, headers).then(success).catch(error);

const resToJson = (res) => res.json();

const createHeaders = () => {
    return new Headers([['Accept', 'application/json']]);
}

const error = err => $(".js_error").classList.remove("u-hidden");


//////////////////////////////////
//      URL functions:         //
////////////////////////////////

const generate_loc_url = pos => `https://eu1.locationiq.com/v1/reverse.php?key=${LOCATION_KEY}
                                    &lat=${pos.coords.latitude}&lon=${pos.coords.longitude}
                                    &zoom=10&accept-language=native&format=json`;


const generateDistanceUrl = currPos => {
    let url = "https://eu1.locationiq.com/v1/matrix/driving/"
        + currPos.coords.longitude + "," + currPos.coords.latitude + ";"
    return locations => {
        locations.forEach(el => url = addCoordToUrl(url, el.location));
        url = url.slice(0, -1);
        url += `?sources=0&key=${LOCATION_KEY}`;
        return url;
    }
}


const addCoordToUrl = (url, location) => url += location.lng + "," + location.lat + ";";


/*General purpose code
*
* ---------------
* code used for general purpose stuff
* */


//Some Jquerry nostalgia
const $ = tag => document.querySelector(tag);


const isInputValid = () => {
    return $(".js-other-location").value != "";
}

const hideAllErrors = () => {
    $(".js_error_input").classList.add("u-hidden");
    $(".js_error").classList.add("u-hidden");
    $(".js_error_support").classList.add("u-hidden");
}


const changeTextClasses = (tag, content) => {
    let objects = getElClass(tag);
    for (let i = 0; i < objects.length; i++) {
        objects[i].innerHTML = content;
    }
}

const changePlaceHolder = (className, content) => {
    $(`.${className}`).placeholder = content;
}


const getElClass = tag => document.getElementsByClassName(tag);

const capitalize = str => str.toUpperCase();

const createEl = tag => document.createElement(tag);


const generateTitle = (content) => {
    const title = createEl("h3");
    title.innerHTML = content;
    return title;
}

const generateSvg = () => {
    //This could be a lot cleaner
    return `<div class="c-parking-info-extra-icon">
                        <svg class=" c-parking-info-extra-icon__arrow u-fade-in" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 24 24">
                                        <path d="M7,10l5,5,5-5Z"/>
                                    </svg>

                    <svg  class="c-parking-info-extra-icon__minus u-hidden u-faded-out u-fade-in"  viewBox="0 -192 469.33333 469" width="469pt" xmlns="http://www.w3.org/2000/svg">
                        <path d="m437.332031.167969h-405.332031c-17.664062 0-32 14.335937-32 32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0 32-14.335938 32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0"/>
                    </svg>
                    </div>`;
}

const generateTitleText = (arrEl) => {
    const titleText = createEl("div");
    titleText.className = "c-info-title";
    titleText.appendChild(generateTitle(`Naam: <span class="u-info">${arrEl.name}</span>`));
    titleText.appendChild(generateTitle(`Rij tijd: <span class="u-info">${secToMin(arrEl.time)} min</span>`));
    return titleText;
}

const generateTitleContainer = (arrEl) => {
    const titleContainer = createEl("div");
    titleContainer.className = "c-parking-info-title-con js-show-extra";
    titleContainer.appendChild(generateTitleText(arrEl));
    titleContainer.innerHTML += (generateSvg());
    titleContainer.addEventListener('click', showExtraInfo());
    return titleContainer;
}

const generateDescriptionText = (content) => {
    const descText = createEl("h4");
    descText.innerHTML = content;
    return descText;
}

const generateDesContainer = (arrEl) => {
    const descContainer = createEl("div");
    descContainer.className = "c-parking-info-extra js-extra-info-content u-hidden u-faded-out u-fade-in";
    descContainer.appendChild(generateDescriptionText(arrEl.remark ? `<span class="u-info-tag">Opmerking:</span> ${arrEl.remark}` : "Geen opmerking"));
    descContainer.appendChild(generateDescriptionText(`<span class="u-info-tag">Afstand:</span> ${Math.round(arrEl.dist)}km`));
    return descContainer;
}

const generateDivContainer = (arrEl) => {
    const div = createEl("div");
    div.appendChild(generateTitleContainer(arrEl));
    div.appendChild(generateDesContainer(arrEl));
    div.className = "c-parking-info js-extra-info-card ";
    const isNotFree = !checkIfFree(arrEl);
    if (isNotFree) div.className += "js-parking-not-free "
    return div;
}

const addDistMeterToLoc = (distances) => {
    return (park, index) => {
        park.dist = distances[index + 1].distance;
        return park;
    }
}

const addDistTimeToLoc = (distances) => {
    return (park, index) => {
        park.time = distances[index + 1];
        return park;
    }
}


const addToList = (listName) => {
    const list = $(listName);
    return (arrEl) => {
        list.appendChild(generateDivContainer(arrEl));

    }
}

const clearList = name => {
    $(name).innerHTML = "";
}

const secToMin = sec => Math.round(sec / 60);


const generateOrderFunction = field => (a, b) => a[field] > b[field];

const stringHasWord = (str, word) => str.indexOf(word) >= 0;

const checkIfFree = parking => parking.remark && stringHasWord(parking.remark, "gratis");

const wait = time => new Promise(resolve => setTimeout(resolve, time));

/*Loader function*/
const toggleMapAndLoaderGenerator = () => {
    let isLoading = true;
    return () => {
        showMap(isLoading);
        showLoader(isLoading);
        isLoading = !isLoading;
    }
}

const showLoader = isLoading => {
    if (isLoading) $(".js_loader").classList.remove('u-hidden');
    else $(".js_loader").classList.add('u-hidden');
}


const showMap = (isLoading) => {
    if (isLoading) $(".js_map-holder").classList.add('u-hidden');
    else $(".js_map-holder").classList.remove('u-hidden');
}


/////////////////////////////////////////////////////
//             API functions:                     //
///////////////////////////////////////////////////

/*Geolocation stuff*/
const checkSupportGeo = () => !!navigator.geolocation;


const getLocation = (success, error) => {
    if (checkSupportGeo()) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        error();
    }
}

/*Getting your cityname*/
const loadNewLocation = async res => {
    await loadLocationAndParking({
        coords: {
            latitude: res.lat,
            longitude: res.lon
        }
    });
}


/*Getting The parking spots and displaying them*/
const loadLocationAndParking = async pos => {
    const toggleLoading = toggleMapAndLoaderGenerator();
    toggleLoading();
    const resPos = await getAndSetCurrLocationName(pos);
    await wait(500);
    toggleLoading();
    displayLocAndSetMap(pos);
    await loadAndShowParking({"name": resPos.address.city, "coords": pos.coords});
}

/*Load the parking spaces and show them */
const getAndSetCurrLocationName = async (pos) => {
    const resPos = await doFetchRequest(generate_loc_url(pos), createHeaders(), resToJson, error);
    displayLocation(resPos.address.city);
    return resPos;
}

const displayLocation = loc => {
    changeTextClasses('js-location', loc);
    changePlaceHolder('js-other-location', loc);
}


/*Create the map and add own location*/
const displayLocAndSetMap = pos => {
    createMap(pos);
    addOwnLocation(pos);
}

const createMap = pos => {
    map.setMap(new mapboxgl.Map({
        container: 'map',
        attributionControl: false, //need this to show a compact attribution icon (i) instead of the whole text
        style: `https://tiles.locationiq.com/v2/streets/vector.json?key=${LOCATION_KEY}`,
        zoom: 11,
        center: [pos.coords.longitude, pos.coords.latitude]
    }));
}

const addOwnLocation = pos => {
    let el = document.createElement('div')
    el.className = 'marker';
    el.style.backgroundImage = 'url(images/large-blue-cutout.png)';
    el.style.width = '50px';
    el.style.height = '50px';
    new mapboxgl.Marker(el)
        .setLngLat([pos.coords.longitude, pos.coords.latitude])
        .addTo(map.getMap());
}


/*Load all parking data, calc the individual distances and add them to the map*/
const loadAndShowParking = async (loc) => {
    const data = (getParkingByLoc(loc.name))
    if (data != undefined) {
        const parkingSpaces = data.poi_list.filter(hasLocation);
        const distances = await getDistances(generateDistanceUrl(loc), parkingSpaces);
        addParkingToMapAndList(addDistanceToLocation(parkingSpaces, distances));
    } else {
        $(".js_error_support").classList.remove("u-hidden");
        parking.clear();
    }

}


const hasLocation = el => el.location;


const getParkingByLoc = (loc) => {
    let res = SPOOFDATA[`${capitalize(loc)}`];
    return res;
}

const getDistances = async (distanceUrlGenerator, locations) => await doFetchRequest(distanceUrlGenerator(locations), createHeaders(), resToJson, error);

const addDistanceToLocation = (locations, distances) => {
    locations
        .map(addDistMeterToLoc(distances.destinations))
        .map(addDistTimeToLoc(distances.durations[0]))
    locations.sort(generateOrderFunction("time"));
    return locations;
}

const addParkingToMapAndList = parkingSpaces => {
    parking.setParking(parkingSpaces);
    parkingSpaces.forEach(addMarkerToMap);
}

const addMarkerToMap = loc => {
    new mapboxgl.Marker(createMarker())
        .setLngLat([loc.location.lng, loc.location.lat])
        .setPopup(createMarkerPopup(loc))
        .addTo(map.getMap());
}


const createMarker = () => {
    let el = document.createElement('div')
    el.className = 'marker';
    el.style.backgroundImage = 'url(images/marker50px.png)';
    el.style.width = '50px';
    el.style.height = '50px';
    return el;
}

const createMarkerPopup = loc => new mapboxgl.Popup().setHTML(`<span style="color: black"><b>Naam:</b> ${loc.name}<br> <b>Tijd:</b> ${secToMin(loc.time)} min <br> <a href="${generateGoogleMapsLink(loc.location.lat, loc.location.lng)}">Maps</a></span>`);


const generateGoogleMapsLink = (lat, long) => `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;


/////////////////////////////////////////////////////
//             event functions:                   //
///////////////////////////////////////////////////

const showExtraInfo = () => {
    return function (e) { //function om te kunnen werken met this
        [
            this.nextElementSibling,
            this.lastChild.firstElementChild,
            this.lastChild.firstElementChild.nextElementSibling
        ]
            .forEach(el => {
                el.classList.toggle("u-hidden");
                setTimeout(() => {
                    el.classList.toggle("u-faded-out")
                }, 20);
            })

    }
}


const readAndChangLoc = async (e) => {
    hideAllErrors();
    if (isInputValid()) {
        e.preventDefault()
        let url = "https://eu1.locationiq.com/v1/search.php?key=" + LOCATION_KEY + "&q=" + $(".js-other-location").value + "&format=JSON";
        const newLocationCoords = await doFetchRequest(url, createHeaders(), resToJson, error);
        if (newLocationCoords[0]) {
            await wait(500);
            await loadNewLocation(newLocationCoords[0]);
        } else {
            $(".js_error_input").classList.remove("u-hidden");
        }

    } else {
        $(".js_error_input").classList.remove("u-hidden");
    }

}


const checkButton = () => {
    Array.prototype.forEach.call(getElClass("js-parking-not-free"), toggleClass("u-hidden"));
}

/*Function used when looping trough a list to toggle a class */
const toggleClass = className => el => el.classList.toggle(className);

const changeOrder = e => {
    parking.setParking(parking.getParking().sort(generateOrderFunction(e.target.value)));
}


/*Main functions Note: I did not use any outside library*/
const bindButtons = () => {
    $(".js-order-button").addEventListener('change', changeOrder);
    $(".js-hide-not-free").checked = false;
    $(".js-hide-not-free").addEventListener('change', checkButton);
    $(".js-change-loc").addEventListener('click', readAndChangLoc);
}


const main = async () => {
    bindButtons();
    getLocation(loadLocationAndParking, error);
}


document.addEventListener('DOMContentLoaded', () => main());