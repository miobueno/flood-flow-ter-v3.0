const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const floodDiv = document.querySelector(".floodimpact");

const API_KEY = "f52ec2bc997a221e5d8e6a19bae83023";


const createWeatherCard = (cityName, weatherItem, WeatherPETA) => {
	if( WeatherPETA === 0) {
		return `<div class="details">
					<h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
					<h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
					<h6>Wind: ${weatherItem.wind.speed} M/S</h6>
					<h6>Humidity: ${weatherItem.main.humidity}%</h6>
				</div>
				<div class="icon">
					<img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
					<h6>${weatherItem.weather[0].description}</h6>
				</div>`;
	} else {
		return `<li class="card">
					<h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
					<img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
					<h6>Temp: ${ (weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
					<h6>Wind: ${weatherItem.wind.speed} M/S</h6>
					<h6>Humidity: ${weatherItem.main.humidity}%</h6>
				</li>`;
	}
}

const getfloodimpact = (rainfall) => {

	if (rainfall === 0 ){
		return "Floodings are not expected within this time.";
	}

	if (rainfall < 7.5) {
		return "Floodings are not expected within this time.";
	}
	else if (rainfall >= 7.5 && rainfall < 15) {
		return "Ankle-deep floodings are possible. Yellow rainfall warning.";
	}
	else if (rainfall < 15 && rainfall < 30) {
		return "Waist-deep floodings are possible. Orange rainfall warning";
	}
	else {
		return "Severe flooding (roof level). Red rainfall warning."
	}
};

const getRainFallData = (lat, lon) => {
	const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&timezone=auto`
	fetch(API_URL)
	.then(response => response.json())
	.then(data => {
		const rainfall = data.hourly.precipitation.slice(0, 3).reduce((a, b) =>  a + b, 0) || 0;
		const floodimpact = getfloodimpact(rainfall);
	floodDiv.innerHTML =`<h3>Flood Impact Forecast</h3>
	<p>Rainfall (next 3hrs): <strong>${rainfall} mm</strong></p>
	<p>Expected Impact: <span style = "color:red">${floodimpact}</span></p>`;
	})

	.catch(() => {
		floodDiv.innerHTML = `<p>Error fetching rainfall data!</p>`;
	});
};

const getFiveDayRainfall = (lat, lon) => {
	const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&timezone=auto`
	fetch(API_URL)
	.then(response => response.json())
	.then(data => {
		const days = data.daily.time;
		const rainfall = data.daily.precipitation_sum;

		let html = `<ul>`;
		for (let i = 0; i < days.length; i++) {
			const impact = getfloodimpact(rainfall[i]);
			html += `<li>
			<strong>${days[i]}</strong>: ${rainfall[i]} mm
			<br><span style = "color:red">${impact}</span>
			
			</li>`;
		}
	})
		
}

	const getWeatherDetails = (cityName, latitude, longitude) => {
		const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

	fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
	const uniqueForecastDays = [];
	const fiveDaysForecast = data.list.filter(forecast => {
		const forecastDate = new Date(forecast.dt_txt).getDate();
		if (!uniqueForecastDays.includes(forecastDate)) {
			return uniqueForecastDays.push(forecastDate);
		}
	});

	cityInput.value = "";
	currentWeatherDiv.innerHTML = "";
	weatherCardsDiv.innerHTML = "";

	const rainfall = data.list[0].rain ? (data.list[0].rain["3h"] || 0) : 0;
	const floodimpact = getfloodimpact(rainfall);


	fiveDaysForecast.forEach((weatherItem, WeatherPETA) => {
		const html = createWeatherCard(cityName, weatherItem, WeatherPETA);
		if (WeatherPETA === 0) {
			currentWeatherDiv.insertAdjacentHTML("beforeend", html);
	} else {
		weatherCardsDiv.insertAdjacentHTML("beforeend", html);
	}
});
	getRainFallData(latitude, longitude);

	const WindyFrame = document.getElementById("WindyFrame");
	WindyFrame.src = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=7&overlay=rain&marker=${latitude},${longitude}`;
})
.catch((err) => {
		console.error("Weather fetch error:", err);
		currentWeatherDiv = `<p>Error in loading weather data. Please try again later.</p>`
	});
}
	const getCityCoordinates = () => {
		const cityName = cityInput.value.trim();
		if (cityName === "") return;
		const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

		fetch(API_URL).then(response => response.json()).then(data => {
			if(!data.length) return alert(`No coordinates found for ${cityName}`);
			const{ lat, lon, name } = data[0];
			if (data[0].country !== "PH") {
				alert("Only Philippine locations are supported.");
				return;
			}
			getWeatherDetails(name, lat, lon);
		}).catch(() => {
			alert("An error occured while fetching coordinates!");
		});
}
	const getUserCoordinates = () => {
		if (!("geolocation" in navigator)) {
			alert("Geolocation is not supported by your browser. Please enter your city name instead.");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			position => {
				const { latitude, longitude } = position.coords;
				const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
				fetch(API_URL).then(response => response.json()).then(data => {
					if (!data.length) {
						alert("Unable to detect location.");
						return;
					}
					const { name, country } = data [0];
					if (country !== "PH") {
						alert("Only Philippine locations are supported.");
						return;
					}
					getWeatherDetails(name, latitude, longitude);
				}).catch(() => {
					alert("An error occured while fetching the city name!");
				});
			},
			error => {
				if (error.code === error.PERMISSION_DENIED) {
					alert("Geolocation request denied. Please reset location permission to grant access again.");
				} else {
					alert("Geolocation request error. Please reset location permission.");
				}

	});
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

