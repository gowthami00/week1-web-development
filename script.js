
const API_KEY = "864ce10aacb06d6297cb31571d35cbb9";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherInfo = document.getElementById("weatherInfo");

async function getWeather() {
    const city = cityInput.value.trim();

    // Check whether the user entered a city
    if (city === "") {
        message.textContent = "Please enter a city name.";
        weatherInfo.classList.add("hidden");
        return;
    }

    message.textContent = "Loading weather...";
    weatherInfo.classList.add("hidden");
    searchBtn.disabled = true;

    try {
        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        // Request weather data from the API
        const response = await fetch(url);

        // Convert the response into JavaScript data
        const data = await response.json();

        // Handle errors from the API
        if (!response.ok) {
            throw new Error(data.message || "Unable to get weather.");
        }

        // Display the weather information
        document.getElementById("cityName").textContent =
            `${data.name}, ${data.sys.country}`;

        document.getElementById("temperature").textContent =
            `${Math.round(data.main.temp)}°C`;

        document.getElementById("humidity").textContent =
            `${data.main.humidity}%`;

        document.getElementById("feelsLike").textContent =
            `${Math.round(data.main.feels_like)}°C`;

        document.getElementById("condition").textContent =
            data.weather[0].description;

        // Show an icon that matches the weather
        const weatherType = data.weather[0].main;

        const icons = {
            Clear: "☀️",
            Clouds: "☁️",
            Rain: "🌧️",
            Drizzle: "🌦️",
            Thunderstorm: "⛈️",
            Snow: "❄️",
            Mist: "🌫️",
            Haze: "🌫️",
            Fog: "🌫️"
        };

        document.getElementById("weatherIcon").textContent =
            icons[weatherType] || "🌤️";

        weatherInfo.classList.remove("hidden");
        message.textContent = "";

    } catch (error) {
        message.textContent =
            error.message === "city not found"
                ? "City not found. Please try another city."
                : error.message;

        weatherInfo.classList.add("hidden");

    } finally {
        searchBtn.disabled = false;
    }
}

// Search when the button is clicked
searchBtn.addEventListener("click", getWeather);

// Also search when Enter is pressed
cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});
