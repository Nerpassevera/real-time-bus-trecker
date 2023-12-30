
async function getBusLocations(){
/* * Fetches the current locations of buses on route 1 from the MBTA API.
* @returns {Promise<Object>} A promise that resolves to an object containing bus locations. */
  const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
  const response = await fetch(url);
  const json     = await response.json();
  var buses = json.data;
  var busesLocations = {};
  for (let i = 0; i < buses.length; i++){
    let busId = await buses[i].id;
    let latitude = await buses[i].attributes.latitude;
    let longitude = await buses[i].attributes.longitude;
    busesLocations[busId] = [latitude, longitude];
  }
  return busesLocations;
}


async function createMarkers() {
/**
 * Creates map markers for buses on route 1 and adds them to the map.
 * @returns {Promise<void>} A promise that resolves once the markers are created.
 */
  let busLocations = await getBusLocations();
  for (const [key, value] of Object.entries(busLocations)) {
    addMarker(key, value);
 
  };
  return new Promise((resolve) => {
    move();
  });
}

function addMarker (id, coordinates) {
/**
 * Adds a map marker for a bus with the specified ID and coordinates.
 * @param {string} id - The ID of the bus.
 * @param {number[]} coordinates - The [latitude, longitude] coordinates of the bus.
 */
  let objToPush = {};
    markers[id] = new mapboxgl.Marker()
    .setLngLat([coordinates[1], coordinates[0]])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`<h3>Route id:</h3><p>${id}</p>`)
    )
    .addTo(map)
}

function move() {  
/**
 * Moves the existing markers on the map based on the updated bus locations.
 */
  setInterval(async() => {
    let newBusLocations = await getBusLocations();
    for (const [markerId, location] of Object.entries(markers)) {
      if (Object.keys(newBusLocations).indexOf(markerId) > -1) {
        markers[markerId].setLngLat([newBusLocations[markerId][1], newBusLocations[markerId][0]]);
      }
      else {
        console.log(markerId, " is not in newBusLocs", typeof(markerId));
        console.log("Deleting marker ", markerId);
        delete markers[markerId];
        console.log(`Marker ${markerId}$ has been deleted`);
        console.log(markers);
      };
    }
    for (const [newBusId, newBusCoordinates] of Object.entries(newBusLocations)) {
      if (Object.keys(markers).indexOf(newBusId) < 0) {
        console.log("New bus has started its route: ", newBusId);
        addMarker(newBusId, newBusCoordinates);

      }
    }
  }, 3000);
}

function DisableNextButton(btnId) {
/**
 * Disables the specified button after its first click to prevent creating duplicated markers.
 * @param {string} btnId - The ID of the button to be disabled.
 */
  document.getElementById(btnId).disabled = 'true';
}

mapboxgl.accessToken = 'pk.eyJ1IjoibmVycGEiLCJhIjoiY2xwa2E5MDY3MDY2ZTJpbzF0bGwxbnQ5ZiJ9.blQ3oF4KIvVl68EeggiAlQ';

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/navigation-night-v1',
  center: [-71.095010, 42.358143],
  zoom: 13,
});

const markers = {};

