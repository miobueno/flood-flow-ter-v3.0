var map = L.map('map').setView([11.7833, 124.8833], 12);

L.titleLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
    maxZoom: 19
}).addTo(map);

var floodlayer;
fetch("flood_risk.geojson")
.then(res => res.json())
.then(data => {
    floodlayer = L.geoJSON(data, {
        style: {color: "red", weight: 1, fillOpacity: 0.5}
    }).addTo(map);
});

function searchCity() {
    var city = document.getElementById("searchBox").value;
if (!city) return;
}

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`)
.then(res => res.json())
.then(data => {
    if (data.length > 0) {
 var lat = data[0].lat;
    var lon = data[0].lon;
    map.setView([lat, lon], 12);
    } else {
        alert("City not found.");
    }
})