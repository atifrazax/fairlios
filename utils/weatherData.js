const axios = require("axios");
require("dotenv").config();

const weatherData = async (lat, lon) => {
    const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`
    );
    return response.data.weather[0].icon;
};

module.exports = weatherData;