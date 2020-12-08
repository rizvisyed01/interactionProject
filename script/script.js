"use strict"



/////////////////////////////////////////////////////
//             Globals vars:                      //
///////////////////////////////////////////////////

/*I dont like global variables so this was the best solution I could think of*/

const map = (() => {
    return {
        getMap: () => this.map,
        setMap: (val) => {
            this.map = val;
        }
    }
})()

const parking = (() => {
    this.listName = ".js-park-list";
    const addParkToList = () => {
        clearList(listName)
        this.parking.forEach(addToList(this.listName))
    }
    return {
        getParking: () => this.parking,
        setParking: (list) => {
            this.parking = list;
            addParkToList();
        }
    }
})()



/////////////////////////////////////////////////////
//             API functions:                     //
///////////////////////////////////////////////////


//////////////////////////////////
//      URL functions:         //
////////////////////////////////

const generate_loc_url = pos => `https://eu1.locationiq.com/v1/reverse.php?key=${LOCATION_KEY}
                                    &lat=${pos.coords.latitude}&lon=${pos.coords.longitude}
                                    &zoom=10&accept-language=native&format=json`;

const toJsonUrl = name => `spoofdata/${capitalize(name)}.json`;

const generateDistanceUrl = currPos => {
    let url = "https://eu1.locationiq.com/v1/matrix/driving/"
        + currPos.coords.longitude + "," + currPos.coords.latitude + ";"
    return locations => {
        locations.forEach(el => url = addCoordToUrl(url, el.location))
        url = url.slice(0, -1)
        url += `?sources=0&key=${LOCATION_KEY}`
        return url;
    }
}


const addCoordToUrl = (url, location) => url += location.lng + "," + location.lat + ";"


/*Code for generating API calls*/
const orderApiCall = (url, headers) => {
    return async (next, error) => {
        fetch(url, headers)
            .then(res => res.json())
            .then(next)
            .catch(error)
    }
}

const doFetchRequest = async (url, headers,succes, error)=> await fetch(url, headers).then(succes).catch(error);

const resToJson = (res) => res.json();

const createHeaders = () => {
    return new Headers([['Accept', 'application/json']]);
}

const error = err => console.log(err)


/*General purpose code
*
* ---------------
* code used for general purpose stuff
* */

//todo to array?
const changeTextClasses = (tag, content) => {
    let objects = getElClass(tag)
    for (let i = 0; i < objects.length; i++) {
        objects[i].innerHTML = content
    }
}

const changePlaceHolder = (className, content) => {
    $(`.${className}`).placeholder = content
}

//Some Jquerry nostalgia
const $ = tag => document.querySelector(tag)

const getElClass = tag => document.getElementsByClassName(tag)

const capitalize = str => str.toUpperCase()

const createEl = tag => document.createElement(tag)


const addToList = (listName) => {
    const list = $(listName)
    return (arrEl) => {
        const svg = `<div class="c-parking-info-extra-icon">
                        <svg class=" c-parking-info-extra-icon__arrow u-fade-in" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 24 24">
                                        <path d="M7,10l5,5,5-5Z"/>
                                    </svg>

                    <svg  class="c-parking-info-extra-icon__minus u-hidden u-faded-out u-fade-in"  viewBox="0 -192 469.33333 469" width="469pt" xmlns="http://www.w3.org/2000/svg">
                        <path d="m437.332031.167969h-405.332031c-17.664062 0-32 14.335937-32 32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0 32-14.335938 32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0"/>
                    </svg>
                    </div>`


        let container = createEl("div")
        let titleContainer = createEl("div")

        let titlePart1 = createEl("h3")
        let titlePart2 = createEl("h3")

        let titleText = createEl("div")

        let desCon = createEl("div")
        let desExtra = createEl("h4");
        let distExta = createEl("h4");


        container.className = "c-parking-info js-extra-info-card "

        const isNotFree = !checkIfFree(arrEl)
        if (isNotFree) container.className += "js-parking-not-free "
        if ($('.js-hide-not-free').checked && isNotFree) container.className += "u-hidden"
        titlePart1.innerHTML = `Naam: <span class="u-info">${arrEl.name}</span>`
        titlePart2.innerHTML = `Rij tijd: <span class="u-info">${secToMin(arrEl.time)} min</span>`

        desExtra.innerHTML = arrEl.remark ? `Opmerking: ${arrEl.remark}` : "Geen opmerking";
        distExta.innerHTML = `Afstand: ${Math.round(arrEl.dist)}km`
        desCon.className = "c-parking-info-extra js-extra-info-content u-hidden u-faded-out u-fade-in"

        titleText.className = "c-info-title"


        titleText.appendChild(titlePart1)
        titleText.appendChild(titlePart2)


        titleContainer.className = "c-parking-info-title-con js-show-extra"
        titleContainer.appendChild(titleText)
        titleContainer.innerHTML += svg;
        titleContainer.addEventListener('click', showExtraInfo())

        container.appendChild(titleContainer)
        container.appendChild(desCon)
        desCon.appendChild(distExta)
        desCon.appendChild(desExtra)
        list.appendChild(container)


    }
}

const clearList = name => {
    $(name).innerHTML = ""
}

const secToMin = sec => Math.round(sec / 60)

const convertToKmIfNeeded = m => m

const generateOrderFunction = field => (a, b) => a[field] > b[field];

const stringHasWord = (str, word) => str.indexOf(word) >= 0

const checkIfFree = parking => parking.remark && stringHasWord(parking.remark, "gratis")

