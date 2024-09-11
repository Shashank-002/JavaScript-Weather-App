const apiKey = '82005d27a116c2880c8f0fcb866998a0';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationName = document.getElementById('location');
const weatherIcon = document.getElementById('weather-icon');
const showWeatherTemperature = document.getElementById('temperature');
const showweatherDescription = document.getElementById('description');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const showcityErrorMessage = document.getElementById('error-message');
const locationErrorMessage = document.getElementById('location-error-message');
const weatherDetails = document.querySelector('.weather-details');

// On page load, get user's location
window.onload = () => {
    showPageLoader(true); 
    showButtonLoader(false); 

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherUsingGeolocation, handleLocationAccessDenied, { timeout: 10000 });
    } else {
        setTimeout(() => {
            showPageLoader(false);
            displayGeolocationUnsupportedError('Geolocation is not supported by this browser.');
        }, 500);
    }
};

// Function to fetch weather data using geolocation coordinates
function fetchWeatherUsingGeolocation(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherDataUsingCoordinates(latitude, longitude, false); // Pass false for initial load
}

// Function to handle the scenario when location access is denied
function handleLocationAccessDenied() {
    setTimeout(() => {
        showPageLoader(false);
        displayLocationAccessDeniedError('Location is not enabled. Please allow location access.');
    }, 500);
    hideWeatherDetailsAndIcon();
}

// Function to fetch weather data based on coordinates (geolocation)
function fetchWeatherDataUsingCoordinates(lat, lon, showButtonLoaderDuringFetch = true) {
    const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetchWeatherDataFromAPI(url, showButtonLoaderDuringFetch);
}

// Function to fetch weather data based on city name (from search input)
function fetchWeatherDataUsingCityName(city) {
    const url = `${apiUrl}?q=${city}&appid=${apiKey}`;
    fetchWeatherDataFromAPI(url, true); // Always show button loader during search
}

// Fetch weather data from the API using the provided URL
async function fetchWeatherDataFromAPI(url, showButtonLoaderDuringFetch) {
    try {
        if (showButtonLoaderDuringFetch) {
            showButtonLoader(true); // Show loading state on search button
        }
        hideLocationErrorMessage();

        // Hide the page loader during search
        showPageLoader(false);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }

        const weatherData = await response.json();
        hideshowcityErrorMessage();
        updateWeatherUIWithFetchedData(weatherData);
    } catch (error) {
        clearWeatherDetailsOnError();
        displayCityNotFoundError(error.message);
    } finally {
        if (showButtonLoaderDuringFetch) {
            showButtonLoader(false); // Reset the search button to normal state
        }
    }
}

// Function to update the UI with fetched weather data
function updateWeatherUIWithFetchedData(data) {
    const temperatureInCelsius = data.main && data.main.temp ? convertKelvinToCelsius(data.main.temp) : 'N/A';
    showWeatherTemperature.textContent = `${temperatureInCelsius}°C`;
    showWeatherTemperature.style.display = 'block';

    showweatherDescription.textContent = data.weather[0].description;
    showweatherDescription.style.display = 'block';

    locationName.textContent = `${data.name}, ${data.sys.country}`;
    locationName.style.display = 'block';

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `./images/${iconCode}.png`;
    weatherIcon.style.display = 'block';

    // Show additional weather details
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind-speed').textContent = (data.wind.speed * 3.6).toFixed(2); // Convert m/s to km/h
    document.getElementById('pressure').textContent = data.main.pressure;
    document.getElementById('feels-like').textContent = convertKelvinToCelsius(data.main.feels_like);

    const currentTime = new Date().getTime() / 1000;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    if (currentTime >= sunrise && currentTime < sunset) {
        document.body.classList.add('day');
        document.body.classList.remove('night');
    } else {
        document.body.classList.add('night');
        document.body.classList.remove('day');
    }
    weatherDetails.style.display = 'grid';
}

// Function to clear the weather details on error
function clearWeatherDetailsOnError() {
    showWeatherTemperature.textContent = '';
    showweatherDescription.textContent = '';
    locationName.textContent = '';
    weatherIcon.style.display = 'none';
    showWeatherTemperature.style.display = 'none';
    showweatherDescription.style.display = 'none';
    locationName.style.display = 'none';
    weatherDetails.style.display = 'none';
}

// Convert temperature from Kelvin to Celsius
function convertKelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Show error message when location access is denied
function displayLocationAccessDeniedError(message) {
    locationErrorMessage.textContent = message;
    locationErrorMessage.style.display = 'block';
}

// Show error message when geolocation is unsupported
function displayGeolocationUnsupportedError(message) {
    locationErrorMessage.textContent = message;
    locationErrorMessage.style.display = 'block';
}

// Hide location error message
function hideLocationErrorMessage() {
    locationErrorMessage.style.display = 'none';
}

// Show error message for city not found
function displayCityNotFoundError(message) {
    showcityErrorMessage.textContent = message;
    showcityErrorMessage.style.display = 'block';
}

// Hide city error message
function hideshowcityErrorMessage() {
    showcityErrorMessage.style.display = 'none';
}

// Hide weather details and icon on error
function hideWeatherDetailsAndIcon() {
    weatherDetails.style.display = 'none';
    weatherIcon.style.display = 'none';
}

// Show or hide the page loader
function showPageLoader(isLoading) {
    loader.style.display = isLoading ? 'flex' : 'none';
}

// Show or hide the button loader
function showButtonLoader(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Loading...' : 'Search';
}

// Add event listener to search button
searchBtn.addEventListener('click', () => {
    const city = document.getElementById('location-input').value.trim();
    if (city) {
        showPageLoader(false); 
        showButtonLoader(true); 
        fetchWeatherDataUsingCityName(city);
    } else {
        alert('Please enter a city name');
    }
});
