const API_KEY = "d7c22625f498eae453284e9c79960094";
const CURRENT_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={apiKey}&units=metric&lang=pl`;
const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={apiKey}&units=metric&lang=pl`;

class WeatherApp {
    constructor() {
        this.weatherData = {};
    }

    async getCurrentWeather() {
        const city = document.getElementById("search-input").value.trim();
        if (!city) {
            alert("Wpisz nazwę miasta.");
            return;
        }
        const currentWeatherUrl = this.createUrl(CURRENT_WEATHER_URL, city);
        try {
            const response = await fetch(currentWeatherUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            this.weatherData.current = data;
            await this.getForecast();
            this.displayWeather();
        } catch (error) {
            console.error("Błąd podczas pobierania aktualnej pogody:", error);
        }
    }

    async getForecast() {
        const city = document.getElementById("search-input").value.trim();
        const forecastUrl = this.createUrl(FORECAST_URL, city);
        try {
            const response = await fetch(forecastUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            this.weatherData.forecast = this.processForecastData(data.list);
        } catch (error) {
            console.error("Błąd podczas pobierania prognozy pogody:", error);
        }
    }

    processForecastData(data) {
        const dailyForecast = {};

        data.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toLocaleDateString("pl-PL");

            if (!dailyForecast[dateString]) {
                dailyForecast[dateString] = [];
            }

            dailyForecast[dateString].push(item);
        });

        const dailyAverage = Object.keys(dailyForecast).slice(0, 3).map(date => {
            const dayData = dailyForecast[date];
            const temps = dayData.map(d => d.main.temp);
            const feelsLikeTemps = dayData.map(d => d.main.feels_like);
            const descriptions = dayData.map(d => d.weather[0].description);

            const averageTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            const averageFeelsLike = feelsLikeTemps.reduce((a, b) => a + b, 0) / feelsLikeTemps.length;
            const mostCommonDescription = descriptions.sort((a, b) =>
                descriptions.filter(v => v === a).length - descriptions.filter(v => v === b).length
            ).pop();

            return {
                date,
                temp: averageTemp,
                feels_like: averageFeelsLike,
                description: mostCommonDescription
            };
        });

        return dailyAverage;
    }

    displayWeather() {
        const weatherContainer = document.getElementById("weather-results");
        weatherContainer.innerHTML = '';

        if (!this.weatherData.current || !this.weatherData.forecast) {
            weatherContainer.innerHTML = '<div class="weather-placeholder">Nie znaleziono danych pogodowych.</div>';
            return;
        }

        const currentWeatherCard = this.createWeatherCard(
            `Bieżąca pogoda: ${this.weatherData.current.name}`,
            this.weatherData.current.main.temp,
            this.weatherData.current.main.feels_like,
            this.weatherData.current.weather[0].description
        );
        weatherContainer.appendChild(currentWeatherCard);

        this.weatherData.forecast.forEach(item => {
            const weatherCard = this.createWeatherCard(
                item.date.toLocaleDateString("pl-PL"),
                item.temp,
                item.feels_like,
                item.description
            );
            weatherContainer.appendChild(weatherCard);
        });
    }

    createWeatherCard(dateTime, temperature, feelsLike, description) {
        const card = document.createElement("div");
        card.className = "weather-card";
        card.innerHTML = `
            <h2>${dateTime}</h2>
            <p>Temperatura: ${temperature.toFixed(1)} °C</p>
            <p>Temperatura odczuwalna: ${feelsLike.toFixed(1)} °C</p>
            <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        `;
        return card;
    }

    createUrl(url, city) {
        return url.replace("{apiKey}", API_KEY).replace("{city}", city);
    }
}

const app = new WeatherApp();

document.getElementById("search-button").addEventListener("click", () => {
    app.weatherData = {};
    app.getCurrentWeather();
});