const wait = time => new Promise(resolve => setTimeout(resolve, time))


/////////////////////////////////////////////////////
//             API functions:                     //
///////////////////////////////////////////////////

/*Geolocation stuff*/
const checkSupportGeo = () => !!navigator.geolocation;


const getLocation = (succes, error) => {
    //navigator.geolocation.getCurrentPosition(succes, err)
    succes({
        coords: {
            latitude: 50.824567260876336,
            longitude: 3.2515684613064657
        }
    });

}

/*Getting your cityname*/

const loadNewLocation = (res) => {
    loadLocationAndParking({
        coords: {
            latitude: res[0].lat,
            longitude: res[0].lon
        }
    })
}

const loadLocationAndParking = async pos => {
    const resPos = await doFetchRequest(generate_loc_url(pos), createHeaders(), resToJson, error)
    await wait(500) //delay because the API only handles 2 requests per second
    await loadAndShowParking(resPos.address.city, generateDistanceUrl(pos))
    displayLocAndSetMap(pos, resPos)
}



const displayLocAndSetMap = (pos, res)=>{
    displayLocation(res.address.city);
    createMap(pos);
}

/*Load the parking spaces and show them */
const loadAndShowParking = async (loc, distanceUrl) => {
    const call = orderApiCall(toJsonUrl(loc), createHeaders())
    await wait (500)
    await call(calcDistance(distanceUrl), error)
}


const displayLocation = loc => {
    changeTextClasses('js-location', loc)
    changePlaceHolder('js-other-location', loc)
}





const createMap = pos => {
    map.setMap(new mapboxgl.Map({
        container: 'map',
        attributionControl: false, //need this to show a compact attribution icon (i) instead of the whole text
        style: `https://tiles.locationiq.com/v2/streets/vector.json?key=${LOCATION_KEY}`,
        zoom: 11,
        center: [pos.coords.longitude, pos.coords.latitude]
    }));

    addOwnLocation(pos)
}





const addPark = (locations) => {
    return (res) => {
        locations
            .map(addDistMeterToLoc(res.destinations))
            .map(addDistTimeToLoc(res.durations[0]))
        locations.sort(generateOrderFunction("time"))
        console.log(locations);
        parking.setParking(locations);
        addParkToMap(locations)
    }
}


const addDistMeterToLoc = (distances) => {
    return (park, index) => {
        park.dist = distances[index + 1].distance;
        return park
    }
}

const addDistTimeToLoc = (distances) => {
    return (park, index) => {
        park.time = distances[index + 1];
        return park
    }
}


const calcDistance = urlGen => {
    return async res => {
        const locations = res.poi_list.filter(hasLocation)
        const call = orderApiCall(urlGen(locations), createHeaders())
        await call(addPark(locations), error)
    }


}


const addParkToMap = res => {
    res.forEach(addMarkerToMap)
}

const hasLocation = el => el.location


const addMarkerToMap = loc => {
    new mapboxgl.Marker(createMarker())
        .setLngLat([loc.location.lng, loc.location.lat])
        .setPopup(new mapboxgl.Popup()
            .setHTML('<b>Plate Number:</b> SF001<br> <b>Type:</b> Truck'))
        .addTo(map.getMap());
}

const createMarkerPopup = loc => new mapboxgl.Popup().setHTML('<b>Plate Number:</b> SF001<br> <b>Type:</b> Truck');

const locToHtml = loc => `<p>${loc.name}</p>`

const addOwnLocation = pos => {
    let el = document.createElement('div')
    el.className = 'marker';
    el.style.backgroundImage = 'url(images/large-blue-cutout.png)';
    el.style.width = '50px';
    el.style.height = '50px'
    new mapboxgl.Marker(el)
        .setLngLat([pos.coords.longitude, pos.coords.latitude])
        .addTo(map.getMap());

}

const createMarker = () => {
    let el = document.createElement('div')
    el.className = 'marker';
    el.style.backgroundImage = 'url(images/marker50px.png)';
    el.style.width = '50px';
    el.style.height = '50px'
    return el;
}


/////////////////////////////////////////////////////
//             event functions:                   //
///////////////////////////////////////////////////

/*Function used when looping trough a list to toggle a class */
const toggleClass = className => el => el.classList.toggle(className);


/*Change the order of the parking spots based on the value of a select field*/
const changeOrder = e => {
    parking.setParking(parking.getParking().sort(generateOrderFunction(e.target.value)));
}

/*Loop through */
const checkButton = () => {
    Array.prototype.forEach.call(getElClass("js-parking-not-free"), toggleClass("u-hidden"));
}


const readAndChangLoc = async (e) => {
    e.preventDefault()
    let url = "https://eu1.locationiq.com/v1/search.php?key=" + LOCATION_KEY + "&q=" + $(".js-other-location").value + "&format=json";
    const call = orderApiCall(url, createHeaders())
    await call(loadNewLocation, error)


}

/*
    Main functions
    Note: I did not use any outside library
*/
const bindButtons = () => {
    $(".js-order-button").addEventListener('change', changeOrder)
    $(".js-hide-not-free").checked = false;
    $(".js-hide-not-free").addEventListener('change', checkButton)
    $(".js-change-loc").addEventListener('click', readAndChangLoc)
}


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
                }, 20)
            })

    }
}


const main = async () => {
    bindButtons()
    //await loadLocation(getLocation())
    //getLocation(loadLocation, error);
    getLocation(loadLocationAndParking, error);

}

document.addEventListener('DOMContentLoaded', () => main());